# Unity Vote - Admin Authentication & CRUD Setup

## 🔐 Admin Authentication System

This project uses **Lucia** for authentication and **Nodemailer** for OTP-based login.

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Gmail account with App Password enabled

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/unity_vote"
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-character-app-password"
NODE_ENV="development"
```

#### Setting up Gmail App Password:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll to **App passwords** and click it
4. Select **Mail** and your device
5. Copy the 16-character password and add it to `.env`

### 3. Database Setup

Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

Generate Prisma client:

```bash
npx prisma generate
```

Seed the database with default admin accounts:

```bash
npx tsx prisma/seed.ts
```

This creates two default accounts:
- **Admin**: admin@unitysummit.no / Admin@2026
- **Manager**: manager@unitysummit.no / Manager@2026

⚠️ **Change these passwords after first login!**

### 4. Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## 🔑 Authentication Flow

1. **Login** - Admin enters email and password
2. **OTP Generation** - 6-digit code is generated and sent via email
3. **Verification** - Admin enters OTP code to complete login
4. **Session** - Lucia creates a 30-day session with secure cookies

## 🛠️ API Endpoints

### Authentication

- `POST /api/admin/auth/login` - Login with email/password, sends OTP
- `POST /api/admin/auth/verify-otp` - Verify OTP and create session
- `POST /api/admin/auth/logout` - Logout and invalidate session
- `GET /api/admin/auth/session` - Check current session

### Admin CRUD

- `GET /api/admin` - List all admins (admin role only)
- `POST /api/admin` - Create new admin (admin role only)
- `GET /api/admin/[id]` - Get single admin details
- `PUT /api/admin/[id]` - Update admin (own profile or admin role)
- `DELETE /api/admin/[id]` - Delete admin (admin role only)

## 👥 User Roles

### Admin
- Full access to all features
- Can create, update, and delete other admins
- Can change roles and activation status

### Manager
- Limited access
- Can view contests and manage contestants
- Cannot manage other admin accounts

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ OTP-based two-factor authentication
- ✅ Session management with Lucia
- ✅ Secure HTTP-only cookies
- ✅ 10-minute OTP expiration
- ✅ Role-based access control (RBAC)
- ✅ Email verification
- ✅ Account activation/deactivation

## 📊 Database Schema

### Admin Table
```prisma
model Admin {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String
  role         String    @default("manager")
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  sessions     Session[]
  otps         OTP[]
}
```

### Session Table
```prisma
model Session {
  id        String   @id
  userId    String
  expiresAt DateTime
  admin     Admin    @relation(...)
}
```

### OTP Table
```prisma
model OTP {
  id        String   @id @default(cuid())
  adminId   String
  code      String
  expiresAt DateTime
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())
  admin     Admin    @relation(...)
}
```

## 🧪 Testing the System

1. Login with default credentials at `/admin/login`
2. Check your email for the OTP code
3. Enter the OTP to complete login
4. Navigate to admin dashboard
5. Test CRUD operations (create/edit/delete admins)

## 📝 Password Requirements

When creating admins via the UI, ensure passwords:
- Are at least 8 characters long
- Are stored securely using bcrypt

## 🔧 Troubleshooting

### Email not sending
- Verify Gmail credentials in `.env`
- Check App Password is correct (16 characters, no spaces)
- Ensure 2-Step Verification is enabled on Google Account
- Check spam/junk folder

### Database connection issues
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database user has proper permissions

### Session issues
- Clear browser cookies
- Check session expiration (30 days default)
- Verify Lucia configuration

## 📦 Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **Lucia** - Authentication
- **Nodemailer** - Email service
- **Bcrypt** - Password hashing
- **PostgreSQL** - Database

## 🤝 Support

For issues or questions, please contact the development team.
