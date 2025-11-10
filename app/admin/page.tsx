'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, AlertCircle, Clock, MessageSquare, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

type ApplicationStatus = 'submitted' | 'in_review' | 'needs_clarification' | 'clarification_submitted' | 'approved' | 'rejected';

interface Application {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  profile: {
    fullName: string;
    email: string;
    brandName: string;
    category: string;
    phone: string;
  };
  user: {
    email: string;
  };
}

export default function AdminConsolePage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'clarify' | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/sign-in');
      return;
    }

    if (sessionStatus === 'authenticated') {
      // Check if user is admin
      if (session?.user?.role !== 'admin') {
        router.push('/app/home');
        return;
      }
      fetchApplications();
    }
  }, [sessionStatus, router, session]);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/admin/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedApp || !actionType) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          message: actionMessage,
        }),
      });

      if (res.ok) {
        toast.success(`Application ${actionType}d successfully`);
        fetchApplications();
        setSelectedApp(null);
        setActionType(null);
        setActionMessage('');
      } else {
        toast.error('Failed to update application');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApplications = applications.filter(app =>
    filterStatus === 'all' || app.status === filterStatus
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="container mx-auto max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Console</h1>
          <p className="text-muted-foreground">
            Review and manage seller applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Applications</CardDescription>
              <CardTitle className="text-3xl">{applications.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl">
                {applications.filter(a => a.status === 'submitted' || a.status === 'in_review').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {applications.filter(a => a.status === 'approved').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Needs Clarification</CardDescription>
              <CardTitle className="text-3xl text-amber-600">
                {applications.filter(a => a.status === 'needs_clarification').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters & Actions */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Applications</CardTitle>
              <div className="flex items-center gap-4">
                <Label htmlFor="status-filter" className="text-sm font-normal">Filter:</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="status-filter" className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="needs_clarification">Needs Clarification</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.profile.brandName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{app.profile.fullName}</div>
                          <div className="text-muted-foreground">{app.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{app.profile.category}</TableCell>
                      <TableCell>
                        <StatusBadge status={app.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/admin/${app.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>

                          {app.status !== 'approved' && app.status !== 'rejected' && (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => {
                                      setSelectedApp(app);
                                      setActionType('approve');
                                      setActionMessage('');
                                    }}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Approve Application</DialogTitle>
                                    <DialogDescription>
                                      This will approve {app.profile.brandName} and grant them seller access.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="approve-message">Welcome Message (Optional)</Label>
                                      <Textarea
                                        id="approve-message"
                                        placeholder="Welcome to Broadway! You can now start listing products..."
                                        value={actionMessage}
                                        onChange={(e) => setActionMessage(e.target.value)}
                                        rows={4}
                                      />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                      <DialogTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                      </DialogTrigger>
                                      <Button onClick={handleAction} disabled={actionLoading}>
                                        {actionLoading ? 'Approving...' : 'Approve Application'}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedApp(app);
                                      setActionType('clarify');
                                      setActionMessage('');
                                    }}
                                  >
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    Request Info
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Request Clarification</DialogTitle>
                                    <DialogDescription>
                                      Ask {app.profile.brandName} for additional information.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="clarify-message">Message *</Label>
                                      <Textarea
                                        id="clarify-message"
                                        placeholder="We need more information about..."
                                        value={actionMessage}
                                        onChange={(e) => setActionMessage(e.target.value)}
                                        rows={4}
                                        required
                                      />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                      <DialogTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                      </DialogTrigger>
                                      <Button
                                        onClick={handleAction}
                                        disabled={actionLoading || !actionMessage.trim()}
                                      >
                                        {actionLoading ? 'Sending...' : 'Send Request'}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedApp(app);
                                      setActionType('reject');
                                      setActionMessage('');
                                    }}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Application</DialogTitle>
                                    <DialogDescription>
                                      This will reject {app.profile.brandName}'s application.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="reject-message">Reason *</Label>
                                      <Textarea
                                        id="reject-message"
                                        placeholder="Unfortunately, we cannot approve your application because..."
                                        value={actionMessage}
                                        onChange={(e) => setActionMessage(e.target.value)}
                                        rows={4}
                                        required
                                      />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                      <DialogTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                      </DialogTrigger>
                                      <Button
                                        variant="destructive"
                                        onClick={handleAction}
                                        disabled={actionLoading || !actionMessage.trim()}
                                      >
                                        {actionLoading ? 'Rejecting...' : 'Reject Application'}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = {
    submitted: { label: 'Submitted', variant: 'secondary' as const, icon: Clock },
    in_review: { label: 'In Review', variant: 'default' as const, icon: Clock },
    needs_clarification: { label: 'Needs Clarification', variant: 'destructive' as const, icon: AlertCircle },
    clarification_submitted: { label: 'Clarification Submitted', variant: 'secondary' as const, icon: Clock },
    approved: { label: 'Approved', variant: 'default' as const, icon: CheckCircle2 },
    rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
  };

  const { label, variant, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className="inline-flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}
