import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, Shield, Zap, DollarSign, FileCheck, Package } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-8 h-8" />
            <span className="text-xl font-bold">Broadway Sellers</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition">
              How it Works
            </Link>
            <Link href="#benefits" className="text-sm font-medium hover:text-primary transition">
              Benefits
            </Link>
            <Link href="/support" className="text-sm font-medium hover:text-primary transition">
              Support
            </Link>
            <Link href="/auth/sign-in">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/apply">
              <Button size="sm">Apply Now</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            Trusted by retailers nationwide
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Launch new products <br />
            <span className="text-primary">with trust</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Broadway certifies your brand and products, giving you instant credibility and boosting discovery in our marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/apply">
              <Button size="lg" className="w-full sm:w-auto">
                Apply for Certification <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/support">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Talk to Broadway
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            ✓ Certification in 48-72 hours &nbsp;&nbsp;&nbsp; ✓ No setup fees &nbsp;&nbsp;&nbsp; ✓ Transparent pricing
          </p>
        </div>
      </section>

      {/* Value Cards */}
      <section id="benefits" className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-2 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Certification that converts</CardTitle>
              <CardDescription>
                Our Broadway Certified badge improves your ranking and builds buyer confidence from day one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                  <span>Pre-market brand legitimacy review</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                  <span>Product safety & compliance check</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                  <span>Boosted discovery in search results</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>GTM in days</CardTitle>
              <CardDescription>
                Launch playbooks, discovery boost for 14 days, and discounted shipping on your first 100 orders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                  <span>Step-by-step launch checklist</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                  <span>14-day discovery boost</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                  <span>RTO Shield defaults (reduce returns)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Transparent money</CardTitle>
              <CardDescription>
                See exactly what you'll earn with our fee simulator. Clear settlements, GST-ready invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                  <span>SKU-level profit simulator</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                  <span>Clear fee breakdown</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                  <span>GST-compliant invoices</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From application to growth, we've streamlined the entire process
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mb-4">
                  1
                </div>
                <CardTitle className="text-lg">Apply</CardTitle>
                <CardDescription>
                  Submit your brand details, GST info, and compliance docs. Takes less than 10 minutes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mb-4">
                  2
                </div>
                <CardTitle className="text-lg">Review & Certify</CardTitle>
                <CardDescription>
                  Our team reviews within 48-72 hours. Track progress in real-time with live updates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mb-4">
                  3
                </div>
                <CardTitle className="text-lg">List & Launch</CardTitle>
                <CardDescription>
                  Add products, set up payments, configure shipping. Use our guided checklist.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mb-4">
                  4
                </div>
                <CardTitle className="text-lg">Grow with Insights</CardTitle>
                <CardDescription>
                  Monitor sales, optimize pricing, track returns. See your certification impact.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Proof & Safety */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for your success</h2>
            <p className="text-muted-foreground text-lg">
              Tools and protections that help you sell more and return less
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 mb-2 text-primary" />
                <CardTitle>RTO Shield</CardTitle>
                <CardDescription>
                  Reduce return-to-origin rates with our smart verification tools
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                  Address validation (pincode/state checks)
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                  COD OTP verification
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                  Prepaid nudges (5% discount)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileCheck className="w-8 h-8 mb-2 text-primary" />
                <CardTitle>Policy Compliance Help</CardTitle>
                <CardDescription>
                  We help you get HSN codes and GST attributes right
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                  HSN/GST attribute templates
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                  Category-specific compliance guides
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                  Automated validation checks
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Common questions</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Do I need GST to sell?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes, GST registration is required to sell on Broadway. We collect your GST details during the application process to ensure compliance and enable seamless invoicing.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How fast is certification?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our target is 48-72 business hours. You can track your application status in real-time through your dashboard.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What are the fees?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We charge a 10% commission on sales plus a 2% payment processing fee. Use our fee simulator in the dashboard to see exact numbers for your SKUs.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How does the Broadway Certified badge help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Certified sellers get priority ranking in search results and a trust badge on product pages, which our data shows increases conversion rates by an average of 23%.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl md:text-4xl mb-4">Ready to get certified?</CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Join hundreds of retailers already selling with Broadway
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Apply for Certification <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/support">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Package className="w-6 h-6" />
                <span className="font-bold">Broadway Sellers</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Launch new products with trust. Broadway certifies, you grow.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#how-it-works" className="hover:text-foreground">How it Works</Link></li>
                <li><Link href="#benefits" className="hover:text-foreground">Benefits</Link></li>
                <li><Link href="/apply" className="hover:text-foreground">Apply Now</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/support" className="hover:text-foreground">Contact Us</Link></li>
                <li><Link href="/status" className="hover:text-foreground">Track Application</Link></li>
                <li><Link href="/auth/sign-in" className="hover:text-foreground">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Seller Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Broadway Sellers. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
