# 📧 Invite User System - Complete Guide

## ✨ Features

The invite user system allows admins to:
- Send email invitations to new admin users
- Recipients receive a secure signup link
- Invitations expire after 7 days
- Track pending invitations
- Cancel invitations before acceptance

## 🔄 Invitation Flow

```
┌─────────────────┐
│  Admin clicks   │
│ "Invite User"   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fill form:     │
│  • Name         │
│  • Email        │
│  • Role         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  System:        │
│  • Creates      │
│    invitation   │
│  • Generates    │
│    unique token │
│  • Sends email  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Recipient      │
│  receives email │
│  with link      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Clicks link    │
│  to accept      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create account │
│  page shows:    │
│  • Name (fixed) │
│  • Email (fixed)│
│  • Set password │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Submit form    │
│  • Creates admin│
│  • Auto login   │
│  • Marks invite │
│    as accepted  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redirect to    │
│  Admin Dashboard│
└─────────────────┘
```

## 📊 Database Schema

### Invitation Table
```prisma
model Invitation {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      String   @default("manager")
  token     String   @unique
  expiresAt DateTime
  accepted  Boolean  @default(false)
  createdAt DateTime @default(now())
  createdBy String
  
  @@index([token])
  @@index([email])
  @@map("invitations")
}
```

**Fields:**
- `id` - Unique invitation identifier
- `email` - Recipient's email (unique)
- `name` - Recipient's name
- `role` - Admin role (admin/manager)
- `token` - Secure unique token (40 characters)
- `expiresAt` - Expiration date (7 days from creation)
- `accepted` - Whether invitation was accepted
- `createdAt` - When invitation was created
- `createdBy` - ID of admin who sent invitation

## 🎯 API Endpoints

### 1. Send Invitation
**POST** `/api/admin/invite`

**Headers:**
- Cookie: Session cookie (admin only)

**Request Body:**
```json
{
  "email": "newadmin@example.com",
  "name": "John Doe",
  "role": "manager"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "clx...",
    "email": "newadmin@example.com",
    "name": "John Doe",
    "role": "manager",
    "expiresAt": "2026-01-22T10:30:00.000Z"
  }
}
```

**Errors:**
- 401: Unauthorized
- 403: Only admins can invite
- 409: Email already exists
- 500: Email delivery failed

### 2. List Pending Invitations
**GET** `/api/admin/invite`

**Headers:**
- Cookie: Session cookie (admin only)

**Response (200):**
```json
{
  "invitations": [
    {
      "id": "clx...",
      "email": "newadmin@example.com",
      "name": "John Doe",
      "role": "manager",
      "expiresAt": "2026-01-22T10:30:00.000Z",
      "createdAt": "2026-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3. Cancel Invitation
**DELETE** `/api/admin/invite/[id]`

**Response (200):**
```json
{
  "success": true,
  "message": "Invitation cancelled successfully"
}
```

**Errors:**
- 404: Invitation not found
- 400: Cannot delete accepted invitation

### 4. Verify Invitation Token
**GET** `/api/admin/accept-invite?token=xxx`

**Response (200):**
```json
{
  "valid": true,
  "invitation": {
    "email": "newadmin@example.com",
    "name": "John Doe",
    "role": "manager"
  }
}
```

**Errors:**
- 400: Token required / Expired / Already accepted
- 404: Invalid token

### 5. Accept Invitation
**POST** `/api/admin/accept-invite`

**Request Body:**
```json
{
  "token": "abc123...",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "admin": {
    "id": "clx...",
    "email": "newadmin@example.com",
    "name": "John Doe",
    "role": "manager"
  }
}
```

**Errors:**
- 400: Missing fields / Weak password / Expired
- 404: Invalid token
- 409: Email already exists

## 📧 Email Template

The invitation email includes:
- **Subject:** "You're invited to join Unity Vote as [role]"
- **Sender:** "Unity Vote Admin"
- **Content:**
  - Welcome message
  - Role information
  - Who invited them
  - CTA button with signup link
  - Fallback text link
  - Expiration notice (7 days)
  - Security notice

**Design Features:**
- Responsive HTML
- Professional branding
- Clear call-to-action button
- Security warnings
- Plain text fallback

## 🖥️ UI Components

### Invite Modal (AdminManagement)
Located in: [components/AdminManagement.tsx](d:\UNITY SPARK\Apps\unity-vote\components\AdminManagement.tsx)

**Features:**
- "Invite User" button in header
- Modal form with:
  - Name input
  - Email input
  - Role selector
- Real-time validation
- Success/error messages

### Pending Invitations Table
**Shows:**
- Name
- Email
- Role (badge)
- Expiration date
- Cancel button

**Features:**
- Only visible when invitations exist
- Cancel functionality
- Visual distinction from admins table

### Accept Invitation Page
Located at: `/admin/accept-invite`

**URL:** `/admin/accept-invite?token=xxx`

**Features:**
- Token verification on load
- Loading state while verifying
- Error page for invalid/expired tokens
- Account setup form:
  - Name (read-only)
  - Email (read-only)
  - Password input
  - Confirm password
- Password strength requirements
- Auto-login after account creation
- Redirect to dashboard

## 🔒 Security Features

### Token Generation
- 40 characters long
- Cryptographically secure (lucia's generateId)
- Unique per invitation
- Indexed for fast lookup

### Expiration
- 7 days from creation
- Automatic cleanup on verification
- Cannot use expired tokens

### Email Verification
- Only invited email can create account
- Token tied to specific email
- One-time use (marked as accepted)

### Password Requirements
- Minimum 8 characters
- Server-side validation
- Bcrypt hashing (10 rounds)

### Duplicate Prevention
- Check for existing admin with email
- Check for existing pending invitation
- Replace old invitation if resending

### Auto-Cleanup
- Expired invitations filtered in queries
- Old invitations deleted when new sent
- Accepted invitations kept for audit

## 🧪 Testing the System

### 1. Send Invitation
```bash
# Login as admin first
curl -X POST http://localhost:3000/api/admin/invite \
  -H "Content-Type: application/json" \
  -H "Cookie: unity-vote-session=xxx" \
  -d '{
    "email": "newuser@test.com",
    "name": "Test User",
    "role": "manager"
  }'
```

### 2. Check Email
- Open recipient's email inbox
- Look for invitation email
- Copy invitation link

### 3. Accept Invitation
- Open invitation link in browser
- Verify token is valid
- Set password
- Submit form
- Check redirect to dashboard

### 4. Verify Account Created
```bash
# Login with new credentials
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "password": "your-password"
  }'
```

## 📝 Usage Examples

### From UI

1. **As Admin:**
   - Go to `/admin/manage-admins`
   - Click "Invite User" button
   - Fill form:
     - Name: "Jane Smith"
     - Email: "jane@company.com"
     - Role: "Manager"
   - Click "Send Invitation"
   - See success message
   - View in "Pending Invitations" table

2. **As Recipient:**
   - Check email for invitation
   - Click "Accept Invitation" button
   - See pre-filled name and email
   - Create password
   - Submit form
   - Redirected to dashboard

3. **Cancel Invitation:**
   - View pending invitations
   - Click X button next to invitation
   - Confirm cancellation
   - Invitation removed

## ⚙️ Configuration

### Environment Variables

```bash
# Required for invitation links
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# In production
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

### Email Settings
Same Gmail configuration as OTP:
```bash
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"
```

## 🐛 Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify Gmail credentials
3. Check server logs for errors
4. Test email delivery manually

### Invalid Token Error
1. Check if invitation expired (7 days)
2. Verify token in URL is complete
3. Check if already accepted
4. Try requesting new invitation

### Cannot Create Account
1. Verify password meets requirements (8+ chars)
2. Check if email already exists
3. Ensure token is still valid
4. Check database connectivity

### Invitation Not Showing
1. Verify admin role (only admins can invite)
2. Check if already accepted
3. Look at expired invitations
4. Refresh page

## 🎯 Best Practices

### For Admins
1. Use descriptive names in invitations
2. Verify email addresses before sending
3. Cancel unused invitations
4. Monitor pending invitations
5. Choose appropriate roles

### For Recipients
1. Accept invitation promptly
2. Use strong passwords
3. Keep invitation link secure
4. Don't share invitation link
5. Report suspicious invitations

### For System
1. Regular cleanup of expired invitations
2. Monitor invitation delivery
3. Log invitation events
4. Rate limit invitation sending
5. Backup invitation data

## 📊 Invitation Lifecycle

```
Created → Sent → Pending → Expired/Accepted
   ↓         ↓       ↓           ↓
 7 days   Email   Can be    Cannot be
  TTL    sent    cancelled   cancelled
```

**States:**
- **Created:** Invitation record created
- **Sent:** Email delivered successfully
- **Pending:** Awaiting acceptance
- **Expired:** Past 7-day TTL
- **Accepted:** User created account
- **Cancelled:** Admin cancelled invitation

## 🔄 Migration

To add invitations to existing database:

```bash
# Add Invitation model to schema.prisma (already done)

# Run migration
npx prisma migrate dev --name add_invitations

# Generate client
npx prisma generate
```

## 📈 Future Enhancements

Potential improvements:
- [ ] Resend invitation option
- [ ] Custom expiration periods
- [ ] Invitation templates
- [ ] Batch invitations
- [ ] Invitation history/audit log
- [ ] Email reminders before expiry
- [ ] Custom welcome messages
- [ ] Role permissions preview
- [ ] Invitation analytics

---

**Invitation System Status: ✅ Complete & Ready**

All features have been implemented and tested!
