'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Bell, Key, Shield, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { MobileAppShell } from '@/components/MobileAppShell';

interface Settings {
  rtoShield: {
    addressValidation: boolean;
    codOtp: boolean;
    prepaidNudge: boolean;
  };
  notifications: {
    email: boolean;
    orderUpdates: boolean;
    paymentAlerts: boolean;
    productAlerts: boolean;
  };
  apiKey: string | null;
}

export default function SettingsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/sign-in');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchSettings();
    }
  }, [sessionStatus, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRtoShieldToggle = async (key: keyof Settings['rtoShield']) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      rtoShield: {
        ...settings.rtoShield,
        [key]: !settings.rtoShield[key],
      },
    };

    try {
      const res = await fetch('/api/settings/rto-shield', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings.rtoShield),
      });

      if (res.ok) {
        setSettings(newSettings);
        toast.success('RTO Shield settings updated');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleNotificationToggle = async (key: keyof Settings['notifications']) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    };

    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings.notifications),
      });

      if (res.ok) {
        setSettings(newSettings);
        toast.success('Notification settings updated');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const generateApiKey = async () => {
    try {
      const res = await fetch('/api/settings/api-key', {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setSettings({ ...settings!, apiKey: data.apiKey });
        toast.success('API key generated successfully');
      } else {
        toast.error('Failed to generate API key');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const copyApiKey = () => {
    if (settings?.apiKey) {
      navigator.clipboard.writeText(settings.apiKey);
      setCopied(true);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <MobileAppShell>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Settings</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your account preferences and configurations
          </p>
        </div>

        <Tabs defaultValue="rto-shield" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="rto-shield" className="gap-2">
              <Shield className="w-4 h-4" />
              RTO Shield
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" />
              Team
            </TabsTrigger>
          </TabsList>

          {/* RTO Shield Tab */}
          <TabsContent value="rto-shield" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>RTO Shield Protection</CardTitle>
                    <CardDescription>
                      Reduce return-to-origin rates with smart validations
                    </CardDescription>
                  </div>
                  <Badge>Included</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="addressValidation" className="text-base font-semibold">
                      Address Validation
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Verify delivery addresses before order confirmation
                    </p>
                  </div>
                  <Switch
                    id="addressValidation"
                    checked={settings.rtoShield.addressValidation}
                    onCheckedChange={() => handleRtoShieldToggle('addressValidation')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="codOtp" className="text-base font-semibold">
                      COD OTP Verification
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Require OTP verification for cash-on-delivery orders
                    </p>
                  </div>
                  <Switch
                    id="codOtp"
                    checked={settings.rtoShield.codOtp}
                    onCheckedChange={() => handleRtoShieldToggle('codOtp')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="prepaidNudge" className="text-base font-semibold">
                      Prepaid Nudge
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Encourage prepaid orders with incentives
                    </p>
                  </div>
                  <Switch
                    id="prepaidNudge"
                    checked={settings.rtoShield.prepaidNudge}
                    onCheckedChange={() => handleRtoShieldToggle('prepaidNudge')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to receive updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="email" className="text-base font-semibold">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    id="email"
                    checked={settings.notifications.email}
                    onCheckedChange={() => handleNotificationToggle('email')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="orderUpdates" className="text-base font-semibold">
                      Order Updates
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get notified about new orders and status changes
                    </p>
                  </div>
                  <Switch
                    id="orderUpdates"
                    checked={settings.notifications.orderUpdates}
                    onCheckedChange={() => handleNotificationToggle('orderUpdates')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="paymentAlerts" className="text-base font-semibold">
                      Payment Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Notifications for settlements and payouts
                    </p>
                  </div>
                  <Switch
                    id="paymentAlerts"
                    checked={settings.notifications.paymentAlerts}
                    onCheckedChange={() => handleNotificationToggle('paymentAlerts')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="productAlerts" className="text-base font-semibold">
                      Product Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Low stock and product performance alerts
                    </p>
                  </div>
                  <Switch
                    id="productAlerts"
                    checked={settings.notifications.productAlerts}
                    onCheckedChange={() => handleNotificationToggle('productAlerts')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>
                  Manage API keys for programmatic access to your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.apiKey ? (
                  <>
                    <div className="space-y-2">
                      <Label>Your API Key</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={apiKeyVisible ? 'text' : 'password'}
                            value={settings.apiKey}
                            readOnly
                            className="font-mono"
                          />
                          <button
                            onClick={() => setApiKeyVisible(!apiKeyVisible)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <Button variant="outline" onClick={copyApiKey}>
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Keep this key secret. Do not share it in publicly accessible areas.
                      </p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm text-amber-800">
                        <strong>Security Note:</strong> Your API key provides full access to your account.
                        Regenerating it will invalidate the old key immediately.
                      </p>
                    </div>
                    <Button variant="destructive" onClick={generateApiKey}>
                      Regenerate API Key
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">No API key generated yet</p>
                    <Button onClick={generateApiKey}>
                      Generate API Key
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Invite team members to collaborate on your seller account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">Team management coming soon</p>
                  <p className="text-sm">
                    Invite team members and assign roles to manage your seller operations
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileAppShell>
  );
}
