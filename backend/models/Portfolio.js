const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'website-development',
      'blog-writing',
      'social-media-content',
      'social-media-design',
      'social-media-management',
      'seo-content',
      'branding'
    ]
  },
  serviceType: [{
    type: String,
    enum: [
      'custom-website-development',
      'blog-writing-seo',
      'social-media-content',
      'social-media-design',
      'social-media-management'
    ]
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  client: {
    name: String,
    company: String,
    industry: String,
    testimonial: {
      content: String,
      rating: {
        type: Number,
        min: 1,
        max: 5
      }
    }
  },
  projectDetails: {
    duration: String, // e.g., "2 weeks", "1 month"
    teamSize: Number,
    technologies: [String],
    challenges: [String],
    solutions: [String]
  },
  results: {
    metrics: [{
      label: String,
      value: String,
      improvement: String // e.g., "+150%", "2x increase"
    }],
    achievements: [String]
  },
  liveUrl: String,
  githubUrl: String,
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
portfolioSchema.index({ category: 1, isPublic: 1 });
portfolioSchema.index({ isFeatured: 1, order: 1 });
portfolioSchema.index({ tags: 1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);
