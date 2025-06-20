const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send OTP email
exports.sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Postify Studio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Postify Studio',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Welcome to Postify Studio!</h1>
              <p>Digital Services That Transform Your Business</p>
            </div>
            <div class="content">
              <h2>Hello ${name}! 👋</h2>
              <p>Thank you for joining Postify Studio! We're excited to help you grow your digital presence.</p>
              
              <p>To complete your registration, please verify your email address using the OTP code below:</p>
              
              <div class="otp-box">
                <p>Your Verification Code:</p>
                <div class="otp-code">${otp}</div>
                <p><small>This code expires in 10 minutes</small></p>
              </div>
              
              <p>If you didn't create an account with us, please ignore this email.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              
              <h3>🎯 What's Next?</h3>
              <ul>
                <li>Complete your profile setup</li>
                <li>Browse our services and portfolio</li>
                <li>Request a quote for your project</li>
                <li>Connect with our team via live chat</li>
              </ul>
            </div>
            <div class="footer">
              <p>© 2025 Postify Studio. All rights reserved.</p>
              <p>Need help? Contact us at support@postifystudio.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// Send welcome email after verification
exports.sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Postify Studio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Postify Studio! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Postify Studio</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .service-card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Postify Studio!</h1>
              <p>Your Digital Transformation Journey Starts Here</p>
            </div>
            <div class="content">
              <h2>Hello ${name}! 👋</h2>
              <p>Congratulations! Your email has been verified successfully. You're now part of the Postify Studio family!</p>
              
              <h3>🚀 Our Services</h3>
              
              <div class="service-card">
                <h4>🌐 Custom Website Development</h4>
                <p>Modern, responsive websites that convert visitors into customers.</p>
              </div>
              
              <div class="service-card">
                <h4>✍️ Blog Writing & SEO Content</h4>
                <p>Engaging content that ranks well and drives organic traffic.</p>
              </div>
              
              <div class="service-card">
                <h4>📱 Social Media Management</h4>
                <p>Complete social media strategy, content creation, and management.</p>
              </div>
              
              <div class="service-card">
                <h4>🎨 Social Media Design</h4>
                <p>Eye-catching posts, banners, and visual content for your brand.</p>
              </div>
              
              <div class="service-card">
                <h4>📝 Content Writing & Editing</h4>
                <p>Professional content that engages your audience and builds trust.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
                <a href="${process.env.FRONTEND_URL}/services" class="button">View Services</a>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              
              <h3>🎯 Getting Started</h3>
              <ol>
                <li><strong>Explore Our Portfolio:</strong> Check out our previous work and success stories</li>
                <li><strong>Request a Quote:</strong> Tell us about your project and get a custom quote</li>
                <li><strong>Connect with Us:</strong> Use our live chat feature for instant support</li>
                <li><strong>Track Your Projects:</strong> Monitor progress through your dashboard</li>
              </ol>
              
              <p>Have questions? Our team is here to help! Feel free to reach out anytime.</p>
            </div>
            <div class="footer">
              <p>© 2025 Postify Studio. All rights reserved.</p>
              <p>📧 support@postifystudio.com | 📱 +1 (555) 123-4567</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// Send quote submission notification
exports.sendQuoteNotificationEmail = async (email, name, quoteId) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Postify Studio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Quote Request Received - Postify Studio',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .quote-id { background: white; border: 2px solid #667eea; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px; font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Quote Request Received!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for submitting your quote request. We've received your project details and our team is already reviewing it.</p>
              
              <div class="quote-id">
                Quote ID: #${quoteId}
              </div>
              
              <h3>⏱️ What Happens Next?</h3>
              <ol>
                <li><strong>Review (24-48 hours):</strong> Our team will analyze your requirements</li>
                <li><strong>Quote Preparation:</strong> We'll prepare a detailed quote with timeline and pricing</li>
                <li><strong>Delivery:</strong> You'll receive your custom quote via email and dashboard</li>
                <li><strong>Discussion:</strong> We'll schedule a call to discuss the project details</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard/quotes" class="button">Track Your Quote</a>
                <a href="${process.env.FRONTEND_URL}/chat" class="button">Chat with Us</a>
              </div>
              
              <p>You can track the progress of your quote request in your dashboard. We'll also send you email updates as your quote moves through different stages.</p>
              
              <p>Have questions in the meantime? Don't hesitate to reach out via our live chat or email us directly.</p>
            </div>
            <div class="footer">
              <p>© 2025 Postify Studio. All rights reserved.</p>
              <p>📧 support@postifystudio.com | 💬 Live Chat Available</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Quote notification email sent successfully');
  } catch (error) {
    console.error('Error sending quote notification email:', error);
    throw error;
  }
};

// Send payment confirmation email
exports.sendPaymentConfirmationEmail = async (email, name, paymentDetails) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Postify Studio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Payment Confirmed - Postify Studio',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .payment-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Confirmed!</h1>
              <p>Thank you for your payment</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>We've successfully received your payment. Your project will now move into the active development phase.</p>
              
              <div class="payment-details">
                <h3>Payment Details:</h3>
                <p><strong>Invoice Number:</strong> ${paymentDetails.invoiceNumber}</p>
                <p><strong>Amount:</strong> ${paymentDetails.currency} ${paymentDetails.amount}</p>
                <p><strong>Payment Date:</strong> ${new Date(paymentDetails.paidDate).toLocaleDateString()}</p>
                <p><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</p>
              </div>
              
              <h3>🚀 Next Steps:</h3>
              <ol>
                <li>Our team will start working on your project immediately</li>
                <li>You'll receive regular updates on the progress</li>
                <li>Use the chat feature for any questions or feedback</li>
                <li>Download your invoice from the dashboard</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard/payments" class="button">View Invoice</a>
                <a href="${process.env.FRONTEND_URL}/chat" class="button">Chat with Team</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Postify Studio. All rights reserved.</p>
              <p>📧 support@postifystudio.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw error;
  }
};
