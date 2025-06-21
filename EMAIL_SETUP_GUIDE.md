# EMAIL CONFIGURATION TROUBLESHOOTING GUIDE

## 🚨 EMAIL NOT WORKING? Follow this step-by-step guide:

### 1. Check Your .env File
Your backend `.env` file should contain these email settings:

```bash
# Email Configuration (Required for sending emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
FRONTEND_URL=http://localhost:3000
```

### 2. Gmail Setup (Most Common)

#### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Click on "2-Step Verification"
3. Follow the setup process

#### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and your device
3. Copy the 16-character password
4. Use this password in EMAIL_PASS (NOT your regular Gmail password)

#### Step 3: Update .env File
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=abcd-efgh-ijkl-mnop  # 16-character app password
```

### 3. Other Email Providers

#### Outlook/Hotmail
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=youremail@outlook.com
EMAIL_PASS=your-app-password
```

#### Yahoo Mail
```bash
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=youremail@yahoo.com
EMAIL_PASS=your-app-password
```

#### Custom SMTP Server
```bash
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_USER=your-username
EMAIL_PASS=your-password
```

### 4. Testing Your Configuration

1. Start your backend server
2. Go to Admin Dashboard
3. Use the "Email System Diagnostics" section
4. Click "Check Environment" - all should be green
5. Click "Test Configuration" - should show success
6. Enter your email and name, click "Send Test Email"

### 5. Common Issues & Solutions

#### ❌ "Authentication failed"
- **Problem**: Wrong email/password
- **Solution**: Use app password, not regular password

#### ❌ "Connection timeout"
- **Problem**: Wrong host/port or firewall blocking
- **Solution**: Check EMAIL_HOST and EMAIL_PORT values

#### ❌ "Self signed certificate"
- **Problem**: SSL certificate issues
- **Solution**: Update email service to handle this (already done)

#### ❌ "Environment variables missing"
- **Problem**: .env file not loaded or variables not set
- **Solution**: Check .env file exists in backend folder with correct variable names

### 6. Security Notes

- ✅ Never use your regular email password
- ✅ Always use app passwords for SMTP
- ✅ Keep your .env file private (never commit to git)
- ✅ Use environment variables in production

### 7. Production Deployment

For production, use environment variables instead of .env file:

```bash
# Set these in your hosting platform (Heroku, Vercel, etc.)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=support@yourdomain.com
EMAIL_PASS=your-production-app-password
FRONTEND_URL=https://yourdomain.com
```

### 8. Alternative Solutions

If you continue having issues, consider:

1. **Email Service Providers**:
   - SendGrid
   - Mailgun
   - Amazon SES
   - Resend

2. **Configuration for SendGrid**:
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### 9. Debugging

Check server logs for detailed error messages:
- Look for email-related console logs
- Check the Email System Diagnostics in admin dashboard
- Verify all environment variables are loaded correctly

---

**Need Help?** 
- Check the admin dashboard Email System Diagnostics
- Look at server console logs
- Verify your email provider's SMTP settings
- Make sure you're using app passwords, not regular passwords
