'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { MobileAppShell } from '@/components/MobileAppShell';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function SupportPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/sign-in');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchTickets();
    }
  }, [sessionStatus, router]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Support ticket created! We\'ll respond within 24 hours.');
        fetchTickets();
        setDialogOpen(false);
        setFormData({ subject: '', message: '' });
      } else {
        toast.error('Failed to create ticket');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "outline" => {
    switch (status) {
      case 'open':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSlaStatus = (createdAt: string, status: string) => {
    if (status === 'closed') return null;

    const hoursElapsed = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    const slaHours = 24;

    if (hoursElapsed > slaHours) {
      return <Badge variant="destructive" className="ml-2">SLA Breach</Badge>;
    } else if (hoursElapsed > slaHours * 0.8) {
      return <Badge variant="secondary" className="ml-2">SLA Warning</Badge>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <MobileAppShell>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Support & Help</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Get assistance from our support team
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogDescription>
                  Describe your issue and we'll get back to you within 24 hours
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide detailed information about your issue..."
                    rows={6}
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Submit Ticket
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Help */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Getting Started Guide</CardTitle>
              <CardDescription>Learn how to set up your seller account</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Payment & Settlements</CardTitle>
              <CardDescription>Understand payout cycles and fee structure</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Product Listing Tips</CardTitle>
              <CardDescription>Best practices for product catalogs</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Support Tickets</CardTitle>
            <CardDescription>Track your support requests and responses</CardDescription>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No support tickets yet</p>
                <p className="text-sm mt-2">Create a ticket if you need help with anything</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{ticket.subject}</h3>
                          <Badge variant={getStatusVariant(ticket.status)} className="gap-1">
                            {getStatusIcon(ticket.status)}
                            {getStatusLabel(ticket.status)}
                          </Badge>
                          {getSlaStatus(ticket.createdAt, ticket.status)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ticket.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Ticket #{ticket.id.slice(0, 8)}</span>
                      <span>Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Detail Dialog */}
        {selectedTicket && (
          <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTicket.subject}
                  <Badge variant={getStatusVariant(selectedTicket.status)} className="gap-1">
                    {getStatusIcon(selectedTicket.status)}
                    {getStatusLabel(selectedTicket.status)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Ticket #{selectedTicket.id.slice(0, 8)} • Created {formatDistanceToNow(new Date(selectedTicket.createdAt), { addSuffix: true })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Your Message</Label>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
                {selectedTicket.status === 'closed' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900">Ticket Resolved</p>
                        <p className="text-sm text-green-700 mt-1">
                          This ticket has been marked as resolved. If you still need help, please create a new ticket.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {selectedTicket.status === 'in_progress' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900">In Progress</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Our support team is currently working on your ticket. You'll receive an update soon.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MobileAppShell>
  );
}
