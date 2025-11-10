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

    const account = await prisma.sellerAccount.findUnique({
      where: { userId: session.user.id },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const features = account.features ? JSON.parse(account.features) : {};
    features.rtoShield = body;

    await prisma.sellerAccount.update({
      where: { userId: session.user.id },
      data: { features: JSON.stringify(features) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update RTO Shield settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update RTO Shield settings' },
      { status: 500 }
    );
  }
}
