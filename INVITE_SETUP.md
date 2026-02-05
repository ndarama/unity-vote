# 🚀 Quick Setup - Invite User System

## ⚡ 3-Minute Setup

### Step 1: Update Environment Variables (30 seconds)
```bash
# Add to your .env file:
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# In production:
# NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

### Step 2: Run Database Migration (1 minute)
```bash
npx prisma migrate dev --name add_invitations
npx prisma generate
```

### Step 3: Restart Application (30 seconds)
```bash
npm run dev
```

### Step 4: Test It! (1 minute)
1. Login as admin at http://localhost:3000/admin/login
2. Go to http://localhost:3000/admin/manage-admins
3. Click "Invite User" button
4. Fill form and send invitation
5. Check email for invitation link

## ✅ That's it!

The invite system is now fully functional.

## 🎯 Usage

### Send Invitation (Admin)
1. Navigate to Admin Management
2. Click "Invite User" (blue button)
3. Enter:
   - Full Name
   - Email Address
   - Role (admin/manager)
4. Click "Send Invitation"
5. User receives email with secure signup link

### Accept Invitation (Recipient)
1. Check email inbox
2. Click "Accept Invitation" button in email
3. Set your password (min 8 characters)
4. Click "Create Account & Continue"
5. Automatically logged in and redirected to dashboard

### View Pending Invitations
- Go to Admin Management page
- See "Pending Invitations" table above admins table
- Shows: Name, Email, Role, Expiration date

### Cancel Invitation
- Find invitation in "Pending Invitations" table
- Click X button on the right
- Confirm cancellation

## 📧 Email Features

Recipients receive a professional email with:
- Personalized greeting
- Who invited them
- Their assigned role
- Clear call-to-action button
- Expiration notice (7 days)
- Security information

## 🔒 Security

- Unique 40-character tokens
- 7-day expiration
- One-time use only
- Email verification
- Password strength validation
- Admin-only sending

## 🐛 Troubleshooting

**Email not received?**
- Check spam/junk folder
- Verify Gmail credentials in .env
- Check server logs

**Invalid token error?**
- Invitation may have expired (7 days)
- Check if already accepted
- Request new invitation

**Can't send invitation?**
- Must be logged in as admin role
- Check if email already exists
- Verify email format

## 📝 Commands Reference

```bash
# Migration
npx prisma migrate dev --name add_invitations

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev

# Check database
npx prisma studio
```

## 🎊 You're Done!

The invitation system is ready to use. For more details, see:
- `INVITE_SYSTEM_SUMMARY.md` - Implementation overview
- `INVITE_USER_GUIDE.md` - Complete guide with API docs

---

**Need help?** Check the documentation files or review the implementation in:
- `app/api/admin/invite/route.ts`
- `components/AdminManagement.tsx`
- `app/admin/accept-invite/page.tsx`
