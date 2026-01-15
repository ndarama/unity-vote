# Unity Summit & Awards 2026 - Voting Portal

A modern voting platform built with **Next.js 16.1.1**, React 19, TypeScript, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Add your Gemini API key to `.env.local`:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── client-layout.tsx  # Client-side layout wrapper
│   ├── page.tsx           # Home page
│   ├── admin/             # Admin routes
│   ├── contest/[id]/      # Dynamic contest pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
├── pages/                 # Page components (used by app router)
├── services/              # Business logic and API services
└── types.ts              # TypeScript type definitions
```

## 🔑 Key Features

- **Dynamic Contest Management** - Create and manage multiple voting contests
- **Real-time Leaderboard** - Live vote tracking and rankings
- **Admin Dashboard** - Comprehensive analytics and contest control
- **Email Verification** - OTP-based vote validation
- **Bio Generation** - AI-powered contestant bios using Gemini
- **Responsive Design** - Mobile-first approach with Tailwind CSS

## 🛠️ Technology Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Charts:** Recharts
- **Icons:** Lucide React
- **AI:** Google Gemini AI
- **PDF Generation:** jsPDF

## 📝 Migration from Vite

This project was converted from Vite to Next.js 16.1.1. Key changes:

- Replaced `react-router-dom` with Next.js App Router
- Added `'use client'` directives to client components
- Updated imports from `useNavigate/useLocation` to `useRouter/useSearchParams`
- Converted HashRouter to standard routing
- Migrated from Vite config to `next.config.ts`
- Updated Tailwind configuration for Next.js

## 🔐 Admin Access

For demo purposes:
- Email: `admin@unitysummit.no`
- OTP: Use `admin` for full access or `manager` for contestant manager role

## 📄 License

© 2026 Unity Summit & Awards. All rights reserved.

---

View the original AI Studio app: https://ai.studio/apps/drive/1fgbW4uXwtKc9D0sys5N4sl40BZpAbU5J
