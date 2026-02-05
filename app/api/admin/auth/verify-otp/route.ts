import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { lucia } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId, otp } = body;

    if (!adminId || !otp) {
      return NextResponse.json(
        { error: 'Admin ID and OTP are required' },
        { status: 400 }
      );
    }

    // Find the OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        adminId,
        code: otp,
        verified: false,
        expiresAt: {
          gte: new Date()
        }
      },
      include: {
        admin: true
      }
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    // Mark OTP as verified
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { verified: true }
    });

    // Create session
    const session = await lucia.createSession(otpRecord.admin.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    
    const cookieStore = await cookies();
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    // Clean up old OTPs
    await prisma.oTP.deleteMany({
      where: {
        adminId: otpRecord.admin.id,
        id: {
          not: otpRecord.id
        }
      }
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: otpRecord.admin.id,
        email: otpRecord.admin.email,
        name: otpRecord.admin.name,
        role: otpRecord.admin.role
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

