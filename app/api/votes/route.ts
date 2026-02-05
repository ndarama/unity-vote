import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST /api/votes - Cast a vote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, contestantId, contestId, ipAddress } = body;

    // Validate required fields
    if (!email || !contestantId || !contestId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if contest exists and is active
    const contest = await prisma.contest.findUnique({
      where: { id: contestId }
    });

    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }

    if (contest.status !== 'active') {
      return NextResponse.json(
        { error: 'Voting is currently closed for this contest' },
        { status: 400 }
      );
    }

    // Check if contestant exists and is eligible
    const contestant = await prisma.contestant.findUnique({
      where: { id: contestantId }
    });

    if (!contestant) {
      return NextResponse.json(
        { error: 'Contestant not found' },
        { status: 404 }
      );
    }

    if (contestant.status !== 'active' || !contestant.isVisible) {
      return NextResponse.json(
        { error: 'This contestant is not eligible for voting' },
        { status: 400 }
      );
    }

    // Check if user has already voted in this contest
    const existingVote = await prisma.vote.findUnique({
      where: {
        email_contestId: {
          email,
          contestId
        }
      }
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted in this contest' },
        { status: 400 }
      );
    }

    // Create vote (initially pending, to be verified via OTP)
    const vote = await prisma.vote.create({
      data: {
        email,
        contestantId,
        contestId,
        status: 'pending',
        ipAddress
      }
    });

    return NextResponse.json(
      { 
        message: 'Vote recorded. Please verify via OTP.',
        voteId: vote.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating vote:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}
