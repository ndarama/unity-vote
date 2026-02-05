import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/votes/[id]/verify - Verify a vote with OTP
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { otp } = body;

    if (!otp) {
      return NextResponse.json(
        { error: 'OTP is required' },
        { status: 400 }
      );
    }

    // Check if vote exists
    const existingVote = await prisma.vote.findUnique({
      where: { id }
    });

    if (!existingVote) {
      return NextResponse.json(
        { error: 'Vote not found' },
        { status: 404 }
      );
    }

    if (existingVote.status === 'verified') {
      return NextResponse.json(
        { error: 'Vote already verified' },
        { status: 400 }
      );
    }

    // In production, verify OTP here
    // For now, accept '123456' as valid
    if (otp !== '123456') {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Update vote status to verified
    const vote = await prisma.vote.update({
      where: { id },
      data: { status: 'verified' }
    });

    // Increment contestant vote count
    await prisma.contestant.update({
      where: { id: vote.contestantId },
      data: {
        votes: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      message: 'Vote verified successfully',
      vote
    });
  } catch (error) {
    console.error('Error verifying vote:', error);
    return NextResponse.json(
      { error: 'Failed to verify vote' },
      { status: 500 }
    );
  }
}
