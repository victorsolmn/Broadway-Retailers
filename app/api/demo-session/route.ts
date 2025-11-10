import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    // Find or create demo seller
    let user = await prisma.user.findUnique({
      where: { email: 'seller@demo.local' },
    });

    if (!user) {
      return NextResponse.json({ error: 'Demo user not found. Run create-demo-session.ts first.' }, { status: 404 });
    }

    // Create a session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const sessionToken = `demo-session-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: expiresAt,
      },
    });

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set('authjs.session-token', sessionToken, {
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('Demo session error:', error);
    return NextResponse.json(
      { error: 'Failed to create demo session' },
      { status: 500 }
    );
  }
}
