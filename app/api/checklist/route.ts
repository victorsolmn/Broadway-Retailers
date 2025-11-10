import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let checklist = await prisma.onboardingChecklist.findUnique({
      where: { userId: session.user.id },
    });

    // Create checklist if doesn't exist
    if (!checklist) {
      checklist = await prisma.onboardingChecklist.create({
        data: {
          userId: session.user.id,
          items: JSON.stringify([
            { key: 'add_product', status: 'pending', completedAt: null },
            { key: 'add_finance', status: 'pending', completedAt: null },
            { key: 'add_address', status: 'pending', completedAt: null },
            { key: 'configure_rto', status: 'pending', completedAt: null },
            { key: 'review_fees', status: 'pending', completedAt: null },
            { key: 'invite_team', status: 'pending', completedAt: null },
          ]),
        },
      });
    }

    const items = checklist.items ? JSON.parse(checklist.items) : [];

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Get checklist error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checklist' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { key, status } = body;

    const checklist = await prisma.onboardingChecklist.findUnique({
      where: { userId: session.user.id },
    });

    if (!checklist) {
      return NextResponse.json({ error: 'Checklist not found' }, { status: 404 });
    }

    const items = JSON.parse(checklist.items);
    const itemIndex = items.findIndex((item: any) => item.key === key);

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    items[itemIndex] = {
      ...items[itemIndex],
      status,
      completedAt: status === 'completed' ? new Date().toISOString() : null,
    };

    await prisma.onboardingChecklist.update({
      where: { userId: session.user.id },
      data: {
        items: JSON.stringify(items),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update checklist error:', error);
    return NextResponse.json(
      { error: 'Failed to update checklist' },
      { status: 500 }
    );
  }
}
