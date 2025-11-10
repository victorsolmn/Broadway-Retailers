'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowRight, Package, DollarSign, MapPin, Shield, Calculator, Users, Home, BarChart3, Settings, Menu, X, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface ChecklistItem {
  key: string;
  status: 'pending' | 'completed';
  completedAt: string | null;
}

interface Checklist {
  items: ChecklistItem[];
}

const checklistConfig = {
  add_product: {
    title: 'Add your first product',
    description: 'Create your first product listing to start selling',
    icon: Package,
    href: '/app/catalog',
    action: 'Add Product',
  },
  add_finance: {
    title: 'Add finance details',
    description: 'Set up your bank account for payouts',
    icon: DollarSign,
    href: '/app/finance',
    action: 'Add Bank Details',
  },
  add_address: {
    title: 'Add pickup & return address',
    description: 'Configure your shipping and return addresses',
    icon: MapPin,
    href: '/app/addresses',
    action: 'Add Addresses',
  },
  configure_rto: {
    title: 'Configure RTO Shield',
    description: 'Enable return protection features (default ON)',
    icon: Shield,
    href: '/app/settings',
    action: 'Review Settings',
  },
  review_fees: {
    title: 'Review fee simulator',
    description: 'Understand your profit margins per SKU',
    icon: Calculator,
    href: '/app/catalog',
    action: 'Open Simulator',
  },
  invite_team: {
    title: 'Invite teammate (optional)',
    description: 'Add team members to manage your account',
    icon: Users,
    href: '/app/settings',
    action: 'Invite Member',
  },
};

export default function HomePage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/sign-in');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchChecklist();
    }
  }, [sessionStatus, router]);

  const fetchChecklist = async () => {
    try {
      const res = await fetch('/api/checklist');
      if (res.ok) {
        const data = await res.json();
        setChecklist(data);
      }
    } catch (error) {
      console.error('Failed to fetch checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const items = checklist?.items || [];
  const completedCount = items.filter(item => item.status === 'completed').length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isComplete = completedCount === totalCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-0">
      {/* Mobile Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-6 h-6 md:w-8 md:h-8" />
            <span className="text-lg md:text-xl font-bold">Broadway</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/app/home" className="text-sm font-medium text-primary">
              Home
            </Link>
            <Link href="/app/catalog" className="text-sm font-medium hover:text-primary transition">
              Catalog
            </Link>
            <Link href="/app/finance" className="text-sm font-medium hover:text-primary transition">
              Finance
            </Link>
            <Link href="/app/addresses" className="text-sm font-medium hover:text-primary transition">
              Addresses
            </Link>
            <Link href="/app/insights" className="text-sm font-medium hover:text-primary transition">
              Insights
            </Link>
            <Link href="/app/support" className="text-sm font-medium hover:text-primary transition">
              Support
            </Link>
            <Link href="/app/settings" className="text-sm font-medium hover:text-primary transition">
              Settings
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm font-medium hover:text-primary transition"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="flex flex-col space-y-4 mt-8">
                <Link
                  href="/app/home"
                  className="text-base font-medium text-primary flex items-center space-x-3 p-3 rounded-lg bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/app/catalog"
                  className="text-base font-medium hover:text-primary transition flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="w-5 h-5" />
                  <span>Catalog</span>
                </Link>
                <Link
                  href="/app/finance"
                  className="text-base font-medium hover:text-primary transition flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Finance</span>
                </Link>
                <Link
                  href="/app/addresses"
                  className="text-base font-medium hover:text-primary transition flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MapPin className="w-5 h-5" />
                  <span>Addresses</span>
                </Link>
                <Link
                  href="/app/insights"
                  className="text-base font-medium hover:text-primary transition flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Insights</span>
                </Link>
                <Link
                  href="/app/support"
                  className="text-base font-medium hover:text-primary transition flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="w-5 h-5" />
                  <span>Support</span>
                </Link>
                <Link
                  href="/app/settings"
                  className="text-base font-medium hover:text-primary transition flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
                <hr className="my-2" />
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="text-base font-medium text-red-600 hover:text-red-700 transition flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Welcome Banner */}
        <Card className="mb-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:justify-between gap-3">
              <div>
                <CardTitle className="text-xl md:text-2xl mb-2">
                  Welcome to Broadway Sellers! 🎉
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  You're now Broadway Certified. Complete the steps below to start selling.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs md:text-sm self-start">
                Broadway Certified
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle>Getting Started Checklist</CardTitle>
              <span className="text-sm font-medium text-muted-foreground">
                {completedCount} of {totalCount} completed
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent>
            {isComplete ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">All Set!</h3>
                <p className="text-muted-foreground mb-4">
                  You've completed all onboarding steps. You're ready to sell on Broadway.
                </p>
                <Link href="/app/catalog">
                  <Button>
                    Go to Catalog <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete these steps to unlock the full potential of your Broadway Seller account.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Checklist Items */}
        <div className="space-y-4">
          {items.map((item) => {
            const config = checklistConfig[item.key as keyof typeof checklistConfig];
            if (!config) return null;

            const Icon = config.icon;
            const isCompleted = item.status === 'completed';

            return (
              <Card
                key={item.key}
                className={`transition-all ${isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className={`p-2 md:p-3 rounded-full flex-shrink-0 ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                      ) : (
                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-base md:text-lg flex-1">
                            {config.title}
                          </h3>
                          {isCompleted && (
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {config.description}
                        </p>
                      </div>

                      {!isCompleted && (
                        <Link href={config.href}>
                          <Button className="mt-3 w-full md:w-auto" size="sm">
                            {config.action} <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                      )}

                      {isCompleted && item.completedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Completed {new Date(item.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Links */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Access key features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/app/catalog">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 w-4 h-4" />
                  Manage Products
                </Button>
              </Link>
              <Link href="/app/insights">
                <Button variant="outline" className="w-full justify-start">
                  <Calculator className="mr-2 w-4 h-4" />
                  View Analytics
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 w-4 h-4" />
                  Contact Support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Link
            href="/app/home"
            className="flex flex-col items-center justify-center py-2 text-primary"
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            href="/app/catalog"
            className="flex flex-col items-center justify-center py-2 text-gray-600 hover:text-primary transition"
          >
            <Package className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Catalog</span>
          </Link>
          <Link
            href="/app/insights"
            className="flex flex-col items-center justify-center py-2 text-gray-600 hover:text-primary transition"
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Insights</span>
          </Link>
          <Link
            href="/app/settings"
            className="flex flex-col items-center justify-center py-2 text-gray-600 hover:text-primary transition"
          >
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
