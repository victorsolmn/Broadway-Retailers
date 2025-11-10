import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Verify product belongs to user
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
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
        originCountry: body.originCountry || 'India',
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
