'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Package, Home, BarChart3, Settings, Menu, LogOut, DollarSign, MapPin, Users } from 'lucide-react';

interface MobileAppShellProps {
  children: React.ReactNode;
}

export function MobileAppShell({ children }: MobileAppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-0">
      {/* Mobile & Desktop Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-6 h-6 md:w-8 md:h-8" />
            <span className="text-lg md:text-xl font-bold">Broadway</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/app/home" className={`text-sm font-medium transition ${isActive('/app/home') ? 'text-primary' : 'hover:text-primary'}`}>
              Home
            </Link>
            <Link href="/app/catalog" className={`text-sm font-medium transition ${isActive('/app/catalog') ? 'text-primary' : 'hover:text-primary'}`}>
              Catalog
            </Link>
            <Link href="/app/finance" className={`text-sm font-medium transition ${isActive('/app/finance') ? 'text-primary' : 'hover:text-primary'}`}>
              Finance
            </Link>
            <Link href="/app/addresses" className={`text-sm font-medium transition ${isActive('/app/addresses') ? 'text-primary' : 'hover:text-primary'}`}>
              Addresses
            </Link>
            <Link href="/app/insights" className={`text-sm font-medium transition ${isActive('/app/insights') ? 'text-primary' : 'hover:text-primary'}`}>
              Insights
            </Link>
            <Link href="/app/support" className={`text-sm font-medium transition ${isActive('/app/support') ? 'text-primary' : 'hover:text-primary'}`}>
              Support
            </Link>
            <Link href="/app/settings" className={`text-sm font-medium transition ${isActive('/app/settings') ? 'text-primary' : 'hover:text-primary'}`}>
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
                  className={`text-base font-medium flex items-center space-x-3 p-3 rounded-lg ${
                    isActive('/app/home') ? 'text-primary bg-gray-100' : 'hover:text-primary hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/app/catalog"
                  className={`text-base font-medium flex items-center space-x-3 p-3 rounded-lg ${
                    isActive('/app/catalog') ? 'text-primary bg-gray-100' : 'hover:text-primary hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="w-5 h-5" />
                  <span>Catalog</span>
                </Link>
                <Link
                  href="/app/finance"
                  className={`text-base font-medium flex items-center space-x-3 p-3 rounded-lg ${
                    isActive('/app/finance') ? 'text-primary bg-gray-100' : 'hover:text-primary hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Finance</span>
                </Link>
                <Link
                  href="/app/addresses"
                  className={`text-base font-medium flex items-center space-x-3 p-3 rounded-lg ${
                    isActive('/app/addresses') ? 'text-primary bg-gray-100' : 'hover:text-primary hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MapPin className="w-5 h-5" />
                  <span>Addresses</span>
                </Link>
                <Link
                  href="/app/insights"
                  className={`text-base font-medium flex items-center space-x-3 p-3 rounded-lg ${
                    isActive('/app/insights') ? 'text-primary bg-gray-100' : 'hover:text-primary hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Insights</span>
                </Link>
                <Link
                  href="/app/support"
                  className={`text-base font-medium flex items-center space-x-3 p-3 rounded-lg ${
                    isActive('/app/support') ? 'text-primary bg-gray-100' : 'hover:text-primary hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="w-5 h-5" />
                  <span>Support</span>
                </Link>
                <Link
                  href="/app/settings"
                  className={`text-base font-medium flex items-center space-x-3 p-3 rounded-lg ${
                    isActive('/app/settings') ? 'text-primary bg-gray-100' : 'hover:text-primary hover:bg-gray-100'
                  }`}
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
      <main>{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Link
            href="/app/home"
            className={`flex flex-col items-center justify-center py-2 transition ${
              isActive('/app/home') ? 'text-primary' : 'text-gray-600 hover:text-primary'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            href="/app/catalog"
            className={`flex flex-col items-center justify-center py-2 transition ${
              isActive('/app/catalog') ? 'text-primary' : 'text-gray-600 hover:text-primary'
            }`}
          >
            <Package className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Catalog</span>
          </Link>
          <Link
            href="/app/insights"
            className={`flex flex-col items-center justify-center py-2 transition ${
              isActive('/app/insights') ? 'text-primary' : 'text-gray-600 hover:text-primary'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Insights</span>
          </Link>
          <Link
            href="/app/settings"
            className={`flex flex-col items-center justify-center py-2 transition ${
              isActive('/app/settings') ? 'text-primary' : 'text-gray-600 hover:text-primary'
            }`}
          >
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
