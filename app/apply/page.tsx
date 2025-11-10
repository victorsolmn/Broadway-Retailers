'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationSchema, type ApplicationFormData } from '@/lib/validations/application';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [gstAvailable, setGstAvailable] = useState(true);
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      gstAvailable: true,
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setLoading(true);

    try {
      // Upload files first if any
      const uploadedFiles: string[] = [];
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const { files: uploadedPaths } = await uploadRes.json();
          uploadedFiles.push(...uploadedPaths);
        }
      }

      // Submit application
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          attachments: uploadedFiles,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const result = await response.json();
      toast.success('Application submitted successfully!');
      router.push('/apply/review');
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="container mx-auto max-w-3xl py-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Apply for Broadway Certification</CardTitle>
            <CardDescription>
              Complete this application to get certified and start selling on Broadway. Takes about 10 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      {...register('fullName')}
                      placeholder="Your full name"
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="you@company.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="+91 9876543210"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandName">Brand Name *</Label>
                    <Input
                      id="brandName"
                      {...register('brandName')}
                      placeholder="Your brand name"
                    />
                    {errors.brandName && (
                      <p className="text-sm text-red-600">{errors.brandName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Business Category *</Label>
                    <Select onValueChange={(value) => setValue('category', value as any)}>
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
                        <SelectItem value="Specialty">Specialty</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availabilityStage">Brand Availability *</Label>
                    <Select onValueChange={(value) => setValue('availabilityStage', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Launching now">Launching now</SelectItem>
                        <SelectItem value="<3 months">&lt;3 months</SelectItem>
                        <SelectItem value="3-12 months">3-12 months</SelectItem>
                        <SelectItem value="1-3 years">1-3 years</SelectItem>
                        <SelectItem value="3+ years">3+ years</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.availabilityStage && (
                      <p className="text-sm text-red-600">{errors.availabilityStage.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* GST Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">GST Information</h3>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gstAvailable"
                    checked={gstAvailable}
                    onCheckedChange={(checked) => {
                      setGstAvailable(checked as boolean);
                      setValue('gstAvailable', checked as boolean);
                    }}
                  />
                  <Label htmlFor="gstAvailable" className="font-normal">
                    I have GST registration
                  </Label>
                </div>

                {!gstAvailable && (
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                    GST registration is required to sell on Broadway. Please obtain GST registration before applying.
                  </p>
                )}

                {gstAvailable && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gstin">GSTIN *</Label>
                        <Input
                          id="gstin"
                          {...register('gstin')}
                          placeholder="22AAAAA0000A1Z5"
                        />
                        {errors.gstin && (
                          <p className="text-sm text-red-600">{errors.gstin.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="legalName">Legal Entity Name *</Label>
                        <Input
                          id="legalName"
                          {...register('legalName')}
                          placeholder="As per GST certificate"
                        />
                        {errors.legalName && (
                          <p className="text-sm text-red-600">{errors.legalName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pan">PAN *</Label>
                      <Input
                        id="pan"
                        {...register('pan')}
                        placeholder="AAAAA0000A"
                      />
                      {errors.pan && (
                        <p className="text-sm text-red-600">{errors.pan.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine1">Business Address Line 1 *</Label>
                      <Input
                        id="addressLine1"
                        {...register('addressLine1')}
                        placeholder="Building name, street"
                      />
                      {errors.addressLine1 && (
                        <p className="text-sm text-red-600">{errors.addressLine1.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine2">Address Line 2</Label>
                      <Input
                        id="addressLine2"
                        {...register('addressLine2')}
                        placeholder="Area, locality"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          {...register('city')}
                          placeholder="City"
                        />
                        {errors.city && (
                          <p className="text-sm text-red-600">{errors.city.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          {...register('state')}
                          placeholder="State"
                        />
                        {errors.state && (
                          <p className="text-sm text-red-600">{errors.state.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          {...register('pincode')}
                          placeholder="400001"
                        />
                        {errors.pincode && (
                          <p className="text-sm text-red-600">{errors.pincode.message}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Company Details (Optional) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Company Details (Optional)</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      {...register('companyName')}
                      placeholder="Company name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cin">CIN</Label>
                    <Input
                      id="cin"
                      {...register('cin')}
                      placeholder="Corporate Identification Number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...register('website')}
                    placeholder="https://yourwebsite.com"
                  />
                  {errors.website && (
                    <p className="text-sm text-red-600">{errors.website.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information (0-500 characters)</Label>
                  <Textarea
                    id="additionalInfo"
                    {...register('additionalInfo')}
                    placeholder="Any additional information you'd like to share..."
                    rows={4}
                  />
                  {errors.additionalInfo && (
                    <p className="text-sm text-red-600">{errors.additionalInfo.message}</p>
                  )}
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Attachments (Optional)</h3>
                <p className="text-sm text-muted-foreground">
                  Upload brand certificates, compliance documents, or other relevant files (max 5 files, 5MB each)
                </p>

                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-sm text-primary hover:underline">Click to upload</span>
                    <span className="text-sm text-muted-foreground"> or drag and drop</span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-2">PDF, JPG, PNG up to 5MB each</p>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading || !gstAvailable} className="flex-1">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
