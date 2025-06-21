#!/usr/bin/env node

/**
 * Email Configuration Test Script
 * 
 * This script tests your email configuration independently.
 * Run with: node test-email.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Testing Email Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
let allConfigured = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  console.log(`${status} ${varName}: ${value ? 'Set' : 'Missing'}`);
  if (!value) allConfigured = false;
});

if (!allConfigured) {
  console.log('\n❌ Some environment variables are missing. Please check your .env file.');
  process.exit(1);
}

// Test email configuration
async function testEmailConfig() {
  try {
    console.log('\n🔧 Creating transporter...');
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('📡 Verifying connection...');
    await transporter.verify();
    console.log('✅ Email configuration is valid!');

    // Ask if user wants to send a test email
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\n🎯 Do you want to send a test email? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        rl.question('📧 Enter email address to send test to: ', async (email) => {
          try {
            console.log('📤 Sending test email...');
            
            await transporter.sendMail({
              from: `"Postify Studio Test" <${process.env.EMAIL_USER}>`,
              to: email,
              subject: 'Email Configuration Test - Postify Studio',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1>✅ Email Test Successful!</h1>
                    <p>Your email configuration is working properly</p>
                  </div>
                  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2>Congratulations! 🎉</h2>
                    <p>Your Postify Studio email system is configured correctly and ready to send emails.</p>
                    
                    <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb;">
                      <h3>Configuration Details:</h3>
                      <p><strong>Host:</strong> ${process.env.EMAIL_HOST}</p>
                      <p><strong>Port:</strong> ${process.env.EMAIL_PORT}</p>
                      <p><strong>User:</strong> ${process.env.EMAIL_USER}</p>
                      <p><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    
                    <p>You can now use the following features:</p>
                    <ul>
                      <li>User registration emails</li>
                      <li>Email verification</li>
                      <li>Quote notifications</li>
                      <li>Payment confirmations</li>
                      <li>Admin notifications</li>
                    </ul>
                  </div>
                  <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                    <p>© 2025 Postify Studio. Email system test.</p>
                  </div>
                </div>
              `
            });

            console.log('✅ Test email sent successfully!');
            console.log('📬 Check your inbox for the test email.');
            
          } catch (error) {
            console.error('❌ Failed to send test email:', error.message);
            if (error.code) {
              console.error(`Error Code: ${error.code}`);
            }
          }
          rl.close();
        });
      } else {
        console.log('👍 Email configuration test completed successfully.');
        rl.close();
      }
    });

  } catch (error) {
    console.error('❌ Email configuration test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 Authentication failed. This usually means:');
      console.error('   - Wrong email or password');
      console.error('   - Not using an app password (for Gmail)');
      console.error('   - 2-factor authentication not enabled (for Gmail)');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n💡 Connection failed. This usually means:');
      console.error('   - Wrong EMAIL_HOST or EMAIL_PORT');
      console.error('   - Firewall blocking the connection');
      console.error('   - Internet connection issues');
    }
    
    console.error('\n🔧 For help, check the EMAIL_SETUP_GUIDE.md file.');
    process.exit(1);
  }
}

// Run the test
testEmailConfig();
