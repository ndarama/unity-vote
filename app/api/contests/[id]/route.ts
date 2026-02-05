import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/contests/[id] - Get a single contest with contestants
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeWithdrawn = searchParams.get('includeWithdrawn') === 'true';

    const contest = await prisma.contest.findUnique({
      where: { id },
      include: {
        contestants: {
          where: includeWithdrawn ? {} : {
            status: 'active'
          },
          orderBy: {
            votes: 'desc'
          }
        },
        _count: {
          select: {
            contestants: true,
            votes: true
          }
        }
      }
    });

    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(contest);
  } catch (error) {
    console.error('Error fetching contest:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contest' },
      { status: 500 }
    );
  }
}

// PATCH /api/contests/[id] - Update a contest
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      bannerUrl,
      status
    } = body;

    // Check if contest exists
    const existing = await prisma.contest.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }

    // Build update data object
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    if (status !== undefined) updateData.status = status;

    // Update contest
    const contest = await prisma.contest.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(contest);
  } catch (error) {
    console.error('Error updating contest:', error);
    return NextResponse.json(
      { error: 'Failed to update contest' },
      { status: 500 }
    );
  }
}

// DELETE /api/contests/[id] - Delete a contest
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if contest exists
    const existing = await prisma.contest.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }

    // Delete contest (cascade will handle contestants and votes)
    await prisma.contest.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Contest deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting contest:', error);
    return NextResponse.json(
      { error: 'Failed to delete contest' },
      { status: 500 }
    );
  }
}
