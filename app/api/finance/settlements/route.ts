import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settlements = await prisma.settlement.findMany({
      where: { userId: session.user.id },
      orderBy: { periodEnd: 'desc' },
    });

    return NextResponse.json(settlements);
  } catch (error) {
    console.error('Get settlements error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settlements' },
      { status: 500 }
    );
  }
}
