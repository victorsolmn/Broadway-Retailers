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

    const products = await prisma.product.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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

    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        title: body.title,
        description: body.description || null,
        category: body.category,
        brand: body.brand,
        sku: body.sku,
        barcode: body.barcode || null,
        hsn: body.hsn || null,
        price: body.price,
        mrp: body.mrp,
        taxRate: body.taxRate || 18,
        stock: body.stock || 0,
        weight: body.weight || null,
        dimensions: body.dimensions ? JSON.stringify(body.dimensions) : null,
        originCountry: body.originCountry || 'India',
        images: body.images ? JSON.stringify(body.images) : null,
        status: 'draft',
      },
    });

    // Track event
    await trackEvent(EVENTS.PRODUCT_DRAFTED, { productId: product.id, sku: product.sku }, session.user.id);

    // Update checklist
    const checklist = await prisma.onboardingChecklist.findUnique({
      where: { userId: session.user.id },
    });

    if (checklist) {
      const items = JSON.parse(checklist.items);
      const productItem = items.find((item: any) => item.key === 'add_product');
      if (productItem && productItem.status === 'pending') {
        productItem.status = 'completed';
        productItem.completedAt = new Date().toISOString();
        await prisma.onboardingChecklist.update({
          where: { userId: session.user.id },
          data: { items: JSON.stringify(items) },
        });
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
