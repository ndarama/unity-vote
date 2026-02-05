import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/admin/login',
  '/admin/accept-invite',
  '/guide',
  '/privacy',
  '/terms',
  '/contest',
  '/api/contests',
  '/api/contestants',
  '/api/votes',
];

// Admin routes that require authentication
const adminRoutes = ['/admin'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes for admin auth and accept-invite don't need session check
  if (pathname.startsWith('/api/admin/auth/login') || 
      pathname.startsWith('/api/admin/auth/verify-otp') ||
      pathname.startsWith('/api/admin/accept-invite')) {
    return NextResponse.next();
  }

  // Allow public routes and API routes
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if the route is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  
  // Check authentication for admin routes
  if (isAdminRoute) {
    // Check if session cookie exists
    const sessionCookie = request.cookies.get('unity-vote-session');
    
    if (!sessionCookie) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Allow the request to proceed - full validation will happen in the API route
    return NextResponse.next();
  }

  // Check authentication for admin API routes
  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth')) {
    // Check if session cookie exists
    const sessionCookie = request.cookies.get('unity-vote-session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Allow the request to proceed - full validation will happen in the API route
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
