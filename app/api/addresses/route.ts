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

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
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

    // Validate pincode
    if (!/^\d{6}$/.test(body.pincode)) {
      return NextResponse.json(
        { error: 'Pincode must be exactly 6 digits' },
        { status: 400 }
      );
    }

    // Validate phone
    if (!/^\d{10}$/.test(body.phone)) {
      return NextResponse.json(
        { error: 'Phone must be exactly 10 digits' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults of same type
    if (body.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          type: body.type,
        },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        type: body.type,
        name: body.name,
        phone: body.phone,
        line1: body.addressLine1,
        line2: body.addressLine2 || null,
        landmark: body.landmark || null,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        isDefault: body.isDefault || false,
      },
    });

    // Track event
    await trackEvent(
      EVENTS.ADDRESS_ADDED,
      { type: address.type, isDefault: address.isDefault },
      session.user.id
    );

    // Update checklist on first address
    const checklist = await prisma.onboardingChecklist.findUnique({
      where: { userId: session.user.id },
    });

    if (checklist) {
      const items = JSON.parse(checklist.items);
      const addressItem = items.find((item: any) => item.key === 'add_address');
      if (addressItem && addressItem.status === 'pending') {
        addressItem.status = 'completed';
        addressItem.completedAt = new Date().toISOString();
        await prisma.onboardingChecklist.update({
          where: { userId: session.user.id },
          data: { items: JSON.stringify(items) },
        });
      }
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}
