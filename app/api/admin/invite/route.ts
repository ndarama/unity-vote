import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth';
import { sendInvitationEmail } from '@/lib/email';
import { generateId } from 'lucia';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can invite users
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can invite users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, name, role = 'manager' } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'manager'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "manager"' },
        { status: 400 }
      );
    }

    // Check if email already exists as admin
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'An admin with this email already exists' },
        { status: 409 }
      );
    }

    // Check if there's a pending invitation
    const existingInvitation = await prisma.invitation.findUnique({
      where: { email }
    });

    if (existingInvitation && !existingInvitation.accepted) {
      // Delete old invitation
      await prisma.invitation.delete({
        where: { id: existingInvitation.id }
      });
    }

    // Generate unique token
    const token = generateId(40);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        name,
        role,
        token,
        expiresAt,
        createdBy: user.id
      }
    });

    // Send invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/accept-invite?token=${token}`;
    const emailResult = await sendInvitationEmail(email, name, role, inviteUrl, user.name);

    if (!emailResult.success) {
      // Clean up invitation if email fails
      await prisma.invitation.delete({
        where: { id: invitation.id }
      });
      
      return NextResponse.json(
        { error: 'Failed to send invitation email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        expiresAt: invitation.expiresAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Invite user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET all pending invitations
export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can view invitations' },
        { status: 403 }
      );
    }

    // Get all pending invitations
    const invitations = await prisma.invitation.findMany({
      where: {
        accepted: false,
        expiresAt: {
          gte: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        expiresAt: true,
        createdAt: true
      }
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Get invitations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

