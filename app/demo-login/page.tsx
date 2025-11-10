'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

export default function DemoLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Create a direct session for demo user
      const res = await fetch('/api/demo-session', {
        method: 'POST',
      });

      if (res.ok) {
        // Redirect to dashboard
        router.push('/app/home');
      } else {
        setError('Failed to create demo session');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Package className="w-12 h-12" />
          </div>
          <CardTitle className="text-2xl">Broadway Sellers Demo</CardTitle>
          <CardDescription>
            Instant access to the seller dashboard with pre-populated data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-semibold mb-2">Demo Account Includes:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Approved seller application</li>
              <li>✓ Access to all features</li>
              <li>✓ Sample data pre-loaded</li>
              <li>✓ No forms to fill</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <Button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Loading...' : 'Enter Demo Dashboard →'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            This is a prototype demo. All data is for testing purposes only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
