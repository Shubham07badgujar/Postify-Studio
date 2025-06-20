const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Quote = require('../models/Quote');
const Blog = require('../models/Blog');
const Portfolio = require('../models/Portfolio');
const { requireAdmin } = require('../middleware/auth');

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalQuotes,
      pendingQuotes,
      activeProjects,
      blogPosts,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Quote.countDocuments(),
      Quote.countDocuments({ status: 'pending' }),
      Quote.countDocuments({ status: 'in_progress' }),
      Blog.countDocuments({ status: 'published' }),
      // Mock revenue calculation - in real app, you'd have a Payment model
      Promise.resolve(25000)
    ]);

    res.json({
      totalUsers,
      totalQuotes,
      pendingQuotes,
      activeProjects,
      blogPosts,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
});

// Get all users with pagination and filters
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = ''
    } = req.query;

    const query = { role: { $ne: 'admin' } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Get all quotes with pagination and filters
router.get('/quotes', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = '',
      projectType = '',
      search = ''
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (projectType) {
      query.projectType = { $regex: projectType, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const quotes = await Quote.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Quote.countDocuments(query);

    res.json({
      quotes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quotes', error: error.message });
  }
});

// Update quote status
router.put('/quotes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, estimatedCost, estimatedDuration } = req.body;

    const quote = await Quote.findByIdAndUpdate(
      id,
      {
        status,
        adminNotes,
        estimatedCost,
        estimatedDuration,
        reviewedAt: new Date(),
        reviewedBy: req.user.id
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // TODO: Send email notification to user about quote status update

    res.json({ message: 'Quote updated successfully', quote });
  } catch (error) {
    res.status(500).json({ message: 'Error updating quote', error: error.message });
  }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const [
      userRegistrations,
      quoteSubmissions,
      blogViews,
      portfolioViews
    ] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: startDate }, role: { $ne: 'admin' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Quote.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Mock blog views - in real app, you'd track this
      Promise.resolve([]),
      // Mock portfolio views - in real app, you'd track this
      Promise.resolve([])
    ]);

    res.json({
      userRegistrations,
      quoteSubmissions,
      blogViews,
      portfolioViews
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

module.exports = router;
