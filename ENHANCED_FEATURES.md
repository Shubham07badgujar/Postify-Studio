# Enhanced Sign-Up and User Management System

## Overview
This project now includes an enhanced sign-up experience with improved UI/UX and proper MongoDB integration for storing user and admin data.

## New Features

### 1. Enhanced Registration UI
- **Modern Design**: Beautiful gradient background with two-panel layout
- **Role Selection**: Users can choose between "Client" and "Admin" account types
- **Additional Fields**: Phone number and company name (optional)
- **Better Form Validation**: Enhanced error handling with icons and better messaging
- **Visual Improvements**: 
  - Icons for each input field
  - Password visibility toggle
  - Hover effects and animations
  - Responsive design

### 2. Improved Home Page
- **Get Started Section**: New 3-step onboarding process
- **Enhanced CTAs**: Multiple call-to-action buttons with better styling
- **Social Proof**: Star ratings, testimonials, and statistics
- **Better Visual Hierarchy**: Improved spacing and typography

### 3. MongoDB Integration
- **User Model**: Enhanced with role field (user/admin)
- **Validation**: Server-side validation for all fields
- **Security**: Password hashing with bcrypt
- **Email Verification**: OTP-based email verification system

### 4. New Components
- **GetStarted Component**: Standalone landing page for onboarding
- **Enhanced Register Component**: Improved sign-up form with role selection

## File Changes

### Frontend Changes
1. **Register.jsx**: Complete redesign with modern UI and role selection
2. **Home.jsx**: Enhanced with better CTA sections and onboarding steps
3. **AuthContext.jsx**: Updated to handle additional registration fields
4. **App.jsx**: Added route for GetStarted component
5. **GetStarted.jsx**: New component for dedicated onboarding experience

### Backend Changes
1. **routes/auth.js**: Updated to handle role field and additional validation
2. **models/User.js**: Already included role field and proper validation
3. **.env**: Environment configuration for database and JWT

## Database Schema
The User model includes:
- `name`: String (required, 2-50 characters)
- `email`: String (required, unique, validated)
- `password`: String (required, min 6 characters, hashed)
- `phone`: String (optional, validated format)
- `company`: String (optional, max 100 characters)
- `role`: String (enum: 'user', 'admin', default: 'user')
- `isEmailVerified`: Boolean (default: false)
- `otp`: String (for email verification)
- `otpExpiry`: Date (OTP expiration time)
- `avatar`: String (profile picture URL)
- `address`: Object (street, city, state, zipCode, country)
- `isActive`: Boolean (default: true)
- `lastLogin`: Date
- `timestamps`: CreatedAt and UpdatedAt

## User Flow

### New User Registration
1. User visits home page and clicks "Get Started" or "Sign Up"
2. User fills out enhanced registration form
3. User selects account type (Client or Admin)
4. Form is validated on client and server side
5. User data is stored in MongoDB with hashed password
6. OTP is sent to user's email for verification
7. User is redirected to email verification page

### Admin vs Regular User
- **Regular Users**: Access to user dashboard, quote requests, portfolio viewing
- **Admin Users**: Access to admin dashboard with user management, analytics, and system controls

## API Endpoints

### Authentication
- `POST /api/auth/register`: Enhanced registration with role selection
- `POST /api/auth/login`: User login
- `POST /api/auth/verify-email`: Email verification with OTP
- `GET /api/auth/me`: Get current user profile

## Security Features
- Password hashing with bcrypt (salt rounds: 12)
- JWT token authentication
- Email verification required
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS protection

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation
1. Install all dependencies:
   ```bash
   npm run install:all
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env` in backend folder
   - Update MongoDB URI and other settings

3. Start development servers:
   ```bash
   npm run dev
   ```

### Access Points
- **Home Page**: http://localhost:5173
- **Registration**: http://localhost:5173/register
- **Get Started**: http://localhost:5173/get-started
- **Admin Dashboard**: http://localhost:5173/admin (after admin login)
- **User Dashboard**: http://localhost:5173/dashboard (after user login)

## Future Enhancements
- Social media login integration
- Two-factor authentication
- Advanced user profile management
- Role permissions system
- Audit logging
- Password reset functionality
- User activity tracking
