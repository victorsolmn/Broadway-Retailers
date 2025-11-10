import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Find demo seller
    let user = await prisma.user.findUnique({
      where: { email: 'seller@demo.local' },
    });

    if (!user) {
      // Create if doesn't exist
      user = await prisma.user.create({
        data: {
          email: 'seller@demo.local',
          name: 'Demo Seller',
          role: 'seller',
          emailVerified: new Date(),
        },
      });

      // Create profile
      const profile = await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          fullName: 'Demo Seller',
          phone: '+919876543210',
          brandName: 'Demo Brand',
          category: 'Fashion',
          availabilityStage: '1-3 years',
          gstAvailable: true,
          gstin: '27AABCU9603R1ZM',
          legalName: 'Demo Brand Pvt Ltd',
          pan: 'AABCU9603R',
          addressLine1: '123 Demo Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
        },
      });

      // Create application
      await prisma.sellerApplication.create({
        data: {
          userId: user.id,
          profileId: profile.id,
          status: 'approved',
          timeline: JSON.stringify([
            { status: 'approved', timestamp: new Date().toISOString(), message: 'Auto-approved for demo' },
          ]),
        },
      });

      // Create seller account
      await prisma.sellerAccount.create({
        data: {
          userId: user.id,
          certificationBadge: true,
          features: JSON.stringify({
            rtoShield: { addressValidation: true, codOtp: true, prepaidNudge: true },
          }),
        },
      });

      // Create checklist with all items marked as completed
      const now = new Date().toISOString();
      await prisma.onboardingChecklist.create({
        data: {
          userId: user.id,
          items: JSON.stringify([
            { key: 'add_product', status: 'completed', completedAt: now },
            { key: 'add_finance', status: 'completed', completedAt: now },
            { key: 'add_address', status: 'completed', completedAt: now },
            { key: 'configure_rto', status: 'completed', completedAt: now },
            { key: 'review_fees', status: 'completed', completedAt: now },
            { key: 'invite_team', status: 'completed', completedAt: now },
          ]),
        },
      });

      // Create dummy products
      await prisma.product.createMany({
        data: [
          {
            userId: user.id,
            title: 'Premium Cotton T-Shirt',
            description: 'High-quality 100% cotton t-shirt with modern fit. Perfect for casual wear.',
            category: 'Fashion',
            brand: 'Demo Brand',
            sku: 'DEMO-TSHIRT-001',
            barcode: '1234567890123',
            hsn: '6109',
            price: 799,
            mrp: 1299,
            taxRate: 12.0,
            stock: 150,
            weight: 0.2,
            dimensions: JSON.stringify({ length: 30, width: 25, height: 2 }),
            originCountry: 'India',
            images: JSON.stringify(['https://via.placeholder.com/400']),
            variants: JSON.stringify([
              { size: 'S', color: 'Black', stock: 30 },
              { size: 'M', color: 'Black', stock: 50 },
              { size: 'L', color: 'Black', stock: 40 },
              { size: 'XL', color: 'Black', stock: 30 },
            ]),
            status: 'ready',
          },
          {
            userId: user.id,
            title: 'Designer Jeans - Slim Fit',
            description: 'Stylish slim fit jeans made with premium denim fabric.',
            category: 'Fashion',
            brand: 'Demo Brand',
            sku: 'DEMO-JEANS-001',
            barcode: '1234567890456',
            hsn: '6203',
            price: 1899,
            mrp: 2999,
            taxRate: 12.0,
            stock: 80,
            weight: 0.5,
            dimensions: JSON.stringify({ length: 40, width: 35, height: 5 }),
            originCountry: 'India',
            images: JSON.stringify(['https://via.placeholder.com/400']),
            variants: JSON.stringify([
              { size: '28', color: 'Blue', stock: 15 },
              { size: '30', color: 'Blue', stock: 20 },
              { size: '32', color: 'Blue', stock: 25 },
              { size: '34', color: 'Blue', stock: 20 },
            ]),
            status: 'ready',
          },
          {
            userId: user.id,
            title: 'Casual Sneakers',
            description: 'Comfortable casual sneakers for everyday wear. Breathable and durable.',
            category: 'Footwear',
            brand: 'Demo Brand',
            sku: 'DEMO-SHOES-001',
            barcode: '1234567890789',
            hsn: '6404',
            price: 2499,
            mrp: 3999,
            taxRate: 18.0,
            stock: 60,
            weight: 0.8,
            dimensions: JSON.stringify({ length: 30, width: 20, height: 12 }),
            originCountry: 'India',
            images: JSON.stringify(['https://via.placeholder.com/400']),
            variants: JSON.stringify([
              { size: '7', color: 'White', stock: 10 },
              { size: '8', color: 'White', stock: 15 },
              { size: '9', color: 'White', stock: 20 },
              { size: '10', color: 'White', stock: 15 },
            ]),
            status: 'ready',
          },
        ],
      });

      // Create payout method (bank details)
      await prisma.payoutMethod.create({
        data: {
          userId: user.id,
          type: 'bank',
          details: JSON.stringify({
            accountHolder: 'Demo Brand Pvt Ltd',
            accountNumber: '1234567890',
            ifsc: 'HDFC0001234',
            bankName: 'HDFC Bank',
          }),
          verified: true,
        },
      });

      // Create pickup and return addresses
      await prisma.address.createMany({
        data: [
          {
            userId: user.id,
            type: 'pickup',
            name: 'Demo Brand Warehouse',
            phone: '+919876543210',
            line1: '123 Demo Street',
            line2: 'Near Demo Mall',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            landmark: 'Opposite XYZ Building',
            isDefault: true,
          },
          {
            userId: user.id,
            type: 'return',
            name: 'Demo Brand Returns Center',
            phone: '+919876543211',
            line1: '456 Return Avenue',
            line2: 'Commercial Complex',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400002',
            landmark: 'Near ABC Station',
            isDefault: true,
          },
        ],
      });
    }

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    const sessionToken = `quick-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: expiresAt,
      },
    });

    // Create response with redirect
    const response = NextResponse.redirect(new URL('/app/home', req.url));

    // Set session cookie
    response.cookies.set('authjs.session-token', sessionToken, {
      expires: expiresAt,
      httpOnly: true,
      secure: false, // Allow HTTP for local dev
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Quick login error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
