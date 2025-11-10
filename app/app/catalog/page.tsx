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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Edit, Trash2, Eye, Calculator, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CsvUploadDialog } from './csv-upload';
import { MobileAppShell } from '@/components/MobileAppShell';

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  hsn: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  mrp: z.number().min(0, 'MRP must be positive'),
  taxRate: z.number().min(0).max(100).default(18),
  stock: z.number().int().min(0, 'Stock must be positive').default(0),
  weight: z.number().positive('Weight must be positive').optional(),
  originCountry: z.string().default('India'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
  id: string;
  title: string;
  category: string;
  brand: string;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
  status: 'draft' | 'ready';
  createdAt: string;
}

export default function CatalogPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      taxRate: 18,
      stock: 0,
      originCountry: 'India',
    },
  });

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/sign-in');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchProducts();
    }
  }, [sessionStatus, router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(editingProduct ? 'Product updated!' : 'Product created!');
        fetchProducts();
        setDialogOpen(false);
        reset();
        setEditingProduct(null);
      } else {
        toast.error('Failed to save product');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setValue('title', product.title);
    setValue('category', product.category);
    setValue('brand', product.brand);
    setValue('sku', product.sku);
    setValue('price', product.price);
    setValue('mrp', product.mrp);
    setValue('stock', product.stock);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}/publish`, {
        method: 'PATCH',
      });
      if (res.ok) {
        toast.success('Product published!');
        fetchProducts();
      } else {
        toast.error('Failed to publish product');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const filteredProducts = products.filter(product =>
    filterStatus === 'all' || product.status === filterStatus
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <MobileAppShell>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Product Catalog</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your product listings and inventory
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Products</CardDescription>
              <CardTitle className="text-3xl">{products.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Ready to Sell</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {products.filter(p => p.status === 'ready').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Drafts</CardDescription>
              <CardTitle className="text-3xl text-amber-600">
                {products.filter(p => p.status === 'draft').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Inventory</CardDescription>
              <CardTitle className="text-3xl">
                {products.reduce((sum, p) => sum + p.stock, 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Actions & Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Products</CardTitle>
              <div className="flex items-center gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="ready">Ready to Sell</SelectItem>
                    <SelectItem value="draft">Drafts</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <div className="flex gap-2">
                    <CsvUploadDialog onSuccess={fetchProducts} />
                    <DialogTrigger asChild>
                      <Button onClick={() => { reset(); setEditingProduct(null); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                  </div>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                      <DialogDescription>
                        {editingProduct ? 'Update product details' : 'Create a new product listing'}
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Product Title *</Label>
                          <Input id="title" {...register('title')} placeholder="Premium Cotton T-Shirt" />
                          {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sku">SKU *</Label>
                          <Input id="sku" {...register('sku')} placeholder="TS-001" />
                          {errors.sku && <p className="text-sm text-red-600">{errors.sku.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" {...register('description')} placeholder="Product description..." rows={3} />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select onValueChange={(value) => setValue('category', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Fashion">Fashion</SelectItem>
                              <SelectItem value="Footwear">Footwear</SelectItem>
                              <SelectItem value="Beauty">Beauty</SelectItem>
                              <SelectItem value="Home & Kitchen">Home & Kitchen</SelectItem>
                              <SelectItem value="Electronics">Electronics</SelectItem>
                              <SelectItem value="Grocery">Grocery</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="brand">Brand *</Label>
                          <Input id="brand" {...register('brand')} placeholder="Your brand name" />
                          {errors.brand && <p className="text-sm text-red-600">{errors.brand.message}</p>}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Price (₹) *</Label>
                          <Input id="price" type="number" step="0.01" {...register('price', { valueAsNumber: true })} placeholder="499" />
                          {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mrp">MRP (₹) *</Label>
                          <Input id="mrp" type="number" step="0.01" {...register('mrp', { valueAsNumber: true })} placeholder="999" />
                          {errors.mrp && <p className="text-sm text-red-600">{errors.mrp.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="stock">Stock *</Label>
                          <Input id="stock" type="number" {...register('stock', { valueAsNumber: true })} placeholder="100" />
                          {errors.stock && <p className="text-sm text-red-600">{errors.stock.message}</p>}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="taxRate">Tax Rate (%)</Label>
                          <Input id="taxRate" type="number" step="0.01" {...register('taxRate', { valueAsNumber: true })} placeholder="18" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hsn">HSN Code</Label>
                          <Input id="hsn" {...register('hsn')} placeholder="6109" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="barcode">Barcode</Label>
                          <Input id="barcode" {...register('barcode')} placeholder="1234567890" />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input id="weight" type="number" step="0.01" {...register('weight', { valueAsNumber: true })} placeholder="0.5" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="originCountry">Country of Origin</Label>
                          <Input id="originCountry" {...register('originCountry')} placeholder="India" />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); reset(); setEditingProduct(null); }}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingProduct ? 'Update Product' : 'Create Product'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Upload
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">
                  {filterStatus === 'all'
                    ? 'Get started by adding your first product'
                    : `No ${filterStatus} products found`}
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{product.title}</CardTitle>
                            <p className="text-sm text-muted-foreground font-mono mt-1">{product.sku}</p>
                          </div>
                          <Badge variant={product.status === 'ready' ? 'default' : 'secondary'} className="text-xs">
                            {product.status === 'ready' ? 'Ready' : 'Draft'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Category</span>
                          <span className="font-medium">{product.category}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Price</span>
                          <div className="text-right">
                            <div className="font-semibold">₹{product.price}</div>
                            <div className="text-xs text-muted-foreground line-through">₹{product.mrp}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Stock</span>
                          <Badge variant={product.stock > 10 ? 'default' : 'destructive'} className="text-xs">
                            {product.stock} units
                          </Badge>
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(product)} className="flex-1">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          {product.status === 'draft' && (
                            <Button size="sm" onClick={() => handlePublish(product.id)} className="flex-1">
                              Publish
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.title}</TableCell>
                          <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-semibold">₹{product.price}</div>
                              <div className="text-muted-foreground line-through text-xs">₹{product.mrp}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.stock > 10 ? 'default' : 'destructive'}>
                              {product.stock} units
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.status === 'ready' ? 'default' : 'secondary'}>
                              {product.status === 'ready' ? 'Ready to Sell' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              {product.status === 'draft' && (
                                <Button size="sm" onClick={() => handlePublish(product.id)}>
                                  Publish
                                </Button>
                              )}
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Fee Simulator CTA */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Fee Simulator
                </h3>
                <p className="text-sm text-muted-foreground">
                  Calculate your net profit margins per SKU
                </p>
              </div>
              <Button variant="outline">
                Open Calculator
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileAppShell>
  );
}
