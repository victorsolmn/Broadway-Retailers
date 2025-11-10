import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get seller account with features
    const account = await prisma.sellerAccount.findUnique({
      where: { userId: session.user.id },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const features = account.features ? JSON.parse(account.features) : {};
    const rtoShield = features.rtoShield || {
      addressValidation: true,
      codOtp: true,
      prepaidNudge: true,
    };

    // Get or create notifications preferences
    let notificationPrefs = await prisma.notificationPreference.findUnique({
      where: { userId: session.user.id },
    });

    if (!notificationPrefs) {
      notificationPrefs = await prisma.notificationPreference.create({
        data: {
          userId: session.user.id,
          email: true,
          orderUpdates: true,
          paymentAlerts: true,
          productAlerts: true,
        },
      });
    }

    // Get API key
    const apiKey = await prisma.apiKey.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      rtoShield,
      notifications: {
        email: notificationPrefs.email,
        orderUpdates: notificationPrefs.orderUpdates,
        paymentAlerts: notificationPrefs.paymentAlerts,
        productAlerts: notificationPrefs.productAlerts,
      },
      apiKey: apiKey?.key || null,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
