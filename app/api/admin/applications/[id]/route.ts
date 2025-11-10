import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/email';
import { trackEvent, EVENTS } from '@/lib/analytics';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const application = await prisma.sellerApplication.findUnique({
      where: { id: params.id },
      include: {
        profile: true,
        user: true,
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, message } = body;

    const application = await prisma.sellerApplication.findUnique({
      where: { id: params.id },
      include: {
        profile: true,
        user: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const timeline = application.timeline ? JSON.parse(application.timeline) : [];

    if (action === 'approve') {
      // Update application status
      await prisma.sellerApplication.update({
        where: { id: params.id },
        data: {
          status: 'approved',
          reviewerId: session.user.id,
          timeline: JSON.stringify([
            ...timeline,
            {
              status: 'approved',
              timestamp: new Date().toISOString(),
              message: message || 'Application approved',
            },
          ]),
        },
      });

      // Create seller account
      await prisma.sellerAccount.create({
        data: {
          userId: application.userId,
          certificationBadge: true,
          features: JSON.stringify({
            rtoShield: {
              enabled: true,
              addressValidation: true,
              codOtp: true,
              prepaidNudge: true,
            },
          }),
        },
      });

      // Create onboarding checklist
      await prisma.onboardingChecklist.create({
        data: {
          userId: application.userId,
          items: JSON.stringify([
            { key: 'add_product', status: 'pending', completedAt: null },
            { key: 'add_finance', status: 'pending', completedAt: null },
            { key: 'add_address', status: 'pending', completedAt: null },
            { key: 'configure_rto', status: 'pending', completedAt: null },
            { key: 'review_fees', status: 'pending', completedAt: null },
            { key: 'invite_team', status: 'pending', completedAt: null },
          ]),
        },
      });

      // Send approval message if provided
      if (message) {
        await prisma.appMessage.create({
          data: {
            applicationId: params.id,
            fromType: 'admin',
            fromUserId: session.user.id,
            body: message,
          },
        });
      }

      // Send approval email
      const dashboardUrl = `${process.env.NEXTAUTH_URL}/app/home`;
      await sendEmail(emailTemplates.applicationApproved(application.user.email, dashboardUrl));

      // Track event
      await trackEvent(EVENTS.APPLICATION_APPROVED, { applicationId: params.id }, application.userId);

    } else if (action === 'reject') {
      await prisma.sellerApplication.update({
        where: { id: params.id },
        data: {
          status: 'rejected',
          reviewerId: session.user.id,
          timeline: JSON.stringify([
            ...timeline,
            {
              status: 'rejected',
              timestamp: new Date().toISOString(),
              message: message || 'Application rejected',
            },
          ]),
        },
      });

      // Send rejection message
      await prisma.appMessage.create({
        data: {
          applicationId: params.id,
          fromType: 'admin',
          fromUserId: session.user.id,
          body: message,
        },
      });

      // Send rejection email
      await sendEmail(emailTemplates.applicationRejected(application.user.email, message));

    } else if (action === 'clarify') {
      await prisma.sellerApplication.update({
        where: { id: params.id },
        data: {
          status: 'needs_clarification',
          reviewerId: session.user.id,
          timeline: JSON.stringify([
            ...timeline,
            {
              status: 'needs_clarification',
              timestamp: new Date().toISOString(),
              message: 'Clarification requested',
            },
          ]),
        },
      });

      // Send clarification message
      await prisma.appMessage.create({
        data: {
          applicationId: params.id,
          fromType: 'admin',
          fromUserId: session.user.id,
          body: message,
        },
      });

      // Send clarification email
      const statusUrl = `${process.env.NEXTAUTH_URL}/status`;
      await sendEmail(emailTemplates.clarificationNeeded(application.user.email, message, statusUrl));

      // Track event
      await trackEvent(EVENTS.CLARIFICATION_REQUESTED, { applicationId: params.id }, application.userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
