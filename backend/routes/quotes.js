const express = require('express');
const { body, validationResult } = require('express-validator');
const Quote = require('../models/Quote');
const { protect, authorize } = require('../middleware/auth');
const { sendQuoteNotificationEmail } = require('../utils/emailService');

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

// @desc    Create a new quote request
// @route   POST /api/quotes
// @access  Private (User)
router.post('/', protect, [
  body('services')
    .isArray({ min: 1 })
    .withMessage('At least one service must be selected'),
  body('services.*')
    .isIn([
      'custom-website-development',
      'blog-writing-seo',
      'social-media-content',
      'social-media-design',
      'social-media-management'
    ])
    .withMessage('Invalid service selected'),
  body('projectTitle')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Project title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('budget.min')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Minimum budget must be a positive number'),
  body('budget.max')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Maximum budget must be a positive number')
    .custom((value, { req }) => {
      if (value < req.body.budget.min) {
        throw new Error('Maximum budget must be greater than minimum budget');
      }
      return true;
    }),
  body('timeline')
    .isIn(['1-week', '2-weeks', '1-month', '2-months', '3-months', 'flexible'])
    .withMessage('Invalid timeline selected'),
  body('contactPreference')
    .optional()
    .isIn(['email', 'phone', 'chat'])
    .withMessage('Invalid contact preference'),
  body('additionalInfo')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Additional info cannot exceed 1000 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      services,
      projectTitle,
      description,
      budget,
      timeline,
      priority,
      contactPreference,
      additionalInfo
    } = req.body;

    // Create quote
    const quote = new Quote({
      user: req.user.id,
      services,
      projectTitle,
      description,
      budget,
      timeline,
      priority: priority || 'medium',
      contactPreference: contactPreference || 'email',
      additionalInfo
    });

    await quote.save();

    // Populate user details for response
    await quote.populate('user', 'name email phone company');

    // Send notification email
    try {
      await sendQuoteNotificationEmail(
        req.user.email,
        req.user.name,
        quote._id.toString()
      );
    } catch (emailError) {
      console.error('Error sending quote notification email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully',
      data: { quote }
    });

  } catch (error) {
    console.error('Create quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quote request',
      error: error.message
    });
  }
});

// @desc    Get user's quote requests
// @route   GET /api/quotes/my-quotes
// @access  Private (User)
router.get('/my-quotes', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    // Get quotes with pagination
    const quotes = await Quote.find(query)
      .populate('user', 'name email')
      .populate('adminQuote.quotedBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Quote.countDocuments(query);

    res.json({
      success: true,
      data: {
        quotes,
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
    console.error('Get user quotes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotes',
      error: error.message
    });
  }
});

// @desc    Get single quote
// @route   GET /api/quotes/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate('user', 'name email phone company')
      .populate('adminQuote.quotedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('notes.addedBy', 'name');

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    // Check if user owns the quote or is admin
    if (quote.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this quote'
      });
    }

    res.json({
      success: true,
      data: { quote }
    });

  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quote',
      error: error.message
    });
  }
});

// @desc    Get all quotes (Admin only)
// @route   GET /api/quotes
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const status = req.query.status;
    const priority = req.query.priority;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const search = req.query.search;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    if (search) {
      query.$or = [
        { projectTitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get quotes with pagination
    const quotes = await Quote.find(query)
      .populate('user', 'name email phone company')
      .populate('adminQuote.quotedBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Quote.countDocuments(query);

    // Get statistics
    const stats = await Quote.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        quotes,
        stats,
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
    console.error('Get all quotes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotes',
      error: error.message
    });
  }
});

// @desc    Update quote (User can only update before admin quotes)
// @route   PUT /api/quotes/:id
// @access  Private
router.put('/:id', protect, [
  body('services')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one service must be selected'),
  body('projectTitle')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Project title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    // Check permissions
    if (quote.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this quote'
      });
    }

    // Users can only update if quote is in pending status
    if (req.user.role !== 'admin' && quote.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Quote can only be updated when in pending status'
      });
    }

    // Update fields
    const updateFields = [
      'services', 'projectTitle', 'description', 'budget', 
      'timeline', 'priority', 'contactPreference', 'additionalInfo'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        quote[field] = req.body[field];
      }
    });

    await quote.save();

    await quote.populate('user', 'name email phone company');

    res.json({
      success: true,
      message: 'Quote updated successfully',
      data: { quote }
    });

  } catch (error) {
    console.error('Update quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quote',
      error: error.message
    });
  }
});

// @desc    Admin quote response
// @route   PUT /api/quotes/:id/admin-quote
// @access  Private (Admin)
router.put('/:id/admin-quote', protect, authorize('admin'), [
  body('amount')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Quote amount must be a positive number'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Quote description must be between 10 and 1000 characters'),
  body('deliveryTime')
    .notEmpty()
    .withMessage('Delivery time is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { amount, description, deliveryTime } = req.body;

    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    // Update quote with admin response
    quote.adminQuote = {
      amount,
      description,
      deliveryTime,
      quotedBy: req.user.id,
      quotedAt: new Date()
    };
    quote.status = 'quoted';

    await quote.save();

    await quote.populate([
      { path: 'user', select: 'name email phone company' },
      { path: 'adminQuote.quotedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Quote response sent successfully',
      data: { quote }
    });

  } catch (error) {
    console.error('Admin quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send quote response',
      error: error.message
    });
  }
});

// @desc    Update quote status
// @route   PUT /api/quotes/:id/status
// @access  Private (Admin)
router.put('/:id/status', protect, authorize('admin'), [
  body('status')
    .isIn(['pending', 'reviewing', 'quoted', 'accepted', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const { status, note } = req.body;

    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    quote.status = status;

    // Add note if provided
    if (note) {
      quote.notes.push({
        content: note,
        addedBy: req.user.id
      });
    }

    await quote.save();

    await quote.populate('user', 'name email');

    res.json({
      success: true,
      message: 'Quote status updated successfully',
      data: { quote }
    });

  } catch (error) {
    console.error('Update quote status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quote status',
      error: error.message
    });
  }
});

// @desc    Delete quote
// @route   DELETE /api/quotes/:id
// @access  Private (User can delete own pending quotes, Admin can delete any)
router.delete('/:id', protect, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    // Check permissions
    if (quote.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quote'
      });
    }

    // Users can only delete pending quotes
    if (req.user.role !== 'admin' && quote.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending quotes can be deleted'
      });
    }

    await Quote.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Quote deleted successfully'
    });

  } catch (error) {
    console.error('Delete quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quote',
      error: error.message
    });
  }
});

module.exports = router;
