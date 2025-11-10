'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, DollarSign, RotateCcw, Star } from 'lucide-react';
import { MobileAppShell } from '@/components/MobileAppShell';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface InsightsData {
  totalSales: number;
  totalOrders: number;
  rtoRate: number;
  averageOrderValue: number;
  salesTrend: Array<{ date: string; sales: number; orders: number }>;
  topProducts: Array<{ sku: string; title: string; sales: number; revenue: number }>;
  categoryBreakdown: Array<{ category: string; value: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function InsightsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/sign-in');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchInsights();
    }
  }, [sessionStatus, router, timeRange]);

  const fetchInsights = async () => {
    try {
      const res = await fetch(`/api/insights?range=${timeRange}`);
      if (res.ok) {
        const data = await res.json();
        setData(data);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <MobileAppShell>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </MobileAppShell>
    );
  }

  return (
    <MobileAppShell>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Insights & Analytics</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Track your sales performance and growth metrics
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                timeRange === '7d'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                timeRange === '30d'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                timeRange === '90d'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Sales
              </CardDescription>
              <CardTitle className="text-2xl">₹{data.totalSales.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Total Orders
              </CardDescription>
              <CardTitle className="text-2xl">{data.totalOrders}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                RTO Rate
              </CardDescription>
              <CardTitle className="text-2xl text-amber-600">{data.rtoRate.toFixed(1)}%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Avg Order Value
              </CardDescription>
              <CardTitle className="text-2xl">₹{data.averageOrderValue.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Sales Trend Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Daily sales and order volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Sales (₹)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Top Performing Products
              </CardTitle>
              <CardDescription>Best sellers by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sku" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Sales distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.category}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Current status of all orders</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.statusBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </MobileAppShell>
  );
}
