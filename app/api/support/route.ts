import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Get support tickets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support tickets' },
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

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        subject: body.subject,
        message: body.message,
        status: 'open',
      },
    });

    // Send confirmation email
    await sendEmail(emailTemplates.supportTicketCreated(
      session.user.email!,
      ticket.id,
      ticket.subject
    ));

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Create support ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}
