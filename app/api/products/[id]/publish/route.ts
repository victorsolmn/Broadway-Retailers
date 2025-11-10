import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { trackEvent, EVENTS } from '@/lib/analytics';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify product belongs to user
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: { status: 'ready' },
    });

    // Track event
    await trackEvent(EVENTS.PRODUCT_PUBLISHED, { productId: product.id, sku: product.sku }, session.user.id);

    return NextResponse.json(product);
  } catch (error) {
    console.error('Publish product error:', error);
    return NextResponse.json(
      { error: 'Failed to publish product' },
      { status: 500 }
    );
  }
}
