import { z } from 'zod';

export const productSchema = z.object({
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
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  }).optional(),
  originCountry: z.string().default('India'),
  images: z.array(z.string()).min(1, 'At least one image is required').max(8, 'Maximum 8 images'),
  variants: z.array(z.object({
    size: z.string().optional(),
    color: z.string().optional(),
    sku: z.string(),
    stock: z.number().int().min(0),
  })).optional(),
  care: z.string().optional(),
  warranty: z.string().optional(),
}).refine(
  (data) => data.mrp >= data.price,
  {
    message: 'MRP must be greater than or equal to price',
    path: ['mrp'],
  }
);

export type ProductFormData = z.infer<typeof productSchema>;

export const bankDetailsSchema = z.object({
  accountHolder: z.string().min(2, 'Account holder name is required'),
  accountNumber: z.string().min(9, 'Valid account number is required'),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
  bankName: z.string().min(2, 'Bank name is required'),
});

export type BankDetailsFormData = z.infer<typeof bankDetailsSchema>;

export const addressSchema = z.object({
  type: z.enum(['pickup', 'return']),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  line1: z.string().min(5, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  landmark: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type AddressFormData = z.infer<typeof addressSchema>;
