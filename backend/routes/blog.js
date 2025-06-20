const express = require('express');
const { body, validationResult } = require('express-validator');
const Blog = require('../models/Blog');
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

// @desc    Get all published blogs (Public)
// @route   GET /api/blog
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const category = req.query.category;
    const tag = req.query.tag;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'publishedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query - only show published blogs for public access
    const query = { status: 'published', isPublic: true };
    
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name avatar')
      .select('-content') // Don't include full content in list view
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    // Get categories for filter
    const categories = await Blog.distinct('category', { status: 'published', isPublic: true });
    
    // Get popular tags
    const popularTags = await Blog.aggregate([
      { $match: { status: 'published', isPublic: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        blogs,
        categories,
        popularTags: popularTags.map(tag => ({ name: tag._id, count: tag.count })),
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
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
});

// @desc    Get all blogs (Admin)
// @route   GET /api/blog/admin
// @access  Private (Admin)
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const status = req.query.status;
    const category = req.query.category;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name email avatar')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    // Get statistics
    const stats = await Blog.aggregate([
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
        blogs,
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
    console.error('Get admin blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
});

// @desc    Get single blog by slug
// @route   GET /api/blog/:slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if blog is accessible
    if (blog.status !== 'published' || !blog.isPublic) {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(404).json({
          success: false,
          message: 'Blog not found'
        });
      }
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    // Get related blogs
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      category: blog.category,
      status: 'published',
      isPublic: true
    })
    .populate('author', 'name avatar')
    .select('-content')
    .limit(3)
    .sort({ publishedAt: -1 });

    res.json({
      success: true,
      data: {
        blog,
        relatedBlogs
      }
    });

  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message
    });
  }
});

// @desc    Create blog (Admin)
// @route   POST /api/blog
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('excerpt')
    .trim()
    .isLength({ min: 20, max: 300 })
    .withMessage('Excerpt must be between 20 and 300 characters'),
  body('content')
    .trim()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters'),
  body('category')
    .isIn([
      'web-development',
      'seo',
      'social-media',
      'content-writing',
      'digital-marketing',
      'design',
      'tutorials',
      'case-studies',
      'news'
    ])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      featuredImage,
      status,
      seo,
      isPublic
    } = req.body;

    // Generate slug from title
    let slug = title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    // Ensure slug is unique
    let slugExists = await Blog.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${slug}-${counter}`;
      slugExists = await Blog.findOne({ slug });
      counter++;
    }

    const blog = new Blog({
      title,
      slug,
      excerpt,
      content,
      category,
      tags: tags || [],
      featuredImage,
      status: status || 'draft',
      author: req.user.id,
      seo,
      isPublic: isPublic !== undefined ? isPublic : true
    });

    await blog.save();

    await blog.populate('author', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog }
    });

  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog',
      error: error.message
    });
  }
});

// @desc    Update blog (Admin)
// @route   PUT /api/blog/:id
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ min: 20, max: 300 })
    .withMessage('Excerpt must be between 20 and 300 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters'),
  body('category')
    .optional()
    .isIn([
      'web-development',
      'seo',
      'social-media',
      'content-writing',
      'digital-marketing',
      'design',
      'tutorials',
      'case-studies',
      'news'
    ])
    .withMessage('Invalid category'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status')
], handleValidationErrors, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const {
      title,
      excerpt,
      content,
      category,
      tags,
      featuredImage,
      status,
      seo,
      isPublic
    } = req.body;

    // Update fields
    if (title) {
      blog.title = title;
      // Update slug if title changed
      blog.slug = title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
    }
    if (excerpt) blog.excerpt = excerpt;
    if (content) blog.content = content;
    if (category) blog.category = category;
    if (tags) blog.tags = tags;
    if (featuredImage) blog.featuredImage = featuredImage;
    if (status) blog.status = status;
    if (seo) blog.seo = seo;
    if (isPublic !== undefined) blog.isPublic = isPublic;

    await blog.save();

    await blog.populate('author', 'name avatar');

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: { blog }
    });

  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: error.message
    });
  }
});

// @desc    Delete blog (Admin)
// @route   DELETE /api/blog/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });

  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: error.message
    });
  }
});

// @desc    Add comment to blog
// @route   POST /api/blog/:id/comments
// @access  Private
router.post('/:id/comments', protect, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const { content } = req.body;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.status !== 'published' || !blog.isPublic) {
      return res.status(400).json({
        success: false,
        message: 'Cannot comment on this blog'
      });
    }

    blog.comments.push({
      user: req.user.id,
      content,
      isApproved: false // Comments need admin approval
    });

    await blog.save();

    await blog.populate('comments.user', 'name avatar');

    const newComment = blog.comments[blog.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully. It will be visible after admin approval.',
      data: { comment: newComment }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

// @desc    Approve/Reject comment (Admin)
// @route   PUT /api/blog/:id/comments/:commentId/approve
// @access  Private (Admin)
router.put('/:id/comments/:commentId/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const { isApproved } = req.body;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const comment = blog.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    comment.isApproved = isApproved;
    await blog.save();

    res.json({
      success: true,
      message: `Comment ${isApproved ? 'approved' : 'rejected'} successfully`
    });

  } catch (error) {
    console.error('Approve comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment',
      error: error.message
    });
  }
});

// @desc    Like/Unlike blog
// @route   PUT /api/blog/:id/like
// @access  Private
router.put('/:id/like', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const existingLike = blog.likes.find(
      like => like.user.toString() === req.user.id
    );

    if (existingLike) {
      // Unlike
      blog.likes = blog.likes.filter(
        like => like.user.toString() !== req.user.id
      );
    } else {
      // Like
      blog.likes.push({ user: req.user.id });
    }

    await blog.save();

    res.json({
      success: true,
      message: existingLike ? 'Blog unliked' : 'Blog liked',
      data: {
        liked: !existingLike,
        likesCount: blog.likes.length
      }
    });

  } catch (error) {
    console.error('Like blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update like',
      error: error.message
    });
  }
});

module.exports = router;
