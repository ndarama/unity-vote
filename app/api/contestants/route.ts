import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/contestants - List all contestants or filter by contestId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contestId = searchParams.get('contestId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const isVisible = searchParams.get('isVisible');

    const where: any = {};

    if (contestId) {
      where.contestId = contestId;
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (isVisible !== null && isVisible !== undefined) {
      where.isVisible = isVisible === 'true';
    }

    const contestants = await prisma.contestant.findMany({
      where,
      orderBy: [
        { votes: 'desc' },
        { name: 'asc' }
      ],
      include: {
        contest: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true
          }
        }
      }
    });

    // Map the response to include category name at the top level for backwards compatibility
    const mappedContestants = contestants.map(c => ({
      ...c,
      category: c.category.name,
      categoryId: c.categoryId
    }));

    return NextResponse.json(mappedContestants);
  } catch (error) {
    console.error('Error fetching contestants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contestants' },
      { status: 500 }
    );
  }
}

// POST /api/contestants - Create a new contestant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      bio,
      category,
      photoUrl,
      linkedinUrl,
      email,
      contestId,
      isVisible = true,
      status = 'active'
    } = body;

    // Validate required fields
    if (!name || !bio || !category || !photoUrl || !email || !contestId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify contest exists
    const contest = await prisma.contest.findUnique({
      where: { id: contestId }
    });

    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }

    // Find or create category
    let categoryRecord = await prisma.category.findFirst({
      where: {
        name: category,
        contestId: contestId
      }
    });

    if (!categoryRecord) {
      // Create new category if it doesn't exist
      categoryRecord = await prisma.category.create({
        data: {
          name: category,
          description: `Award category for ${category}`,
          coverPhotoUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
          displayOrder: 0,
          contestId: contestId
        }
      });
    }

    // Create contestant
    const contestant = await prisma.contestant.create({
      data: {
        name,
        bio,
        categoryId: categoryRecord.id,
        photoUrl,
        linkedinUrl,
        email,
        contestId,
        isVisible,
        status,
        votes: 0
      },
      include: {
        contest: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true
          }
        }
      }
    });

    // Map response for backwards compatibility
    const mappedContestant = {
      ...contestant,
      category: contestant.category.name,
      categoryId: contestant.categoryId
    };

    return NextResponse.json(mappedContestant, { status: 201 });
  } catch (error) {
    console.error('Error creating contestant:', error);
    return NextResponse.json(
      { error: 'Failed to create contestant' },
      { status: 500 }
    );
  }
}
