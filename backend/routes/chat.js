const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @desc    Get or create chat with admin
// @route   GET /api/chat/admin
// @access  Private (User)
router.get('/admin', protect, async (req, res) => {
  try {
    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Look for existing chat
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, admin._id] }
    }).populate('participants', 'name email avatar role');

    // Create new chat if none exists
    if (!chat) {
      chat = new Chat({
        participants: [req.user.id, admin._id],
        messages: []
      });
      await chat.save();
      await chat.populate('participants', 'name email avatar role');
    }

    res.json({
      success: true,
      data: { chat }
    });

  } catch (error) {
    console.error('Get admin chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat',
      error: error.message
    });
  }
});

// @desc    Get all user chats (Admin only)
// @route   GET /api/chat
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({ isActive: true })
      .populate('participants', 'name email avatar role')
      .populate('lastMessage.sender', 'name')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Chat.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        chats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message
    });
  }
});

// @desc    Get single chat
// @route   GET /api/chat/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email avatar role')
      .populate('messages.sender', 'name avatar');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant or admin
    const isParticipant = chat.participants.some(
      participant => participant._id.toString() === req.user.id
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this chat'
      });
    }

    // Mark messages as read for current user
    const updateQuery = req.user.role === 'admin' 
      ? { 'unreadCount.admin': 0 }
      : { 'unreadCount.user': 0 };
    
    await Chat.findByIdAndUpdate(req.params.id, updateQuery);

    res.json({
      success: true,
      data: { chat }
    });

  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat',
      error: error.message
    });
  }
});

// @desc    Send message
// @route   POST /api/chat/:id/messages
// @access  Private
router.post('/:id/messages', protect, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file'])
    .withMessage('Invalid message type')
], handleValidationErrors, async (req, res) => {
  try {
    const { content, messageType = 'text' } = req.body;

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      participant => participant.toString() === req.user.id
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this chat'
      });
    }

    // Create message
    const message = {
      sender: req.user.id,
      content,
      messageType,
      sentAt: new Date()
    };

    chat.messages.push(message);

    // Update last message
    chat.lastMessage = {
      content,
      sender: req.user.id,
      sentAt: message.sentAt
    };

    // Update unread count
    if (req.user.role === 'admin') {
      chat.unreadCount.user += 1;
    } else {
      chat.unreadCount.admin += 1;
    }

    await chat.save();

    // Get the saved message with populated sender
    const savedChat = await Chat.findById(chat._id)
      .populate('messages.sender', 'name avatar')
      .populate('participants', 'name email avatar role');

    const savedMessage = savedChat.messages[savedChat.messages.length - 1];

    // Emit socket event
    const io = req.app.get('io');
    
    // Send to all participants
    chat.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id) {
        io.to(participantId.toString()).emit('receive-message', {
          chatId: chat._id,
          message: savedMessage,
          senderId: req.user.id
        });
      }
    });

    // Send to admin room if sender is not admin
    if (req.user.role !== 'admin') {
      io.to('admin').emit('receive-message', {
        chatId: chat._id,
        message: savedMessage,
        senderId: req.user.id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: savedMessage }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// @desc    Mark messages as read
// @route   PUT /api/chat/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      participant => participant.toString() === req.user.id
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    // Reset unread count for current user
    if (req.user.role === 'admin') {
      chat.unreadCount.admin = 0;
    } else {
      chat.unreadCount.user = 0;
    }

    // Mark unread messages as read
    chat.messages.forEach(message => {
      if (!message.isRead && message.sender.toString() !== req.user.id) {
        message.isRead = true;
        message.readAt = new Date();
      }
    });

    await chat.save();

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
});

// @desc    Get unread message count
// @route   GET /api/chat/unread-count
// @access  Private
router.get('/unread-count/all', protect, async (req, res) => {
  try {
    let unreadCount = 0;

    if (req.user.role === 'admin') {
      // For admin, get total unread from all chats
      const chats = await Chat.find({ isActive: true });
      unreadCount = chats.reduce((total, chat) => total + chat.unreadCount.admin, 0);
    } else {
      // For user, get unread from their chats with admin
      const chats = await Chat.find({
        participants: req.user.id,
        isActive: true
      });
      unreadCount = chats.reduce((total, chat) => total + chat.unreadCount.user, 0);
    }

    res.json({
      success: true,
      data: { unreadCount }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
});

// @desc    Delete chat (Admin only)
// @route   DELETE /api/chat/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Soft delete - mark as inactive
    chat.isActive = false;
    await chat.save();

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat',
      error: error.message
    });
  }
});

module.exports = router;
