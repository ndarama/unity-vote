import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/contestants/[id] - Get a single contestant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contestant = await prisma.contestant.findUnique({
      where: { id },
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
        },
        voteRecords: {
          where: { status: 'verified' },
          select: {
            id: true,
            timestamp: true
          }
        }
      }
    });

    if (!contestant) {
      return NextResponse.json(
        { error: 'Contestant not found' },
        { status: 404 }
      );
    }

    // Map response for backwards compatibility
    const mappedContestant = {
      ...contestant,
      category: contestant.category.name,
      categoryId: contestant.categoryId
    };

    return NextResponse.json(mappedContestant);
  } catch (error) {
    console.error('Error fetching contestant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contestant' },
      { status: 500 }
    );
  }
}

// PATCH /api/contestants/[id] - Update a contestant
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      bio,
      category,
      photoUrl,
      linkedinUrl,
      email,
      isVisible,
      status
    } = body;

    // Check if contestant exists
    const existing = await prisma.contestant.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Contestant not found' },
        { status: 404 }
      );
    }

    // Build update data object (only include provided fields)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    if (email !== undefined) updateData.email = email;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (status !== undefined) updateData.status = status;

    // Handle category update
    if (category !== undefined) {
      // Find or create category
      let categoryRecord = await prisma.category.findFirst({
        where: {
          name: category,
          contestId: existing.contestId
        }
      });

      if (!categoryRecord) {
        categoryRecord = await prisma.category.create({
          data: {
            name: category,
            description: `Award category for ${category}`,
            coverPhotoUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
            displayOrder: 0,
            contestId: existing.contestId
          }
        });
      }
      
      updateData.categoryId = categoryRecord.id;
    }

    // Update contestant
    const contestant = await prisma.contestant.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(mappedContestant);
  } catch (error) {
    console.error('Error updating contestant:', error);
    return NextResponse.json(
      { error: 'Failed to update contestant' },
      { status: 500 }
    );
  }
}

// DELETE /api/contestants/[id] - Delete a contestant (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if contestant exists
    const existing = await prisma.contestant.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Contestant not found' },
        { status: 404 }
      );
    }

    // Delete contestant (cascade will handle votes)
    await prisma.contestant.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Contestant deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting contestant:', error);
    return NextResponse.json(
      { error: 'Failed to delete contestant' },
      { status: 500 }
    );
  }
}
