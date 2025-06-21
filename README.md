# Postify Studio - Digital Services Platform

A comprehensive MERN stack web platform for a digital services startup offering web development, design, marketing, and consultation services.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based auth with email verification
- **Quote Request System** - Clients can request quotes for various services
- **Blog System** - Content management with categories and search
- **Portfolio Showcase** - Display of completed projects
- **Real-time Chat** - Support chat using Socket.IO
- **Payment Integration** - Stripe and Razorpay payment processing
- **Admin Dashboard** - Complete admin panel for managing users, quotes, and content
- **Responsive Design** - Mobile-first design with Tailwind CSS

### Tech Stack

#### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **Heroicons** - Beautiful SVG icons
- **Axios** - HTTP client for API calls
- **Socket.IO Client** - Real-time communication
- **React Hook Form** - Form handling with validation
- **Yup** - Schema validation
- **React Toastify** - Toast notifications
- **Stripe React** - Payment components

#### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Multer** - File upload handling
- **Cloudinary** - Image and file storage
- **Stripe** - Payment processing
- **Razorpay** - Alternative payment gateway
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for file uploads)
- Stripe account (for payments)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/postify-studio

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@postifystudio.com

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Postify Studio
VITE_APP_URL=http://localhost:3000

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Socket.IO
VITE_SOCKET_URL=http://localhost:5000
```

5. Start the development server:
```bash
npm run dev
```

## 🎯 Usage

### For Clients
1. **Browse Services** - View available digital services
2. **Request Quote** - Submit detailed project requirements
3. **Create Account** - Register and verify email
4. **Track Projects** - Monitor quote status and project progress
5. **Chat Support** - Real-time communication with team
6. **Make Payments** - Secure payment processing

### For Admins
1. **Dashboard Overview** - Monitor business metrics
2. **User Management** - Manage client accounts
3. **Quote Management** - Review and respond to quotes
4. **Content Management** - Manage blog posts and portfolio
5. **Analytics** - View business analytics and reports

## 🏗️ Project Structure

```
postify-studio/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── App.jsx      # Main App component
│   │   └── main.jsx     # Entry point
│   ├── public/          # Static assets
│   ├── index.html       # HTML template
│   └── package.json
└── README.md
```

## 🔐 Authentication

The application uses JWT-based authentication with the following features:
- User registration with email verification
- Secure login with password hashing
- Protected routes for authenticated users
- Role-based access control (user/admin)
- Password reset functionality
- Account lockout after failed attempts

## 💳 Payment Integration

Integrated payment processing with:
- **Stripe** - Primary payment processor
- **Razorpay** - Alternative for Indian market
- Secure payment forms with validation
- Payment status tracking
- Refund management

## 📧 Email Services

Automated email notifications for:
- Account verification
- Password reset
- Quote status updates
- Payment confirmations
- System notifications

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin protection
- **Rate Limiting** - API abuse prevention
- **Input Validation** - Data sanitization
- **Password Hashing** - Bcrypt encryption
- **JWT Tokens** - Secure authentication
- **File Upload Validation** - Secure file handling

## 📱 Responsive Design

Mobile-first responsive design with:
- Tailwind CSS utility classes
- Responsive grid layouts
- Mobile navigation
- Touch-friendly interfaces
- Optimized images and assets

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Quotes
- `GET /api/quotes` - Get all quotes (admin)
- `POST /api/quotes` - Create new quote
- `GET /api/quotes/user` - Get user quotes
- `PUT /api/quotes/:id` - Update quote status

### Blog
- `GET /api/blog` - Get all blog posts
- `GET /api/blog/:slug` - Get single blog post
- `POST /api/blog` - Create blog post (admin)
- `PUT /api/blog/:id` - Update blog post (admin)

### Portfolio
- `GET /api/portfolio` - Get portfolio projects
- `GET /api/portfolio/:id` - Get single project
- `POST /api/portfolio` - Create project (admin)

### Chat
- `GET /api/chat/messages` - Get chat messages
- `POST /api/chat/messages` - Send message

### Payments
- `POST /api/payments/create-payment-intent` - Create payment
- `POST /api/payments/confirm-payment` - Confirm payment

## � Email Configuration & Troubleshooting

The application requires email configuration for user registration, notifications, and communication.

### Quick Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Update your backend `.env` file:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### Testing Email Configuration
```bash
# In the backend directory
npm run test-email

# Or on Windows, double-click:
test-email.bat
```

### Troubleshooting
- **Emails not sending?** Check the Email System Diagnostics in the Admin Dashboard
- **Authentication failed?** Make sure you're using an App Password, not your regular password
- **Need detailed help?** See `EMAIL_SETUP_GUIDE.md` for step-by-step instructions

### Supported Email Providers
- Gmail (recommended)
- Outlook/Hotmail
- Yahoo Mail
- Custom SMTP servers
- SendGrid, Mailgun, Amazon SES

## �🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or similar cloud database
2. Configure environment variables for production
3. Deploy to services like Heroku, Railway, or DigitalOcean
4. Set up domain and SSL certificate

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy to services like Vercel, Netlify, or AWS S3
3. Configure environment variables for production
4. Set up domain and SSL certificate

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👥 Team

- **Frontend Development** - React, Tailwind CSS, UI/UX
- **Backend Development** - Node.js, Express, MongoDB
- **DevOps** - Deployment, CI/CD, Monitoring
- **Design** - UI/UX Design, Brand Identity

## 📞 Support

For support and questions:
- Email: support@postifystudio.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

---

Built with ❤️ by the Postify Studio teamnpm run dev