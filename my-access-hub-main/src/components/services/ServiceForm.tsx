import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { InvoiceUpload } from './InvoiceUpload';

const serviceSchema = z.object({
  service_name: z.string().min(1, 'Service name is required'),
  category_id: z.string().min(1, 'Category is required'),
  provider: z.string().min(1, 'Provider is required'),
  vendor_id: z.union([z.string(), z.literal('none')]).optional(),
  plan_name: z.string().optional(),
  account_email: z.string().email().optional().or(z.literal('')),
  dashboard_url: z.string().url().optional().or(z.literal('')),
  start_date: z.date(),
  billing_cycle: z.enum(['Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'Custom_days']),
  custom_cycle_days: z.number().positive().optional(),
  amount: z.number().min(0, 'Amount cannot be negative'),
  currency: z.enum(['INR', 'USD', 'EUR']).default('INR'),
  exchange_rate: z.number().positive().optional(),
  payment_method: z.union([
    z.enum(['Card', 'UPI', 'NetBanking', 'Bank Transfer', 'PayPal', 'Other']),
    z.literal('none')
  ]).optional(),
  auto_renew: z.boolean().default(false),
  next_renewal_date: z.date().optional(),
  next_renewal_amount: z.number().min(0, 'Amount cannot be negative').optional(),
  reminder_days_before: z.number().positive().default(7),
  status: z.enum(['Active', 'Paused', 'Cancelled', 'Expired']).default('Active'),
  importance: z.enum(['Critical', 'Normal', 'Nice-to-have']).default('Normal'),
  tags: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.billing_cycle === 'Custom_days' && !data.custom_cycle_days) {
    return false;
  }
  return true;
}, {
  message: "Custom cycle days is required when billing cycle is Custom_days",
  path: ["custom_cycle_days"],
}).refine((data) => {
  if (data.currency !== 'INR' && !data.exchange_rate) {
    return false;
  }
  return true;
}, {
  message: "Exchange rate is required for non-INR currencies",
  path: ["exchange_rate"],
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export function ServiceForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [invoiceFileUrl, setInvoiceFileUrl] = useState<string | null>(null);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      currency: 'INR',
      auto_renew: false,
      reminder_days_before: 7,
      status: 'Active',
      importance: 'Normal',
      start_date: new Date(),
    },
  });

  const billingCycle = form.watch('billing_cycle');

  // Fetch categories for the dropdown
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  
  console.log('ServiceForm: Categories state:', { 
    count: categories?.length, 
    loading: categoriesLoading, 
    error: categoriesError 
  });

  // Fetch vendors for the dropdown
  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Parse tags
      const tagsArray = data.tags ? 
        data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : 
        [];

      // Calculate next renewal date if not provided
      let nextRenewalDate = data.next_renewal_date;
      if (!nextRenewalDate) {
        const startDate = new Date(data.start_date);
        switch (data.billing_cycle) {
          case 'Monthly':
            nextRenewalDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
            break;
          case 'Quarterly':
            nextRenewalDate = new Date(startDate.setMonth(startDate.getMonth() + 3));
            break;
          case 'Semi-Annual':
            nextRenewalDate = new Date(startDate.setMonth(startDate.getMonth() + 6));
            break;
          case 'Annual':
            nextRenewalDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
            break;
          case 'Custom_days':
            nextRenewalDate = new Date(startDate.setDate(startDate.getDate() + (data.custom_cycle_days || 30)));
            break;
        }
      }

      const serviceData = {
        user_id: user.user.id,
        service_name: data.service_name,
        category_id: data.category_id,
        provider: data.provider,
        vendor_id: data.vendor_id === 'none' ? null : data.vendor_id || null,
        plan_name: data.plan_name || null,
        account_email: data.account_email || null,
        dashboard_url: data.dashboard_url || null,
        start_date: data.start_date.toISOString().split('T')[0],
        billing_cycle: data.billing_cycle,
        custom_cycle_days: data.custom_cycle_days || null,
        amount: data.amount,
        currency: data.currency,
        payment_method: data.payment_method === 'none' ? null : data.payment_method || null,
        auto_renew: data.auto_renew,
        next_renewal_date: nextRenewalDate?.toISOString().split('T')[0] || null,
        next_renewal_amount: data.next_renewal_amount || null,
        reminder_days_before: data.reminder_days_before,
        status: data.status,
        importance: data.importance,
        tags: tagsArray,
        notes: data.notes || null,
        invoice_file_url: invoiceFileUrl,
        exchange_rate: data.exchange_rate || null,
      };

      const { error } = await supabase
        .from('services')
        .insert([serviceData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({
        title: 'Service created',
        description: 'Your new service has been added successfully.',
      });
      navigate('/services');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    createServiceMutation.mutate(data);
  };

  const currencies = ['INR', 'USD', 'EUR'];
  const billingCycles = ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'Custom_days'];
  const paymentMethods = ['Card', 'UPI', 'NetBanking', 'Bank Transfer', 'PayPal', 'Other'];
  const statuses = ['Active', 'Paused', 'Cancelled', 'Expired'];
  const importanceLevels = ['Critical', 'Normal', 'Nice-to-have'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Service</h1>
          <p className="text-muted-foreground">
            Add a new subscription or service to track
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="service_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., AWS EC2, Google Workspace" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriesLoading ? (
                            <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                          ) : categoriesError ? (
                            <SelectItem value="error" disabled>Error loading categories</SelectItem>
                          ) : categories?.length === 0 ? (
                            <SelectItem value="empty" disabled>No categories available</SelectItem>
                          ) : (
                            categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center">
                                  {category.icon && <span className="mr-2">{category.icon}</span>}
                                  {category.name}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Amazon, Google, Microsoft" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vendor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No vendor</SelectItem>
                          {vendors?.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plan_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Basic, Pro, Enterprise" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contact & Access */}
            <Card>
              <CardHeader>
                <CardTitle>Contact & Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="account_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="account@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dashboard_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dashboard URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://dashboard.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="importance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Importance</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select importance" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {importanceLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="production, critical, backup (comma-separated)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter tags separated by commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billing_cycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Cycle *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing cycle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {billingCycles.map((cycle) => (
                          <SelectItem key={cycle} value={cycle}>
                            {cycle.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {billingCycle === 'Custom_days' && (
                <FormField
                  control={form.control}
                  name="custom_cycle_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Cycle Days *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="9.99"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exchange_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Exchange Rate to USD {form.watch('currency') !== 'INR' ? '*' : '(Optional)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={form.watch('currency') === 'EUR' ? '0.85' : form.watch('currency') === 'USD' ? '1.00' : '83.50'}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      {form.watch('currency') !== 'INR' 
                        ? `Enter the current exchange rate: 1 ${form.watch('currency')} = X USD`
                        : 'Optional: Track exchange rate for historical analysis'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                       <SelectContent className="bg-background border shadow-md z-50">
                         <SelectItem value="none">No payment method</SelectItem>
                         {paymentMethods.map((method) => (
                           <SelectItem key={method} value={method}>
                             {method}
                           </SelectItem>
                         ))}
                       </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Renewal Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Renewal Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="next_renewal_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Next Renewal Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Auto-calculate from start date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Leave empty to auto-calculate based on start date and billing cycle
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="next_renewal_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Renewal Amount (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 1499"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      If the upcoming invoice amount differs from the current plan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reminder_days_before"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Days Before</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="7"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 7)}
                      />
                    </FormControl>
                    <FormDescription>
                      How many days before renewal to send reminders
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auto_renew"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto Renewal</FormLabel>
                      <FormDescription>
                        Enable automatic renewal for this service
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notes & Invoice */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information about this service..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <InvoiceUpload
                onInvoiceChange={setInvoiceFileUrl}
                currentInvoiceUrl={invoiceFileUrl}
              />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex items-center space-x-4">
            <Button
              type="submit"
              disabled={createServiceMutation.isPending}
              className="min-w-[120px]"
            >
              {createServiceMutation.isPending ? 'Creating...' : 'Create Service'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/services')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}