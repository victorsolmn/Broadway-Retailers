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
    const body = await req.json();

    // Verify address belongs to user
    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Validate pincode
    if (body.pincode && !/^\d{6}$/.test(body.pincode)) {
      return NextResponse.json(
        { error: 'Pincode must be exactly 6 digits' },
        { status: 400 }
      );
    }

    // Validate phone
    if (body.phone && !/^\d{10}$/.test(body.phone)) {
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
          type: body.type || existing.type,
        },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        type: body.type,
        name: body.name,
        phone: body.phone,
        line1: body.addressLine1,
        line2: body.addressLine2 || null,
        landmark: body.landmark || null,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        isDefault: body.isDefault,
      },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
