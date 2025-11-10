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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Plus, Edit, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { MobileAppShell } from '@/components/MobileAppShell';

interface Address {
  id: string;
  type: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Andaman and Nicobar Islands'
];

export default function AddressesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    type: 'pickup',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/sign-in');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchAddresses();
    }
  }, [sessionStatus, router]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate pincode
    if (!/^\d{6}$/.test(formData.pincode)) {
      toast.error('Pincode must be exactly 6 digits');
      return;
    }

    // Validate phone
    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error('Phone must be exactly 10 digits');
      return;
    }

    try {
      const url = editingAddress ? `/api/addresses/${editingAddress.id}` : '/api/addresses';
      const method = editingAddress ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingAddress ? 'Address updated!' : 'Address added!');
        fetchAddresses();
        setDialogOpen(false);
        resetForm();
      } else {
        toast.error('Failed to save address');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      name: address.name,
      phone: address.phone,
      addressLine1: address.line1,
      addressLine2: address.line2 || '',
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Address deleted!');
        fetchAddresses();
      } else {
        toast.error('Failed to delete address');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}/default`, { method: 'PATCH' });
      if (res.ok) {
        toast.success('Default address updated!');
        fetchAddresses();
      } else {
        toast.error('Failed to update default address');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const resetForm = () => {
    setEditingAddress(null);
    setFormData({
      type: 'pickup',
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading addresses...</p>
        </div>
      </div>
    );
  }

  const pickupAddresses = addresses.filter(a => a.type === 'pickup');
  const returnAddresses = addresses.filter(a => a.type === 'return');

  return (
    <MobileAppShell>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Addresses</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your pickup and return addresses
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAddress ? 'Edit Address' : 'Add Address'}</DialogTitle>
                <DialogDescription>
                  {editingAddress ? 'Update your address details' : 'Add a new pickup or return address'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Address Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pickup">Pickup Address</SelectItem>
                      <SelectItem value="return">Return Address</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Contact Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    placeholder="Building, Street"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    placeholder="Area, Colony (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark</Label>
                  <Input
                    id="landmark"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    placeholder="Near... (optional)"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="6-digit pincode"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">Set as default address</Label>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingAddress ? 'Update Address' : 'Add Address'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pickup Addresses */}
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 md:w-5 md:h-5" />
            Pickup Addresses ({pickupAddresses.length})
          </h2>
          {pickupAddresses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                <MapPin className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm md:text-base">No pickup addresses added yet</p>
                <p className="text-xs md:text-sm mt-1">Add an address where orders will be picked up from</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pickupAddresses.map(address => (
                <Card key={address.id} className={address.isDefault ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {address.name}
                          {address.isDefault && (
                            <Badge variant="default" className="gap-1">
                              <Star className="w-3 h-3" /> Default
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{address.phone}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(address)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(address.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">{address.line1}</p>
                    {address.line2 && <p className="text-sm">{address.line2}</p>}
                    {address.landmark && <p className="text-sm text-muted-foreground">Near {address.landmark}</p>}
                    <p className="text-sm font-medium">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    {!address.isDefault && (
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => handleSetDefault(address.id)}>
                        <Star className="w-3 h-3 mr-1" />
                        Set as Default
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Return Addresses */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 md:w-5 md:h-5" />
            Return Addresses ({returnAddresses.length})
          </h2>
          {returnAddresses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                <MapPin className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm md:text-base">No return addresses added yet</p>
                <p className="text-xs md:text-sm mt-1">Add an address where returns will be accepted</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {returnAddresses.map(address => (
                <Card key={address.id} className={address.isDefault ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {address.name}
                          {address.isDefault && (
                            <Badge variant="default" className="gap-1">
                              <Star className="w-3 h-3" /> Default
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{address.phone}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(address)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(address.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">{address.line1}</p>
                    {address.line2 && <p className="text-sm">{address.line2}</p>}
                    {address.landmark && <p className="text-sm text-muted-foreground">Near {address.landmark}</p>}
                    <p className="text-sm font-medium">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    {!address.isDefault && (
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => handleSetDefault(address.id)}>
                        <Star className="w-3 h-3 mr-1" />
                        Set as Default
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileAppShell>
  );
}
