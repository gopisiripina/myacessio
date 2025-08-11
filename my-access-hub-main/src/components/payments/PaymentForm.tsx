import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { useCreatePayment, useUpdatePayment } from '@/hooks/usePayments';
import { useServices } from '@/hooks/useServices';
import { useAuth } from '@/hooks/useAuth';
import { Payment } from '@/lib/types';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const paymentSchema = z.object({
  service_id: z.string().min(1, 'Please select a service'),
  payment_date: z.string().min(1, 'Payment date is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.enum(['USD', 'EUR', 'INR'], {
    required_error: 'Please select a currency',
  }),
  paid_by: z.string().optional(),
  invoice_number: z.string().optional(),
  remarks: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  payment?: Payment;
  onSuccess?: () => void;
}

export function PaymentForm({ payment, onSuccess }: PaymentFormProps) {
  const { toast } = useToast();
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const { data: services } = useServices();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: payment ? {
      service_id: payment.service_id,
      payment_date: format(new Date(payment.payment_date), 'yyyy-MM-dd'),
      amount: payment.amount,
      currency: payment.currency,
      paid_by: payment.paid_by || '',
      invoice_number: payment.invoice_number || '',
      remarks: payment.remarks || '',
    } : {
      service_id: '',
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      amount: 0,
      currency: 'USD' as const,
      paid_by: '',
      invoice_number: '',
      remarks: '',
    },
  });

  const selectedServiceId = watch('service_id');

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      let invoiceFileUrl = payment?.invoice_file_url || null;

      // Upload file if a new one is selected
      if (selectedFile) {
        setUploadingFile(true);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(filePath, selectedFile);

        if (uploadError) {
          throw new Error('Failed to upload invoice file');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('invoices')
          .getPublicUrl(filePath);

        invoiceFileUrl = publicUrl;
        setUploadingFile(false);
      }

      const paymentData = {
        service_id: data.service_id,
        payment_date: data.payment_date,
        amount: data.amount,
        currency: data.currency,
        user_id: user?.id || '',
        paid_by: data.paid_by || null,
        invoice_number: data.invoice_number || null,
        invoice_file_url: invoiceFileUrl,
        remarks: data.remarks || null,
      };

      if (payment) {
        await updatePayment.mutateAsync({
          id: payment.id,
          updates: paymentData,
        });
        toast({
          title: 'Payment updated',
          description: 'The payment has been updated successfully.',
        });
      } else {
        await createPayment.mutateAsync(paymentData);
        toast({
          title: 'Payment recorded',
          description: 'The payment has been recorded successfully.',
        });
        reset();
        setSelectedFile(null);
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
      setUploadingFile(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="service_id">Service *</Label>
        <Select onValueChange={(value) => setValue('service_id', value)} defaultValue={selectedServiceId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {services?.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.service_name} - {service.provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.service_id && (
          <p className="text-sm text-red-600">{errors.service_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="payment_date">Payment Date *</Label>
          <Input
            id="payment_date"
            type="date"
            {...register('payment_date')}
          />
          {errors.payment_date && (
            <p className="text-sm text-red-600">{errors.payment_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
          <Select onValueChange={(value) => setValue('currency', value as 'USD' | 'EUR' | 'INR')} defaultValue={watch('currency')}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="INR">INR (₹)</SelectItem>
            </SelectContent>
          </Select>
          {errors.currency && (
            <p className="text-sm text-red-600">{errors.currency.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          {...register('amount', { valueAsNumber: true })}
          placeholder="0.00"
        />
        {errors.amount && (
          <p className="text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paid_by">Payment Method</Label>
        <Select onValueChange={(value) => setValue('paid_by', value)} defaultValue={watch('paid_by')}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Credit Card">Credit Card</SelectItem>
            <SelectItem value="Debit Card">Debit Card</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="NetBanking">Net Banking</SelectItem>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            <SelectItem value="PayPal">PayPal</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.paid_by && (
          <p className="text-sm text-red-600">{errors.paid_by.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="invoice_number">Invoice Number</Label>
        <Input
          id="invoice_number"
          {...register('invoice_number')}
          placeholder="INV-001"
        />
        {errors.invoice_number && (
          <p className="text-sm text-red-600">{errors.invoice_number.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="invoice_file">Invoice File</Label>
        <FileUpload
          onFileSelect={setSelectedFile}
          onFileRemove={() => setSelectedFile(null)}
          selectedFile={selectedFile}
          currentFileUrl={payment?.invoice_file_url}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          {...register('remarks')}
          placeholder="Additional notes about this payment..."
          rows={3}
        />
        {errors.remarks && (
          <p className="text-sm text-red-600">{errors.remarks.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting || uploadingFile}
      >
        {uploadingFile ? 'Uploading...' : isSubmitting ? 'Saving...' : payment ? 'Update Payment' : 'Record Payment'}
      </Button>
    </form>
  );
}