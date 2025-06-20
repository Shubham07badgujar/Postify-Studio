const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['USD', 'INR', 'EUR', 'GBP']
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'razorpay'],
    required: true
  },
  paymentGatewayId: {
    type: String,
    required: true
  },
  paymentIntentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    cardBrand: String,
    cardLast4: String,
    receipt_url: String,
    receipt_email: String
  },
  invoice: {
    invoiceNumber: {
      type: String,
      unique: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    dueDate: Date,
    paidDate: Date,
    invoiceUrl: String
  },
  refund: {
    refundId: String,
    refundAmount: Number,
    refundReason: String,
    refundedAt: Date,
    refundStatus: {
      type: String,
      enum: ['pending', 'succeeded', 'failed']
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  webhookEvents: [{
    eventType: String,
    eventId: String,
    processedAt: {
      type: Date,
      default: Date.now
    }
  }],
  failureReason: String,
  notes: String
}, {
  timestamps: true
});

// Generate invoice number
paymentSchema.pre('save', function(next) {
  if (!this.invoice.invoiceNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.invoice.invoiceNumber = `INV-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Index for better query performance
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ quote: 1 });
paymentSchema.index({ 'invoice.invoiceNumber': 1 });

module.exports = mongoose.model('Payment', paymentSchema);
