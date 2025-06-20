const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Quote = require('../models/Quote');
const { protect, authorize } = require('../middleware/auth');
const { sendPaymentConfirmationEmail } = require('../utils/emailService');
const { formatCurrency } = require('../utils/helpers');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

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

// @desc    Create Stripe payment intent
// @route   POST /api/payments/stripe/create-intent
// @access  Private (User)
router.post('/stripe/create-intent', protect, [
  body('quoteId')
    .isMongoId()
    .withMessage('Invalid quote ID'),
  body('amount')
    .isNumeric()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .optional()
    .isIn(['USD', 'INR', 'EUR', 'GBP'])
    .withMessage('Invalid currency')
], handleValidationErrors, async (req, res) => {
  try {
    const { quoteId, amount, currency = 'INR' } = req.body;

    // Verify quote exists and belongs to user
    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    if (quote.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this quote'
      });
    }

    if (quote.status !== 'quoted' && quote.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Quote is not ready for payment'
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      quote: quoteId,
      status: { $in: ['pending', 'processing', 'succeeded'] }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this quote'
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        quoteId: quoteId,
        userId: req.user.id
      }
    });

    // Create payment record
    const payment = new Payment({
      user: req.user.id,
      quote: quoteId,
      amount,
      currency,
      paymentMethod: 'stripe',
      paymentGatewayId: paymentIntent.id,
      paymentIntentId: paymentIntent.id,
      status: 'pending'
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment intent created successfully',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id
      }
    });

  } catch (error) {
    console.error('Create Stripe payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
});

// @desc    Create Razorpay order
// @route   POST /api/payments/razorpay/create-order
// @access  Private (User)
router.post('/razorpay/create-order', protect, [
  body('quoteId')
    .isMongoId()
    .withMessage('Invalid quote ID'),
  body('amount')
    .isNumeric()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .optional()
    .isIn(['INR'])
    .withMessage('Invalid currency for Razorpay')
], handleValidationErrors, async (req, res) => {
  try {
    const { quoteId, amount, currency = 'INR' } = req.body;

    // Verify quote exists and belongs to user
    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    if (quote.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this quote'
      });
    }

    if (quote.status !== 'quoted' && quote.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Quote is not ready for payment'
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      quote: quoteId,
      status: { $in: ['pending', 'processing', 'succeeded'] }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this quote'
      });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      notes: {
        quoteId: quoteId,
        userId: req.user.id
      }
    });

    // Create payment record
    const payment = new Payment({
      user: req.user.id,
      quote: quoteId,
      amount,
      currency,
      paymentMethod: 'razorpay',
      paymentGatewayId: order.id,
      status: 'pending'
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment._id
      }
    });

  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.message
    });
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/payments/razorpay/verify
// @access  Private (User)
router.post('/razorpay/verify', protect, [
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Razorpay payment ID is required'),
  body('razorpay_signature')
    .notEmpty()
    .withMessage('Razorpay signature is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Find payment by order ID
    const payment = await Payment.findOne({
      paymentGatewayId: razorpay_order_id,
      user: req.user.id
    }).populate('quote');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment status
    payment.status = 'succeeded';
    payment.paymentDetails = {
      razorpay_payment_id,
      razorpay_signature
    };
    payment.invoice.paidDate = new Date();

    await payment.save();

    // Update quote status
    await Quote.findByIdAndUpdate(payment.quote._id, {
      status: 'accepted'
    });

    // Send confirmation email
    try {
      await sendPaymentConfirmationEmail(
        req.user.email,
        req.user.name,
        {
          invoiceNumber: payment.invoice.invoiceNumber,
          amount: payment.amount,
          currency: payment.currency,
          paidDate: payment.invoice.paidDate,
          paymentMethod: 'Razorpay'
        }
      );
    } catch (emailError) {
      console.error('Error sending payment confirmation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        payment: {
          id: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          invoiceNumber: payment.invoice.invoiceNumber
        }
      }
    });

  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

// @desc    Get user's payments
// @route   GET /api/payments/my-payments
// @access  Private (User)
router.get('/my-payments', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = { user: req.user.id };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('quote', 'projectTitle status adminQuote')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: {
        payments,
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
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
});

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const status = req.query.status;
    const paymentMethod = req.query.paymentMethod;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('quote', 'projectTitle status')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    // Get statistics
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get revenue statistics
    const revenueStats = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          averageOrderValue: { $avg: '$amount' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        payments,
        stats,
        revenueStats: revenueStats[0] || { totalRevenue: 0, averageOrderValue: 0, totalTransactions: 0 },
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
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email phone company')
      .populate('quote', 'projectTitle description status adminQuote');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns the payment or is admin
    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    res.json({
      success: true,
      data: { payment }
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
});

// @desc    Update payment status (Admin)
// @route   PUT /api/payments/:id/status
// @access  Private (Admin)
router.put('/:id/status', protect, authorize('admin'), [
  body('status')
    .isIn(['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    payment.status = status;
    if (notes) payment.notes = notes;

    // Update paid date if status is succeeded
    if (status === 'succeeded' && !payment.invoice.paidDate) {
      payment.invoice.paidDate = new Date();
    }

    await payment.save();

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: { payment }
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
});

// @desc    Stripe webhook handler
// @route   POST /api/payments/stripe/webhook
// @access  Public (Webhook)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Find payment by payment intent ID
        const payment = await Payment.findOne({
          paymentIntentId: paymentIntent.id
        }).populate('user').populate('quote');

        if (payment) {
          payment.status = 'succeeded';
          payment.paymentDetails = {
            cardBrand: paymentIntent.charges.data[0]?.payment_method_details?.card?.brand,
            cardLast4: paymentIntent.charges.data[0]?.payment_method_details?.card?.last4,
            receipt_url: paymentIntent.charges.data[0]?.receipt_url
          };
          payment.invoice.paidDate = new Date();
          
          // Add webhook event
          payment.webhookEvents.push({
            eventType: event.type,
            eventId: event.id
          });

          await payment.save();

          // Update quote status
          await Quote.findByIdAndUpdate(payment.quote._id, {
            status: 'accepted'
          });

          // Send confirmation email
          try {
            await sendPaymentConfirmationEmail(
              payment.user.email,
              payment.user.name,
              {
                invoiceNumber: payment.invoice.invoiceNumber,
                amount: payment.amount,
                currency: payment.currency,
                paidDate: payment.invoice.paidDate,
                paymentMethod: 'Stripe'
              }
            );
          } catch (emailError) {
            console.error('Error sending payment confirmation email:', emailError);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        
        const failedPaymentRecord = await Payment.findOne({
          paymentIntentId: failedPayment.id
        });

        if (failedPaymentRecord) {
          failedPaymentRecord.status = 'failed';
          failedPaymentRecord.failureReason = failedPayment.last_payment_error?.message;
          
          failedPaymentRecord.webhookEvents.push({
            eventType: event.type,
            eventId: event.id
          });

          await failedPaymentRecord.save();
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
