const express = require('express');
const { body, validationResult } = require('express-validator');
const Portfolio = require('../models/Portfolio');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

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

// @desc    Get all public portfolio items
// @route   GET /api/portfolio
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const category = req.query.category;
    const serviceType = req.query.serviceType;
    const featured = req.query.featured;
    const sortBy = req.query.sortBy || 'order';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    // Build query - only show public portfolio items
    const query = { isPublic: true };
    
    if (category) query.category = category;
    if (serviceType) query.serviceType = { $in: [serviceType] };
    if (featured === 'true') query.isFeatured = true;

    const portfolioItems = await Portfolio.find(query)
      .populate('createdBy', 'name')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Portfolio.countDocuments(query);

    // Get categories for filter
    const categories = await Portfolio.distinct('category', { isPublic: true });
    
    // Get service types for filter
    const serviceTypes = await Portfolio.distinct('serviceType', { isPublic: true });

    res.json({
      success: true,
      data: {
        portfolioItems,
        categories,
        serviceTypes: [].concat(...serviceTypes), // Flatten array since serviceType is array field
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
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio items',
      error: error.message
    });
  }
});

// @desc    Get all portfolio items (Admin)
// @route   GET /api/portfolio/admin
// @access  Private (Admin)
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const category = req.query.category;
    const isPublic = req.query.isPublic;
    const isFeatured = req.query.isFeatured;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = {};
    if (category) query.category = category;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const portfolioItems = await Portfolio.find(query)
      .populate('createdBy', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Portfolio.countDocuments(query);

    // Get statistics
    const stats = await Portfolio.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          publicItems: { $sum: { $cond: ['$isPublic', 1, 0] } },
          featuredItems: { $sum: { $cond: ['$isFeatured', 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        portfolioItems,
        stats: stats[0] || { totalItems: 0, publicItems: 0, featuredItems: 0 },
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
    console.error('Get admin portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio items',
      error: error.message
    });
  }
});

// @desc    Get single portfolio item
// @route   GET /api/portfolio/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const portfolioItem = await Portfolio.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Check if portfolio item is accessible
    if (!portfolioItem.isPublic) {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(404).json({
          success: false,
          message: 'Portfolio item not found'
        });
      }
    }

    // Get related portfolio items
    const relatedItems = await Portfolio.find({
      _id: { $ne: portfolioItem._id },
      category: portfolioItem.category,
      isPublic: true
    })
    .populate('createdBy', 'name')
    .limit(3)
    .sort({ order: 1 });

    res.json({
      success: true,
      data: {
        portfolioItem,
        relatedItems
      }
    });

  } catch (error) {
    console.error('Get portfolio item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio item',
      error: error.message
    });
  }
});

// @desc    Create portfolio item (Admin)
// @route   POST /api/portfolio
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('category')
    .isIn([
      'website-development',
      'blog-writing',
      'social-media-content',
      'social-media-design',
      'social-media-management',
      'seo-content',
      'branding'
    ])
    .withMessage('Invalid category'),
  body('serviceType')
    .optional()
    .isArray()
    .withMessage('Service type must be an array'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  body('images.*.url')
    .isURL()
    .withMessage('Invalid image URL')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      serviceType,
      images,
      client,
      projectDetails,
      results,
      liveUrl,
      githubUrl,
      tags,
      isFeatured,
      isPublic,
      order
    } = req.body;

    const portfolioItem = new Portfolio({
      title,
      description,
      category,
      serviceType: serviceType || [],
      images,
      client,
      projectDetails,
      results,
      liveUrl,
      githubUrl,
      tags: tags || [],
      isFeatured: isFeatured || false,
      isPublic: isPublic !== undefined ? isPublic : true,
      order: order || 0,
      createdBy: req.user.id
    });

    await portfolioItem.save();

    await portfolioItem.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Portfolio item created successfully',
      data: { portfolioItem }
    });

  } catch (error) {
    console.error('Create portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create portfolio item',
      error: error.message
    });
  }
});

// @desc    Update portfolio item (Admin)
// @route   PUT /api/portfolio/:id
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('category')
    .optional()
    .isIn([
      'website-development',
      'blog-writing',
      'social-media-content',
      'social-media-design',
      'social-media-management',
      'seo-content',
      'branding'
    ])
    .withMessage('Invalid category'),
  body('images')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Invalid image URL')
], handleValidationErrors, async (req, res) => {
  try {
    const portfolioItem = await Portfolio.findById(req.params.id);

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    const {
      title,
      description,
      category,
      serviceType,
      images,
      client,
      projectDetails,
      results,
      liveUrl,
      githubUrl,
      tags,
      isFeatured,
      isPublic,
      order
    } = req.body;

    // Update fields
    if (title) portfolioItem.title = title;
    if (description) portfolioItem.description = description;
    if (category) portfolioItem.category = category;
    if (serviceType) portfolioItem.serviceType = serviceType;
    if (images) portfolioItem.images = images;
    if (client) portfolioItem.client = client;
    if (projectDetails) portfolioItem.projectDetails = projectDetails;
    if (results) portfolioItem.results = results;
    if (liveUrl) portfolioItem.liveUrl = liveUrl;
    if (githubUrl) portfolioItem.githubUrl = githubUrl;
    if (tags) portfolioItem.tags = tags;
    if (isFeatured !== undefined) portfolioItem.isFeatured = isFeatured;
    if (isPublic !== undefined) portfolioItem.isPublic = isPublic;
    if (order !== undefined) portfolioItem.order = order;

    await portfolioItem.save();

    await portfolioItem.populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Portfolio item updated successfully',
      data: { portfolioItem }
    });

  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio item',
      error: error.message
    });
  }
});

// @desc    Toggle featured status (Admin)
// @route   PUT /api/portfolio/:id/featured
// @access  Private (Admin)
router.put('/:id/featured', protect, authorize('admin'), async (req, res) => {
  try {
    const portfolioItem = await Portfolio.findById(req.params.id);

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    portfolioItem.isFeatured = !portfolioItem.isFeatured;
    await portfolioItem.save();

    res.json({
      success: true,
      message: `Portfolio item ${portfolioItem.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: {
        id: portfolioItem._id,
        isFeatured: portfolioItem.isFeatured
      }
    });

  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status',
      error: error.message
    });
  }
});

// @desc    Toggle public status (Admin)
// @route   PUT /api/portfolio/:id/public
// @access  Private (Admin)
router.put('/:id/public', protect, authorize('admin'), async (req, res) => {
  try {
    const portfolioItem = await Portfolio.findById(req.params.id);

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    portfolioItem.isPublic = !portfolioItem.isPublic;
    await portfolioItem.save();

    res.json({
      success: true,
      message: `Portfolio item ${portfolioItem.isPublic ? 'published' : 'unpublished'} successfully`,
      data: {
        id: portfolioItem._id,
        isPublic: portfolioItem.isPublic
      }
    });

  } catch (error) {
    console.error('Toggle public error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle public status',
      error: error.message
    });
  }
});

// @desc    Delete portfolio item (Admin)
// @route   DELETE /api/portfolio/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const portfolioItem = await Portfolio.findById(req.params.id);

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    await Portfolio.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Portfolio item deleted successfully'
    });

  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete portfolio item',
      error: error.message
    });
  }
});

// @desc    Reorder portfolio items (Admin)
// @route   PUT /api/portfolio/reorder
// @access  Private (Admin)
router.put('/reorder', protect, authorize('admin'), [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items array is required'),
  body('items.*.id')
    .isMongoId()
    .withMessage('Invalid portfolio item ID'),
  body('items.*.order')
    .isNumeric()
    .withMessage('Order must be a number')
], handleValidationErrors, async (req, res) => {
  try {
    const { items } = req.body;

    // Update order for each item
    const updatePromises = items.map(item =>
      Portfolio.findByIdAndUpdate(item.id, { order: item.order })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Portfolio items reordered successfully'
    });

  } catch (error) {
    console.error('Reorder portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder portfolio items',
      error: error.message
    });
  }
});

module.exports = router;
