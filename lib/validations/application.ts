import { z } from 'zod';

export const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/;
export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const pincodeRegex = /^\d{6}$/;

export const applicationSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  brandName: z.string().min(2, 'Brand name is required'),
  category: z.enum([
    'Fashion',
    'Footwear',
    'Beauty',
    'Home & Kitchen',
    'Electronics',
    'Grocery',
    'Specialty',
  ]),
  availabilityStage: z.enum([
    'Launching now',
    '<3 months',
    '3-12 months',
    '1-3 years',
    '3+ years',
  ]),
  gstAvailable: z.boolean(),
  gstin: z.string().regex(gstinRegex, 'Invalid GSTIN format').optional(),
  legalName: z.string().min(2).optional(),
  pan: z.string().regex(panRegex, 'Invalid PAN format').optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(pincodeRegex, 'Invalid pincode').optional(),
  companyName: z.string().optional(),
  cin: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  additionalInfo: z.string().max(500, 'Maximum 500 characters').optional(),
}).refine(
  (data) => {
    if (data.gstAvailable) {
      return (
        data.gstin &&
        data.legalName &&
        data.pan &&
        data.addressLine1 &&
        data.city &&
        data.state &&
        data.pincode
      );
    }
    return true;
  },
  {
    message: 'GST details are required when GST is available',
    path: ['gstAvailable'],
  }
);

export type ApplicationFormData = z.infer<typeof applicationSchema>;
