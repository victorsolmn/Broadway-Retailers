'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Clock, AlertCircle, XCircle, MessageSquare, FileText } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

type ApplicationStatus = 'submitted' | 'in_review' | 'needs_clarification' | 'clarification_submitted' | 'approved' | 'rejected';

interface TimelineEvent {
  status: string;
  timestamp: string;
  message: string;
}

interface Message {
  id: string;
  fromType: string;
  body: string;
  createdAt: string;
}

interface Application {
  id: string;
  status: ApplicationStatus;
  timeline: string;
  createdAt: string;
  profile: any;
  messages: Message[];
}

export default function StatusPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/sign-in');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchApplication();
    }
  }, [sessionStatus, router]);

  const fetchApplication = async () => {
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplication(data);
      }
    } catch (error) {
      console.error('Failed to fetch application:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading application status...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>No Application Found</CardTitle>
            <CardDescription>
              You haven't submitted an application yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/apply">
              <Button className="w-full">Apply Now</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeline: TimelineEvent[] = application.timeline ? JSON.parse(application.timeline) : [];
  const currentStep = getStepFromStatus(application.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="container mx-auto max-w-5xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Application Status</h1>
          <p className="text-muted-foreground">
            Track your Broadway Seller certification application
          </p>
        </div>

        {/* Status Train */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Application Progress</CardTitle>
            <CardDescription>
              Current status: <StatusBadge status={application.status} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>

              {/* Steps */}
              <div className="relative grid grid-cols-4 gap-4">
                <StepItem
                  number={1}
                  title="Submitted"
                  isComplete={currentStep >= 1}
                  isCurrent={currentStep === 1}
                />
                <StepItem
                  number={2}
                  title="In Review"
                  isComplete={currentStep >= 2}
                  isCurrent={currentStep === 2}
                />
                <StepItem
                  number={3}
                  title={application.status === 'needs_clarification' ? 'Clarifications' : 'Processing'}
                  isComplete={currentStep >= 3}
                  isCurrent={currentStep === 3}
                />
                <StepItem
                  number={4}
                  title={application.status === 'approved' ? 'Approved' : application.status === 'rejected' ? 'Rejected' : 'Pending'}
                  isComplete={currentStep >= 4}
                  isCurrent={currentStep === 4}
                />
              </div>
            </div>

            {/* Current Status Description */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">What's happening now?</h4>
              <p className="text-sm text-muted-foreground">
                {getStatusDescription(application.status)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Application activity history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-px h-full bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-sm">{event.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Messages & Actions */}
          <div className="space-y-6">
            {/* Live Updates */}
            {application.messages && application.messages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Broadway Live Updates</CardTitle>
                  <CardDescription>Messages from our team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {application.messages.map((message) => (
                      <div key={message.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-start gap-2 mb-1">
                          <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {message.fromType === 'admin' ? 'Broadway Team' : 'System'}
                          </span>
                        </div>
                        <p className="text-sm">{message.body}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>Get support or provide additional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/support">
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Open Support Ticket
                  </Button>
                </Link>

                {application.status === 'needs_clarification' && (
                  <Button className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Provide Clarifications
                  </Button>
                )}

                {application.status === 'approved' && (
                  <Link href="/app/home">
                    <Button className="w-full">
                      Go to Dashboard
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* SLA Notice */}
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Typical review time:</strong> 48-72 business hours. We'll notify you via email at each stage.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepItem({
  number,
  title,
  isComplete,
  isCurrent,
}: {
  number: number;
  title: string;
  isComplete: boolean;
  isCurrent: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 ${
          isComplete
            ? 'bg-primary text-primary-foreground'
            : isCurrent
            ? 'bg-primary/20 text-primary border-2 border-primary'
            : 'bg-gray-200 text-gray-400'
        }`}
      >
        {isComplete ? <CheckCircle2 className="w-6 h-6" /> : number}
      </div>
      <p className={`text-xs text-center font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
        {title}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = {
    submitted: { label: 'Submitted', variant: 'secondary' as const, icon: Clock },
    in_review: { label: 'In Review', variant: 'default' as const, icon: Clock },
    needs_clarification: { label: 'Needs Clarification', variant: 'destructive' as const, icon: AlertCircle },
    clarification_submitted: { label: 'Clarification Submitted', variant: 'secondary' as const, icon: Clock },
    approved: { label: 'Approved', variant: 'default' as const, icon: CheckCircle2 },
    rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
  };

  const { label, variant, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className="inline-flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}

function getStepFromStatus(status: ApplicationStatus): number {
  switch (status) {
    case 'submitted':
      return 1;
    case 'in_review':
      return 2;
    case 'needs_clarification':
    case 'clarification_submitted':
      return 3;
    case 'approved':
    case 'rejected':
      return 4;
    default:
      return 1;
  }
}

function getStatusDescription(status: ApplicationStatus): string {
  switch (status) {
    case 'submitted':
      return 'Your application has been submitted and is in the queue for review. Our team will begin reviewing it shortly.';
    case 'in_review':
      return 'Our team is currently reviewing your application and verifying the submitted documents. This typically takes 48-72 business hours.';
    case 'needs_clarification':
      return 'We need some additional information to process your application. Please check the messages above and provide the requested clarifications.';
    case 'clarification_submitted':
      return 'Thank you for providing the clarifications. Our team will review them and update your status soon.';
    case 'approved':
      return 'Congratulations! Your application has been approved. You can now access your seller dashboard and start listing products.';
    case 'rejected':
      return 'Unfortunately, we were unable to approve your application at this time. Please check the messages for more information.';
    default:
      return 'Processing your application...';
  }
}
