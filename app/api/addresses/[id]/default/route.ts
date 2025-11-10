import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify address belongs to user
    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Unset other defaults of same type
    await prisma.address.updateMany({
      where: {
        userId: session.user.id,
        type: existing.type,
      },
      data: { isDefault: false },
    });

    // Set this address as default
    const address = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error('Set default address error:', error);
    return NextResponse.json(
      { error: 'Failed to set default address' },
      { status: 500 }
    );
  }
}
