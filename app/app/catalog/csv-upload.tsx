'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ParsedProduct {
  title: string;
  description?: string;
  category: string;
  brand: string;
  sku: string;
  barcode?: string;
  hsn?: string;
  price: number;
  mrp: number;
  taxRate: number;
  stock: number;
  weight?: number;
  originCountry: string;
  errors?: string[];
}

export function CsvUploadDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [uploading, setUploading] = useState(false);

  const downloadTemplate = () => {
    const csv = [
      ['title', 'description', 'category', 'brand', 'sku', 'barcode', 'hsn', 'price', 'mrp', 'taxRate', 'stock', 'weight', 'originCountry'],
      ['Premium Cotton T-Shirt', 'Comfortable 100% cotton t-shirt', 'Fashion', 'Your Brand', 'SKU-001', '1234567890123', '6109', '499', '999', '5', '50', '0.2', 'India'],
      ['Denim Jeans - Slim Fit', 'Classic slim fit denim jeans', 'Fashion', 'Your Brand', 'SKU-002', '1234567890124', '6203', '1299', '2499', '5', '30', '0.5', 'India'],
      ['Casual Sneakers', 'Comfortable everyday sneakers', 'Footwear', 'Your Brand', 'SKU-003', '1234567890125', '6404', '1599', '2999', '12', '20', '0.8', 'India'],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-upload-template.csv';
    a.click();
    toast.success('Template downloaded!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      toast.error('CSV file is empty or invalid');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const products: ParsedProduct[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const errors: string[] = [];

      // Validate required fields
      const title = values[headers.indexOf('title')] || '';
      const category = values[headers.indexOf('category')] || '';
      const brand = values[headers.indexOf('brand')] || '';
      const sku = values[headers.indexOf('sku')] || '';
      const priceStr = values[headers.indexOf('price')] || '0';
      const mrpStr = values[headers.indexOf('mrp')] || '0';

      if (!title) errors.push('Title is required');
      if (!category) errors.push('Category is required');
      if (!brand) errors.push('Brand is required');
      if (!sku) errors.push('SKU is required');

      const price = parseFloat(priceStr);
      const mrp = parseFloat(mrpStr);

      if (isNaN(price) || price < 0) errors.push('Invalid price');
      if (isNaN(mrp) || mrp < 0) errors.push('Invalid MRP');
      if (price > mrp) errors.push('Price cannot exceed MRP');

      const taxRateStr = values[headers.indexOf('taxRate')] || '18';
      const stockStr = values[headers.indexOf('stock')] || '0';
      const weightStr = values[headers.indexOf('weight')] || '';

      const taxRate = parseFloat(taxRateStr);
      const stock = parseInt(stockStr, 10);
      const weight = weightStr ? parseFloat(weightStr) : undefined;

      if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) errors.push('Invalid tax rate');
      if (isNaN(stock) || stock < 0) errors.push('Invalid stock');

      products.push({
        title,
        description: values[headers.indexOf('description')] || '',
        category,
        brand,
        sku,
        barcode: values[headers.indexOf('barcode')] || '',
        hsn: values[headers.indexOf('hsn')] || '',
        price,
        mrp,
        taxRate,
        stock,
        weight: weight && !isNaN(weight) ? weight : undefined,
        originCountry: values[headers.indexOf('originCountry')] || 'India',
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    setParsedProducts(products);
    toast.success(`Parsed ${products.length} products`);
  };

  const handleUpload = async () => {
    const validProducts = parsedProducts.filter(p => !p.errors);
    if (validProducts.length === 0) {
      toast.error('No valid products to upload');
      return;
    }

    setUploading(true);

    try {
      const res = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: validProducts }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Successfully uploaded ${data.count} products!`);
        setParsedProducts([]);
        setOpen(false);
        onSuccess();
      } else {
        toast.error('Failed to upload products');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setUploading(false);
    }
  };

  const validCount = parsedProducts.filter(p => !p.errors).length;
  const errorCount = parsedProducts.filter(p => p.errors).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Upload CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Products via CSV</DialogTitle>
          <DialogDescription>
            Download the template, fill it with your product data, and upload it here
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template */}
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <p className="font-semibold text-blue-900">Step 1: Download Template</p>
              <p className="text-sm text-blue-700">Get the CSV template with example data</p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* Upload CSV */}
          <div className="p-4 border-2 border-dashed rounded-lg">
            <Label htmlFor="csv-file" className="block mb-2 font-semibold">
              Step 2: Upload Your CSV
            </Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-2">
              CSV file with columns: title, description, category, brand, sku, barcode, hsn, price, mrp, taxRate, stock, weight, originCountry
            </p>
          </div>

          {/* Preview Table */}
          {parsedProducts.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{validCount} Valid</span>
                  </div>
                  {errorCount > 0 && (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium">{errorCount} Errors</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Status</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Errors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedProducts.map((product, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            {product.errors ? (
                              <XCircle className="w-4 h-4 text-red-600" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                          <TableCell>{product.title}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>₹{product.price}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            {product.errors && (
                              <div className="text-xs text-red-600">
                                {product.errors.join(', ')}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setParsedProducts([])}>
                  Clear
                </Button>
                <Button onClick={handleUpload} disabled={uploading || validCount === 0}>
                  {uploading ? 'Uploading...' : `Upload ${validCount} Products`}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
