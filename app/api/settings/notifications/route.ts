import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    await prisma.notificationPreference.upsert({
      where: { userId: session.user.id },
      update: {
        email: body.email,
        orderUpdates: body.orderUpdates,
        paymentAlerts: body.paymentAlerts,
        productAlerts: body.productAlerts,
      },
      create: {
        userId: session.user.id,
        email: body.email,
        orderUpdates: body.orderUpdates,
        paymentAlerts: body.paymentAlerts,
        productAlerts: body.productAlerts,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update notification settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}
