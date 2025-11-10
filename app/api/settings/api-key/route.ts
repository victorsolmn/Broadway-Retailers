import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a secure random API key
    const apiKey = `bw_${randomBytes(32).toString('hex')}`;

    // Create new API key (invalidates old ones by creating new one)
    await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        key: apiKey,
      },
    });

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error('Generate API key error:', error);
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    );
  }
}
