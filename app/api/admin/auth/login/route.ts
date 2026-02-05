import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { sendOTPEmail } from '@/lib/email';
import { generateId } from 'lucia';
import { lucia } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if admin is active
    if (!admin.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // In development mode, auto-verify and create session immediately
    if (process.env.NODE_ENV === 'development' || process.env.AUTO_VERIFY_OTP === 'true') {
      // Create session directly
      const session = await lucia.createSession(admin.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      
      const cookieStore = await cookies();
      cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

      return NextResponse.json({
        success: true,
        message: 'Login successful (auto-verified)',
        autoVerified: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
    }

    // In production, use OTP flow
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs for this admin
    await prisma.oTP.deleteMany({
      where: { adminId: admin.id }
    });

    // Save OTP
    await prisma.oTP.create({
      data: {
        id: generateId(15),
        adminId: admin.id,
        code: otp,
        expiresAt
      }
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(admin.email, otp, admin.name);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      adminId: admin.id
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

