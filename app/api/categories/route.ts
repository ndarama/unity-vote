import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contestId = searchParams.get('contestId');

    const where = contestId ? { contestId } : {};

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { contestants: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      coverPhotoUrl,
      icon,
      displayOrder,
      isActive,
      contestId,
    } = body;

    // Validate required fields
    if (!name || !description || !coverPhotoUrl || !contestId) {
      return NextResponse.json(
        { error: 'Name, description, coverPhotoUrl, and contestId are required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        coverPhotoUrl,
        icon,
        displayOrder: displayOrder ?? 0,
        isActive: isActive ?? true,
        contestId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
