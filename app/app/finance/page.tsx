'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Download, Plus, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { MobileAppShell } from '@/components/MobileAppShell';

interface BankDetails {
  id: string;
  details: string;
  verified: boolean;
}

interface Settlement {
  id: string;
  amount: number;
  fees: string;
  periodStart: string;
  periodEnd: string;
  expectedPayoutDate: string;
  status: string;
  createdAt: string;
}

export default function FinancePage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountHolder: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
  });

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/sign-in');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchFinanceData();
    }
  }, [sessionStatus, router]);

  const fetchFinanceData = async () => {
    try {
      const [bankRes, settlementsRes] = await Promise.all([
        fetch('/api/finance/bank'),
        fetch('/api/finance/settlements'),
      ]);

      if (bankRes.ok) {
        const data = await bankRes.json();
        setBankDetails(data);
      }

      if (settlementsRes.ok) {
        const data = await settlementsRes.json();
        setSettlements(data);
      }
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/finance/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Bank details saved successfully!');
        fetchFinanceData();
        setDialogOpen(false);
        setFormData({ accountHolder: '', accountNumber: '', ifsc: '', bankName: '' });
      } else {
        toast.error('Failed to save bank details');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const exportSettlements = () => {
    const csv = [
      ['Settlement ID', 'Amount', 'Commission', 'Payment Fee', 'Shipping', 'Period Start', 'Period End', 'Payout Date', 'Status'],
      ...settlements.map(s => {
        const fees = JSON.parse(s.fees);
        return [
          s.id,
          s.amount,
          fees.commission,
          fees.payment,
          fees.shipping,
          format(new Date(s.periodStart), 'yyyy-MM-dd'),
          format(new Date(s.periodEnd), 'yyyy-MM-dd'),
          format(new Date(s.expectedPayoutDate), 'yyyy-MM-dd'),
          s.status,
        ];
      }),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settlements-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Settlements exported!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading finance data...</p>
        </div>
      </div>
    );
  }

  const totalEarnings = settlements.reduce((sum, s) => sum + s.amount, 0);
  const pendingPayouts = settlements.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0);
  const completedPayouts = settlements.filter(s => s.status === 'completed').length;

  const savedBankDetails = bankDetails ? JSON.parse(bankDetails.details) : null;

  return (
    <MobileAppShell>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Finance & Payouts</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your bank details and view settlement history
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs md:text-sm">Total Earnings</CardDescription>
              <CardTitle className="text-2xl md:text-3xl">₹{totalEarnings.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs md:text-sm">Pending Payouts</CardDescription>
              <CardTitle className="text-2xl md:text-3xl text-amber-600">₹{pendingPayouts.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs md:text-sm">Completed Payouts</CardDescription>
              <CardTitle className="text-2xl md:text-3xl text-green-600">{completedPayouts}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Bank Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bank Details</CardTitle>
                <CardDescription>Your payout bank account information</CardDescription>
              </div>
              {!bankDetails && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="md:text-base">
                      <Plus className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Add Bank Details</span>
                      <span className="sm:hidden">Add Bank</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Bank Details</DialogTitle>
                      <DialogDescription>
                        Enter your bank account information for payouts
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountHolder">Account Holder Name *</Label>
                        <Input
                          id="accountHolder"
                          value={formData.accountHolder}
                          onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number *</Label>
                        <Input
                          id="accountNumber"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ifsc">IFSC Code *</Label>
                        <Input
                          id="ifsc"
                          value={formData.ifsc}
                          onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                          placeholder="HDFC0001234"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name *</Label>
                        <Input
                          id="bankName"
                          value={formData.bankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          Save Bank Details
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {bankDetails && savedBankDetails ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                    <span className="text-sm md:text-base font-semibold">Bank Account Verified</span>
                  </div>
                  {bankDetails.verified && (
                    <Badge variant="default" className="text-xs">Verified</Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Account Holder</p>
                    <p className="text-sm md:text-base font-medium">{savedBankDetails.accountHolder}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Account Number</p>
                    <p className="text-sm md:text-base font-medium font-mono">
                      ••••••{savedBankDetails.accountNumber.slice(-4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">IFSC Code</p>
                    <p className="text-sm md:text-base font-medium font-mono">{savedBankDetails.ifsc}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Bank Name</p>
                    <p className="text-sm md:text-base font-medium">{savedBankDetails.bankName}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm md:text-base">No bank details added yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settlements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Settlement History</CardTitle>
                <CardDescription>Your payout history and upcoming payments</CardDescription>
              </div>
              {settlements.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportSettlements} className="md:text-base">
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {settlements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm md:text-base">No settlements yet</p>
                <p className="text-xs md:text-sm mt-2">Settlements will appear here once you start selling</p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {settlements.map((settlement) => {
                    const fees = JSON.parse(settlement.fees);
                    return (
                      <Card key={settlement.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {format(new Date(settlement.periodStart), 'MMM dd')} - {format(new Date(settlement.periodEnd), 'MMM dd, yyyy')}
                                </span>
                              </div>
                              <div className="text-2xl font-bold">₹{settlement.amount.toLocaleString()}</div>
                            </div>
                            <Badge variant={settlement.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                              {settlement.status === 'completed' ? (
                                <><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</>
                              ) : (
                                <><Clock className="w-3 h-3 mr-1" /> Pending</>
                              )}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="border-t pt-3">
                            <div className="text-xs text-muted-foreground mb-1">Fees Breakdown</div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <div className="text-xs text-muted-foreground">Commission</div>
                                <div className="font-medium">₹{fees.commission}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Payment</div>
                                <div className="font-medium">₹{fees.payment}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Shipping</div>
                                <div className="font-medium">₹{fees.shipping}</div>
                              </div>
                            </div>
                          </div>
                          <div className="border-t pt-3 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Expected Payout</span>
                            <span className="font-medium">{format(new Date(settlement.expectedPayoutDate), 'MMM dd, yyyy')}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Fees</TableHead>
                        <TableHead>Payout Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settlements.map((settlement) => {
                        const fees = JSON.parse(settlement.fees);
                        return (
                          <TableRow key={settlement.id}>
                            <TableCell>
                              <div className="text-sm">
                                <div>{format(new Date(settlement.periodStart), 'MMM dd')} - {format(new Date(settlement.periodEnd), 'MMM dd, yyyy')}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">₹{settlement.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                <div>Commission: ₹{fees.commission}</div>
                                <div>Payment: ₹{fees.payment}</div>
                                <div>Shipping: ₹{fees.shipping}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {format(new Date(settlement.expectedPayoutDate), 'MMM dd, yyyy')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={settlement.status === 'completed' ? 'default' : 'secondary'}>
                                {settlement.status === 'completed' ? (
                                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</>
                                ) : (
                                  <><Clock className="w-3 h-3 mr-1" /> Pending</>
                                )}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileAppShell>
  );
}
