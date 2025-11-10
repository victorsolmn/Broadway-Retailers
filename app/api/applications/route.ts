import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/email';
import { trackEvent, EVENTS } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    // Create or find user
    let user = session?.user
      ? await prisma.user.findUnique({ where: { id: session.user.id } })
      : await prisma.user.findUnique({ where: { email: body.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: body.email,
          name: body.fullName,
          role: 'seller',
        },
      });
    }

    // Create seller profile
    const profile = await prisma.sellerProfile.create({
      data: {
        userId: user.id,
        fullName: body.fullName,
        phone: body.phone,
        brandName: body.brandName,
        category: body.category,
        availabilityStage: body.availabilityStage,
        gstAvailable: body.gstAvailable,
        gstin: body.gstin,
        legalName: body.legalName,
        pan: body.pan,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        companyName: body.companyName,
        cin: body.cin,
        website: body.website,
        additionalInfo: body.additionalInfo,
        attachments: body.attachments ? JSON.stringify(body.attachments) : null,
      },
    });

    // Create application
    const application = await prisma.sellerApplication.create({
      data: {
        userId: user.id,
        profileId: profile.id,
        status: 'submitted',
        timeline: JSON.stringify([
          {
            status: 'submitted',
            timestamp: new Date().toISOString(),
            message: 'Application submitted',
          },
        ]),
      },
    });

    // Track analytics
    await trackEvent(EVENTS.APPLICATION_SUBMITTED, { applicationId: application.id }, user.id);

    // Send confirmation email
    const trackingUrl = `${process.env.NEXTAUTH_URL}/status`;
    await sendEmail(emailTemplates.applicationSubmitted(body.email, trackingUrl));

    return NextResponse.json({
      success: true,
      applicationId: application.id,
    });
  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const application = await prisma.sellerApplication.findUnique({
      where: { userId: session.user.id },
      include: {
        profile: true,
        messages: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}
