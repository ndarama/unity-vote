import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
// GET /api/contests - List all contests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const includeContestants = searchParams.get('includeContestants') === 'true';

    const where: any = {};

    if (status) {
      where.status = status;
    }

    const contests = await prisma.contest.findMany({
      where,
      orderBy: {
        startDate: 'desc'
      },
      include: includeContestants ? {
        contestants: {
          where: {
            isVisible: true,
            status: 'active'
          },
          select: {
            id: true,
            name: true,
            category: true,
            votes: true
          }
        },
        _count: {
          select: {
            contestants: true,
            votes: true
          }
        }
      } : {
        _count: {
          select: {
            contestants: true,
            votes: true
          }
        }
      }
    });

    return NextResponse.json(contests);
  } catch (error) {
    console.error('Error fetching contests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contests' },
      { status: 500 }
    );
  }
}

// POST /api/contests - Create a new contest
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      bannerUrl,
      status = 'upcoming'
    } = body;

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !bannerUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create contest
    const contest = await prisma.contest.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        bannerUrl,
        status
      }
    });

    return NextResponse.json(contest, { status: 201 });
  } catch (error) {
    console.error('Error creating contest:', error);
    return NextResponse.json(
      { error: 'Failed to create contest' },
      { status: 500 }
    );
  }
}
