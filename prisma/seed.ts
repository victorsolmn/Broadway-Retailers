import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@broadway.local' },
    update: {},
    create: {
      email: 'admin@broadway.local',
      name: 'Broadway Admin',
      role: 'admin',
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create demo seller user
  const seller = await prisma.user.upsert({
    where: { email: 'seller@brand.local' },
    update: {},
    create: {
      email: 'seller@brand.local',
      name: 'Demo Seller',
      role: 'seller',
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created demo seller:', seller.email);

  // Create seller profile
  const profile = await prisma.sellerProfile.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      fullName: 'Demo Seller',
      phone: '+919876543210',
      brandName: 'Demo Fashion Brand',
      category: 'Fashion',
      availabilityStage: '1-3 years',
      gstAvailable: true,
      gstin: '27AABCU9603R1ZM',
      legalName: 'Demo Fashion Brand Pvt Ltd',
      pan: 'AABCU9603R',
      addressLine1: '123 Fashion Street',
      addressLine2: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      companyName: 'Demo Fashion Brand Pvt Ltd',
      website: 'https://demofashion.com',
    },
  });

  // Create seller application (approved)
  const application = await prisma.sellerApplication.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      profileId: profile.id,
      status: 'approved',
      timeline: JSON.stringify([
        {
          status: 'submitted',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          message: 'Application submitted',
        },
        {
          status: 'in_review',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          message: 'Application under review',
        },
        {
          status: 'approved',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          message: 'Application approved - Welcome to Broadway!',
        },
      ]),
    },
  });

  // Create seller account
  const account = await prisma.sellerAccount.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      certificationBadge: true,
      features: JSON.stringify({
        rtoShield: {
          enabled: true,
          addressValidation: true,
          codOtp: true,
          prepaidNudge: true,
        },
      }),
    },
  });

  // Create onboarding checklist
  await prisma.onboardingChecklist.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      items: JSON.stringify([
        { key: 'add_product', status: 'completed', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { key: 'add_finance', status: 'completed', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { key: 'add_address', status: 'completed', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { key: 'configure_rto', status: 'completed', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { key: 'review_fees', status: 'completed', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { key: 'invite_team', status: 'pending', completedAt: null },
      ]),
    },
  });

  // Create demo products
  const products = [
    {
      title: 'Premium Cotton T-Shirt',
      description: 'Comfortable 100% cotton t-shirt with premium finish',
      category: 'Fashion',
      brand: 'Demo Fashion Brand',
      sku: 'DFB-TS-001',
      barcode: '1234567890123',
      hsn: '6109',
      price: 499,
      mrp: 999,
      taxRate: 5,
      stock: 150,
      weight: 0.2,
      dimensions: JSON.stringify({ length: 30, width: 25, height: 2 }),
      images: JSON.stringify(['/uploads/tshirt-1.jpg', '/uploads/tshirt-2.jpg']),
      status: 'ready',
    },
    {
      title: 'Denim Jeans - Slim Fit',
      description: 'Classic slim fit denim jeans with stretch comfort',
      category: 'Fashion',
      brand: 'Demo Fashion Brand',
      sku: 'DFB-JN-002',
      barcode: '1234567890124',
      hsn: '6203',
      price: 1299,
      mrp: 2499,
      taxRate: 5,
      stock: 80,
      weight: 0.5,
      dimensions: JSON.stringify({ length: 40, width: 30, height: 5 }),
      images: JSON.stringify(['/uploads/jeans-1.jpg', '/uploads/jeans-2.jpg']),
      status: 'ready',
    },
    {
      title: 'Summer Dress - Floral Print',
      description: 'Light and breezy summer dress with beautiful floral print',
      category: 'Fashion',
      brand: 'Demo Fashion Brand',
      sku: 'DFB-DR-003',
      barcode: '1234567890125',
      hsn: '6204',
      price: 899,
      mrp: 1799,
      taxRate: 5,
      stock: 60,
      weight: 0.3,
      dimensions: JSON.stringify({ length: 35, width: 28, height: 3 }),
      images: JSON.stringify(['/uploads/dress-1.jpg']),
      status: 'ready',
    },
    {
      title: 'Casual Sneakers',
      description: 'Comfortable everyday sneakers with cushioned sole',
      category: 'Footwear',
      brand: 'Demo Fashion Brand',
      sku: 'DFB-SN-004',
      barcode: '1234567890126',
      hsn: '6404',
      price: 1599,
      mrp: 2999,
      taxRate: 12,
      stock: 100,
      weight: 0.8,
      dimensions: JSON.stringify({ length: 30, width: 15, height: 12 }),
      images: JSON.stringify(['/uploads/sneakers-1.jpg', '/uploads/sneakers-2.jpg']),
      status: 'ready',
    },
    {
      title: 'Winter Jacket - Hooded',
      description: 'Warm winter jacket with hood and fleece lining',
      category: 'Fashion',
      brand: 'Demo Fashion Brand',
      sku: 'DFB-JK-005',
      barcode: '1234567890127',
      hsn: '6201',
      price: 2499,
      mrp: 4999,
      taxRate: 12,
      stock: 45,
      weight: 0.9,
      dimensions: JSON.stringify({ length: 50, width: 40, height: 8 }),
      images: JSON.stringify(['/uploads/jacket-1.jpg']),
      status: 'ready',
    },
    {
      title: 'Leather Wallet',
      description: 'Genuine leather wallet with multiple card slots',
      category: 'Fashion',
      brand: 'Demo Fashion Brand',
      sku: 'DFB-WL-006',
      barcode: '1234567890128',
      hsn: '4202',
      price: 599,
      mrp: 1199,
      taxRate: 18,
      stock: 200,
      weight: 0.1,
      dimensions: JSON.stringify({ length: 12, width: 10, height: 2 }),
      images: JSON.stringify(['/uploads/wallet-1.jpg']),
      status: 'ready',
    },
  ];

  for (const productData of products) {
    await prisma.product.create({
      data: {
        ...productData,
        userId: seller.id,
      },
    });
  }
  console.log(`✅ Created ${products.length} demo products`);

  // Create bank details
  await prisma.payoutMethod.create({
    data: {
      userId: seller.id,
      type: 'bank',
      details: JSON.stringify({
        accountHolder: 'Demo Fashion Brand Pvt Ltd',
        accountNumber: '1234567890',
        ifsc: 'HDFC0001234',
        bankName: 'HDFC Bank',
      }),
      verified: true,
    },
  });
  console.log('✅ Created bank details');

  // Create addresses
  await prisma.address.createMany({
    data: [
      {
        userId: seller.id,
        type: 'pickup',
        name: 'Demo Fashion Brand Warehouse',
        phone: '+919876543210',
        line1: '123 Fashion Street',
        line2: 'Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        isDefault: true,
      },
      {
        userId: seller.id,
        type: 'return',
        name: 'Demo Fashion Brand Returns',
        phone: '+919876543210',
        line1: '456 Returns Lane',
        line2: 'Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400069',
        isDefault: true,
      },
    ],
  });
  console.log('✅ Created addresses');

  // Create settlements
  const settlements = [
    {
      amount: 45680,
      fees: JSON.stringify({ commission: 5120, payment: 1024, shipping: 2340 }),
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
      expectedPayoutDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      status: 'completed',
    },
    {
      amount: 38920,
      fees: JSON.stringify({ commission: 4324, payment: 865, shipping: 1980 }),
      periodStart: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      expectedPayoutDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      status: 'completed',
    },
    {
      amount: 52340,
      fees: JSON.stringify({ commission: 5815, payment: 1163, shipping: 2600 }),
      periodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      expectedPayoutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'pending',
    },
  ];

  for (const settlement of settlements) {
    await prisma.settlement.create({
      data: {
        ...settlement,
        userId: seller.id,
      },
    });
  }
  console.log('✅ Created settlements');

  // Create support tickets
  await prisma.supportTicket.create({
    data: {
      userId: seller.id,
      applicationId: application.id,
      subject: 'Question about payment timelines',
      message: 'When can I expect the first payout after listing products?',
      status: 'closed',
    },
  });
  console.log('✅ Created support ticket');

  // Create analytics events
  const events = [
    { eventName: 'application_submitted', userId: seller.id },
    { eventName: 'application_approved', userId: seller.id },
    { eventName: 'product_published', userId: seller.id, eventData: JSON.stringify({ sku: 'DFB-TS-001' }) },
    { eventName: 'product_published', userId: seller.id, eventData: JSON.stringify({ sku: 'DFB-JN-002' }) },
    { eventName: 'finance_added', userId: seller.id },
    { eventName: 'address_added', userId: seller.id },
  ];

  for (const event of events) {
    await prisma.analyticsEvent.create({ data: event });
  }
  console.log('✅ Created analytics events');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Demo Credentials:');
  console.log('Admin: admin@broadway.local');
  console.log('Seller: seller@brand.local');
  console.log('\n💡 Use magic link authentication (check tmp/emails for links)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
