'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending OTP (just show the OTP field)
    setTimeout(() => {
      setShowOtp(true);
      setLoading(false);
      toast.success('OTP sent! Use 123456 for prototype login');
    }, 500);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Verify hardcoded OTP
    if (otp === '123456') {
      // Use the quick-login endpoint to bypass auth
      window.location.href = '/api/quick-login';
    } else {
      toast.error('Invalid OTP. Use 123456 for prototype login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
          <CardTitle>Sign in to Broadway Sellers</CardTitle>
          <CardDescription>
            {showOtp ? 'Enter the OTP sent to your email' : 'Enter your email to receive an OTP'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showOtp ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Prototype Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900 font-medium">
                  📝 Prototype Mode: Use OTP <strong>123456</strong> to login
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email-display"
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={loading}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>

              {/* Prototype Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900 font-medium">
                  📝 Prototype Mode: Use OTP <strong>123456</strong> to login
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowOtp(false);
                  setOtp('');
                }}
                className="w-full"
              >
                Change Email
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/apply" className="text-foreground font-medium hover:underline">
                Apply now
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
