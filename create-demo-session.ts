import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Looking for demo users...\n');

  // Find or create seller user
  let seller = await prisma.user.findUnique({
    where: { email: 'seller@demo.local' },
    include: {
      account: true,
      products: true,
    },
  });

  if (!seller) {
    console.log('Creating demo seller account...');

    // Create seller user
    const newSeller = await prisma.user.create({
      data: {
        email: 'seller@demo.local',
        name: 'Demo Seller',
        role: 'seller',
        emailVerified: new Date(),
      },
    });

    // Create seller profile
    const profile = await prisma.sellerProfile.create({
      data: {
        userId: newSeller.id,
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
    const application = await prisma.sellerApplication.create({
      data: {
        userId: newSeller.id,
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
        userId: newSeller.id,
        certificationBadge: true,
        features: JSON.stringify({
          rtoShield: { addressValidation: true, codOtp: true, prepaidNudge: true },
        }),
      },
    });

    // Create checklist
    await prisma.onboardingChecklist.create({
      data: {
        userId: newSeller.id,
        items: JSON.stringify([
          { key: 'add_product', status: 'pending', completedAt: null },
          { key: 'add_finance', status: 'pending', completedAt: null },
          { key: 'add_address', status: 'pending', completedAt: null },
          { key: 'configure_rto', status: 'pending', completedAt: null },
          { key: 'review_fees', status: 'pending', completedAt: null },
          { key: 'invite_team', status: 'pending', completedAt: null },
        ]),
      },
    });

    // Refetch seller with includes
    seller = await prisma.user.findUnique({
      where: { id: newSeller.id },
      include: {
        account: true,
        products: true,
      },
    }) as NonNullable<typeof seller>;

    console.log('✅ Demo seller account created!\n');
  } else {
    console.log('✅ Found existing demo seller account!\n');
  }

  // Create a verification token (magic link)
  const token = `demo-bypass-${Date.now()}`;
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      identifier: seller.email,
      token,
      expires,
    },
  });

  console.log('🎉 Demo Account Ready!\n');
  console.log('📧 Email:', seller.email);
  console.log('🔗 Magic Link:', `http://localhost:3003/api/auth/callback/email?token=${token}&email=${encodeURIComponent(seller.email)}`);
  console.log('\n💡 Just click the link above to sign in automatically!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
