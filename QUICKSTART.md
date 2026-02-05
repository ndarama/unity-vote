# 🚀 Quick Start Guide - Admin Authentication System

## ⚡ 5-Minute Setup

### Step 1: Environment Variables (1 min)
```bash
# Create .env file in project root
DATABASE_URL="postgresql://username:password@localhost:5432/unity_vote"
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"
NODE_ENV="development"
```

📧 **Get Gmail App Password:**
1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Scroll to "App passwords" → Click it
4. Select "Mail" → Generate → Copy 16-character code

### Step 2: Database Setup (2 min)
```bash
npm run db:setup
```

This creates:
- Database tables (Admin, Session, OTP)
- Default admin accounts
- Generates Prisma client

### Step 3: Start Application (1 min)
```bash
npm run dev
```

### Step 4: Test Login (1 min)
1. Open: http://localhost:3000/admin/login
2. Login with:
   - Email: `admin@unitysummit.no`
   - Password: `Admin@2026`
3. Check your email for OTP code
4. Enter OTP to complete login

### Step 5: Manage Admins
1. Go to: http://localhost:3000/admin/manage-admins
2. Create/Edit/Delete admin accounts
3. Change default passwords!

## 🎯 Default Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@unitysummit.no | Admin@2026 | admin |
| manager@unitysummit.no | Manager@2026 | manager |

⚠️ **IMPORTANT:** Change these passwords immediately!

## 🔧 Troubleshooting

### Email Not Sending?
```bash
# Test email configuration
node -e "require('./lib/email').sendEmail({to:'your@email.com',subject:'Test',html:'<h1>Works!</h1>'})"
```

### Database Issues?
```bash
# Reset database
npx prisma migrate reset
npm run db:setup
```

### Session Problems?
- Clear browser cookies
- Check if session cookie is set
- Verify middleware.ts is configured

## 📋 Quick Commands

```bash
# Database
npm run db:migrate    # Run migrations
npm run db:generate   # Generate Prisma client
npm run db:seed       # Seed default admins
npm run db:setup      # All of the above

# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
```

## 🎨 Features at a Glance

- ✅ Email + Password authentication
- ✅ OTP via email (2FA)
- ✅ Role-based access (admin/manager)
- ✅ Admin CRUD operations
- ✅ Session management (30 days)
- ✅ Account activation/deactivation
- ✅ Password hashing (bcrypt)
- ✅ Protected routes (middleware)
- ✅ Beautiful email templates

## 🔗 Important URLs

- Login: http://localhost:3000/admin/login
- Dashboard: http://localhost:3000/admin
- Manage Admins: http://localhost:3000/admin/manage-admins

## 📞 Need Help?

Check these files:
- `ADMIN_SETUP.md` - Detailed setup instructions
- `IMPLEMENTATION_SUMMARY.md` - Complete feature list
- `.env.example` - Environment variable template

---

**Ready to go! 🚀**
