import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { trackEvent, EVENTS } from '@/lib/analytics';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bankDetails = await prisma.payoutMethod.findFirst({
      where: { userId: session.user.id },
    });

    if (!bankDetails) {
      return NextResponse.json(null);
    }

    return NextResponse.json(bankDetails);
  } catch (error) {
    console.error('Get bank details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bank details' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const bankDetails = await prisma.payoutMethod.create({
      data: {
        userId: session.user.id,
        type: 'bank',
        details: JSON.stringify({
          accountHolder: body.accountHolder,
          accountNumber: body.accountNumber,
          ifsc: body.ifsc,
          bankName: body.bankName,
        }),
        verified: true, // Mock verification
      },
    });

    // Track event
    await trackEvent(EVENTS.FINANCE_ADDED, { method: 'bank' }, session.user.id);

    // Update checklist
    const checklist = await prisma.onboardingChecklist.findUnique({
      where: { userId: session.user.id },
    });

    if (checklist) {
      const items = JSON.parse(checklist.items);
      const financeItem = items.find((item: any) => item.key === 'add_finance');
      if (financeItem && financeItem.status === 'pending') {
        financeItem.status = 'completed';
        financeItem.completedAt = new Date().toISOString();
        await prisma.onboardingChecklist.update({
          where: { userId: session.user.id },
          data: { items: JSON.stringify(items) },
        });
      }
    }

    return NextResponse.json(bankDetails);
  } catch (error) {
    console.error('Create bank details error:', error);
    return NextResponse.json(
      { error: 'Failed to save bank details' },
      { status: 500 }
    );
  }
}
