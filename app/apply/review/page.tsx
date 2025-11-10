import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, Mail } from 'lucide-react';

export default function ApplicationReviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-3xl">Application Submitted!</CardTitle>
          <CardDescription className="text-lg">
            Thank you for applying to Broadway Sellers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <p className="font-medium text-blue-900">Confirmation Email Sent</p>
                <p className="text-sm text-blue-700">
                  We've sent a confirmation email with your application tracking link.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">What happens next?</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Review Process</p>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your application and verify your documents within 48-72 business hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Real-time Updates</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive email notifications at each stage. Track your application status in real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Approval & Onboarding</p>
                  <p className="text-sm text-muted-foreground">
                    Once approved, you'll get access to your seller dashboard and can start listing products.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 mr-2 text-muted-foreground" />
              <p className="font-medium">Typical Timeline</p>
            </div>
            <p className="text-sm text-muted-foreground">
              48-72 business hours for initial review. We'll let you know if we need any clarifications.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/status" className="flex-1">
              <Button className="w-full">Track Application Status</Button>
            </Link>
            <Link href="/support" className="flex-1">
              <Button variant="outline" className="w-full">Contact Support</Button>
            </Link>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Have questions?{' '}
              <Link href="/support" className="text-primary hover:underline">
                Get in touch
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
