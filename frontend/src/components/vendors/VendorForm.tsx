import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCreateVendor, useUpdateVendor } from '@/hooks/useVendors';
import { Vendor } from '@/lib/types';

const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  support_email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  support_phone: z.string().optional(),
  notes: z.string().optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  vendor?: Vendor;
  onSuccess?: () => void;
}

export function VendorForm({ vendor, onSuccess }: VendorFormProps) {
  const { toast } = useToast();
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: vendor ? {
      name: vendor.name,
      website: vendor.website || '',
      support_email: vendor.support_email || '',
      support_phone: vendor.support_phone || '',
      notes: vendor.notes || '',
    } : {
      name: '',
      website: '',
      support_email: '',
      support_phone: '',
      notes: '',
    },
  });

  const onSubmit = async (data: VendorFormData) => {
    setIsSubmitting(true);
    try {
      const vendorData = {
        name: data.name,
        website: data.website || null,
        support_email: data.support_email || null,
        support_phone: data.support_phone || null,
        notes: data.notes || null,
      };

      if (vendor) {
        await updateVendor.mutateAsync({
          id: vendor.id,
          updates: vendorData,
        });
        toast({
          title: 'Vendor updated',
          description: 'The vendor has been updated successfully.',
        });
      } else {
        await createVendor.mutateAsync(vendorData);
        toast({
          title: 'Vendor created',
          description: 'The vendor has been created successfully.',
        });
        reset();
      }
      
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Vendor Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter vendor name"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          {...register('website')}
          placeholder="https://example.com"
        />
        {errors.website && (
          <p className="text-sm text-red-600">{errors.website.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="support_email">Support Email</Label>
        <Input
          id="support_email"
          type="email"
          {...register('support_email')}
          placeholder="support@example.com"
        />
        {errors.support_email && (
          <p className="text-sm text-red-600">{errors.support_email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="support_phone">Support Phone</Label>
        <Input
          id="support_phone"
          type="tel"
          {...register('support_phone')}
          placeholder="+1 (555) 123-4567"
        />
        {errors.support_phone && (
          <p className="text-sm text-red-600">{errors.support_phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Additional notes about this vendor..."
          rows={3}
        />
        {errors.notes && (
          <p className="text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : vendor ? 'Update Vendor' : 'Create Vendor'}
      </Button>
    </form>
  );
}