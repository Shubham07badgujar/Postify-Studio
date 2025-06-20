const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  services: [{
    type: String,
    enum: [
      'custom-website-development',
      'blog-writing-seo',
      'social-media-content',
      'social-media-design',
      'social-media-management'
    ],
    required: true
  }],
  projectTitle: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Project title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  budget: {
    min: {
      type: Number,
      required: true,
      min: [0, 'Budget cannot be negative']
    },
    max: {
      type: Number,
      required: true,
      min: [0, 'Budget cannot be negative']
    }
  },
  timeline: {
    type: String,
    enum: ['1-week', '2-weeks', '1-month', '2-months', '3-months', 'flexible'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'quoted', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  adminQuote: {
    amount: {
      type: Number,
      min: [0, 'Quote amount cannot be negative']
    },
    description: {
      type: String,
      maxlength: [1000, 'Quote description cannot exceed 1000 characters']
    },
    deliveryTime: {
      type: String
    },
    quotedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    quotedAt: {
      type: Date
    }
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  contactPreference: {
    type: String,
    enum: ['email', 'phone', 'chat'],
    default: 'email'
  },
  additionalInfo: {
    type: String,
    maxlength: [1000, 'Additional info cannot exceed 1000 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
quoteSchema.index({ user: 1, status: 1 });
quoteSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Quote', quoteSchema);
