# ReadPage Setup Instructions

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=readpage_db

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Development Mode (Optional)
NODE_ENV=development
SKIP_EMAIL_VERIFICATION=true

# Admin Configuration (Optional)
ADMIN_EMAIL=admin@readpage.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User
ADMIN_USERNAME=admin
ADMIN_PHONE=+977-1234567890
```

### 3. Database Setup
1. Create a MySQL database named `readpage_db`
2. The application will automatically create the required tables

#### If you encounter database schema errors:
If you have an existing database with the old schema, you can reset it:

```bash
# Option 1: Reset the database (WARNING: This will delete all data)
node reset-db.js

# Option 2: The application will automatically migrate existing data
# Just restart the server and it will handle the migration
```

### 4. Email Setup (Gmail) - Optional for Development
For production, you need to configure email:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password for the application
3. Use the App Password in the `EMAIL_PASS` variable

**For Development (Skip Email Setup):**
If you don't want to configure email for development, the application will:
- Log verification URLs to the console
- Auto-verify users in development mode
- Continue working without email configuration

### 5. Cloudinary Setup
1. Create a free account at https://cloudinary.com
2. Get your cloud name, API key, and API secret from the dashboard
3. Add them to your `.env` file

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000
```

## Running the Application

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run dev
```

## New Features Added

### 1. Currency Change
- Changed all currency displays from $ to NPR (Nepalese Rupee)

### 2. Enhanced User Registration
- Added username and phone number fields
- Email verification required before login
- Unique validation for email, username, and phone number

### 3. Enhanced User Profile
- Added address field
- Profile photo upload with Cloudinary integration
- Change password functionality
- Edit profile information

### 4. Forgot Password
- OTP-based password reset
- Email verification for password reset
- Secure password change process

### 5. Email Verification
- Email verification required for new registrations
- Verification link sent to user's email
- Dedicated verification page

## API Endpoints Added

### Authentication
- `POST /api/auth/register` - Register with email verification
- `GET /api/auth/verify-email` - Verify email with token
- `POST /api/auth/forgot-password` - Send OTP for password reset
- `POST /api/auth/reset-password` - Reset password with OTP
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/profile/photo` - Upload profile photo
- `PUT /api/auth/change-password` - Change password

## Database Schema Updates

### User Model
- Added `username` field (unique)
- Added `phoneNumber` field (unique)
- Added `address` field
- Added `profilePhoto` field
- Added `isEmailVerified` field
- Added `emailVerificationToken` field
- Added `passwordResetToken` field
- Added `passwordResetExpires` field

## Security Features

1. **Email Verification**: Users must verify their email before logging in
2. **Unique Constraints**: Email, username, and phone number must be unique
3. **OTP-based Password Reset**: Secure password reset using OTP
4. **Cloudinary Integration**: Secure image upload and storage
5. **Input Validation**: Comprehensive validation on all forms

## Testing the Features

1. **Registration**: Try registering with duplicate email/username/phone
2. **Email Verification**: Check email for verification link
3. **Profile Management**: Upload photo, edit profile, change password
4. **Forgot Password**: Test OTP-based password reset
5. **Currency Display**: Verify NPR currency in all components
