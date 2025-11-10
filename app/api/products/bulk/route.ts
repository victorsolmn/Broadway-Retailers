import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { trackEvent, EVENTS } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Products array is required' },
        { status: 400 }
      );
    }

    // Validate and create products in bulk
    const createdProducts = [];
    const errors = [];

    for (const productData of products) {
      try {
        // Check for duplicate SKU
        const existing = await prisma.product.findFirst({
          where: {
            userId: session.user.id,
            sku: productData.sku,
          },
        });

        if (existing) {
          errors.push({
            sku: productData.sku,
            error: 'SKU already exists',
          });
          continue;
        }

        const product = await prisma.product.create({
          data: {
            userId: session.user.id,
            title: productData.title,
            description: productData.description || null,
            category: productData.category,
            brand: productData.brand,
            sku: productData.sku,
            barcode: productData.barcode || null,
            hsn: productData.hsn || null,
            price: productData.price,
            mrp: productData.mrp,
            taxRate: productData.taxRate || 18,
            stock: productData.stock || 0,
            weight: productData.weight || null,
            originCountry: productData.originCountry || 'India',
            status: 'draft', // Bulk uploads start as draft
          },
        });

        createdProducts.push(product);
      } catch (error) {
        errors.push({
          sku: productData.sku,
          error: 'Failed to create product',
        });
      }
    }

    // Track event
    if (createdProducts.length > 0) {
      await trackEvent(
        EVENTS.PRODUCT_DRAFTED,
        { count: createdProducts.length, method: 'bulk_csv' },
        session.user.id
      );

      // Update checklist on first product
      const totalProducts = await prisma.product.count({
        where: { userId: session.user.id },
      });

      if (totalProducts === createdProducts.length) {
        // This was their first product upload
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
      }
    }

    return NextResponse.json({
      count: createdProducts.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Bulk create products error:', error);
    return NextResponse.json(
      { error: 'Failed to create products' },
      { status: 500 }
    );
  }
}
