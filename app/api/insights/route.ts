import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get products count for user
    const productsCount = await prisma.product.count({
      where: { userId: session.user.id },
    });

    // Get settlements for calculation
    const settlements = await prisma.settlement.findMany({
      where: {
        userId: session.user.id,
        periodStart: { gte: startDate },
      },
    });

    const totalSales = settlements.reduce((sum, s) => sum + s.amount, 0);

    // Generate mock data based on actual database state
    const mockOrdersCount = Math.max(productsCount * 12, 42);
    const mockRtoRate = 8.5 + Math.random() * 3; // 8.5-11.5%
    const avgOrderValue = mockOrdersCount > 0 ? totalSales / mockOrdersCount : 0;

    // Generate sales trend (daily data)
    const salesTrend = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Generate realistic-looking data with variation
      const baseSales = totalSales / days;
      const variation = 0.5 + Math.random();
      const dailySales = Math.floor(baseSales * variation);
      const dailyOrders = Math.floor((mockOrdersCount / days) * variation);

      salesTrend.push({
        date: dateStr,
        sales: dailySales,
        orders: dailyOrders,
      });
    }

    // Get actual products for top performers
    const products = await prisma.product.findMany({
      where: { userId: session.user.id },
      take: 5,
      orderBy: { createdAt: 'asc' },
    });

    const topProducts = products.map((p, idx) => ({
      sku: p.sku,
      title: p.title,
      sales: Math.floor(20 + Math.random() * 30) * (products.length - idx),
      revenue: Math.floor((p.price * (20 + Math.random() * 30)) * (products.length - idx)),
    }));

    // Category breakdown
    const categoryMap = new Map<string, number>();
    products.forEach(p => {
      categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      value: count * 10000 + Math.floor(Math.random() * 5000),
    }));

    // If no categories, provide mock data
    if (categoryBreakdown.length === 0) {
      categoryBreakdown.push(
        { category: 'Fashion', value: 45000 },
        { category: 'Footwear', value: 28000 },
        { category: 'Accessories', value: 15000 }
      );
    }

    // Order status breakdown (mock realistic data)
    const statusBreakdown = [
      { status: 'Delivered', count: Math.floor(mockOrdersCount * 0.75) },
      { status: 'In Transit', count: Math.floor(mockOrdersCount * 0.12) },
      { status: 'Processing', count: Math.floor(mockOrdersCount * 0.05) },
      { status: 'RTO', count: Math.floor(mockOrdersCount * mockRtoRate / 100) },
      { status: 'Cancelled', count: Math.floor(mockOrdersCount * 0.03) },
    ];

    const insights = {
      totalSales,
      totalOrders: mockOrdersCount,
      rtoRate: mockRtoRate,
      averageOrderValue: avgOrderValue,
      salesTrend,
      topProducts: topProducts.length > 0 ? topProducts : [
        { sku: 'DEMO-001', title: 'Sample Product 1', sales: 45, revenue: 22450 },
        { sku: 'DEMO-002', title: 'Sample Product 2', sales: 38, revenue: 18960 },
        { sku: 'DEMO-003', title: 'Sample Product 3', sales: 32, revenue: 15680 },
      ],
      categoryBreakdown,
      statusBreakdown,
    };

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Get insights error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
