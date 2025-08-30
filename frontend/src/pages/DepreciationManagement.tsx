import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  ArrowLeft, 
  Plus, 
  Calculator, 
  TrendingDown,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAssets } from '@/hooks/useAssets';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const depreciationSchema = z.object({
  asset_id: z.string().min(1, 'Asset is required'),
  method: z.enum(['straight_line', 'declining_balance', 'sum_of_years']),
  useful_life_years: z.number().min(1, 'Useful life must be at least 1 year'),
  salvage_value: z.number().min(0, 'Salvage value must be positive'),
  start_date: z.string().min(1, 'Start date is required'),
});

type DepreciationFormData = z.infer<typeof depreciationSchema>;

interface DepreciationRecord {
  id: string;
  asset_id: string;
  method: 'straight_line' | 'declining_balance' | 'sum_of_years';
  useful_life_years: number;
  salvage_value: number;
  start_date: string;
  assets?: {
    asset_code: string;
    name: string;
    purchase_cost: number;
    current_book_value: number;
  };
}

export default function DepreciationManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { assets } = useAssets();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<DepreciationFormData>({
    resolver: zodResolver(depreciationSchema),
    defaultValues: {
      method: 'straight_line',
      useful_life_years: 5,
      salvage_value: 0,
      start_date: new Date().toISOString().split('T')[0],
    },
  });

  // Get depreciation records
  const { data: depreciationRecords, isLoading } = useQuery({
    queryKey: ['depreciation-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('depreciation')
        .select(`
          *,
          assets(asset_code, name, purchase_cost, current_book_value)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DepreciationRecord[];
    }
  });

  // Create depreciation record
  const createDepreciation = useMutation({
    mutationFn: async (data: DepreciationFormData) => {
      const { data: result, error } = await supabase
        .from('depreciation')
        .insert({
          ...data,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          is_depreciable: true
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depreciation-records'] });
      toast({
        title: "Depreciation schedule created",
        description: "The depreciation schedule has been set up successfully."
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating depreciation schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: DepreciationFormData) => {
    createDepreciation.mutate(data);
  };

  // Calculate depreciation for an asset
  const calculateDepreciation = (record: DepreciationRecord) => {
    const asset = record.assets;
    if (!asset) return { annual: 0, monthly: 0, accumulated: 0 };

    const purchaseCost = asset.purchase_cost;
    const salvageValue = record.salvage_value;
    const usefulLife = record.useful_life_years;
    const depreciableAmount = purchaseCost - salvageValue;

    let annualDepreciation = 0;

    switch (record.method) {
      case 'straight_line':
        annualDepreciation = depreciableAmount / usefulLife;
        break;
      case 'declining_balance':
        // Double declining balance (2 / useful life)
        const rate = 2 / usefulLife;
        annualDepreciation = asset.current_book_value * rate;
        break;
      case 'sum_of_years':
        // Sum of years digits method
        const sumOfYears = (usefulLife * (usefulLife + 1)) / 2;
        const currentYear = new Date().getFullYear() - new Date(record.start_date).getFullYear() + 1;
        const yearDigit = Math.max(1, usefulLife - currentYear + 1);
        annualDepreciation = (depreciableAmount * yearDigit) / sumOfYears;
        break;
    }

    const monthlyDepreciation = annualDepreciation / 12;
    const startDate = new Date(record.start_date);
    const currentDate = new Date();
    const monthsElapsed = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                         (currentDate.getMonth() - startDate.getMonth());
    const accumulatedDepreciation = Math.min(monthlyDepreciation * monthsElapsed, depreciableAmount);

    return {
      annual: annualDepreciation,
      monthly: monthlyDepreciation,
      accumulated: accumulatedDepreciation
    };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/assets-dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assets
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Depreciation Management</h1>
            <p className="text-muted-foreground">
              Manage asset depreciation schedules and calculations
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Depreciation Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Depreciation Schedule</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="asset_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an asset" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assets?.map((asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                              {asset.asset_code} - {asset.name}
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
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depreciation Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="straight_line">Straight Line</SelectItem>
                          <SelectItem value="declining_balance">Declining Balance</SelectItem>
                          <SelectItem value="sum_of_years">Sum of Years Digits</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="useful_life_years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Useful Life (Years)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salvage_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salvage Value ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createDepreciation.isPending}>
                    {createDepreciation.isPending ? 'Creating...' : 'Create Schedule'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assets with Depreciation</p>
                <p className="text-2xl font-bold">{depreciationRecords?.length || 0}</p>
              </div>
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Annual Depreciation</p>
                <p className="text-2xl font-bold">
                  ${depreciationRecords?.reduce((sum, record) => 
                    sum + calculateDepreciation(record).annual, 0
                  ).toLocaleString() || 0}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Depreciation</p>
                <p className="text-2xl font-bold">
                  ${Math.round(depreciationRecords?.reduce((sum, record) => 
                    sum + calculateDepreciation(record).monthly, 0
                  ) || 0).toLocaleString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accumulated Depreciation</p>
                <p className="text-2xl font-bold">
                  ${Math.round(depreciationRecords?.reduce((sum, record) => 
                    sum + calculateDepreciation(record).accumulated, 0
                  ) || 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Depreciation Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Depreciation Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading depreciation records...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Useful Life</TableHead>
                  <TableHead>Purchase Cost</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Annual Depreciation</TableHead>
                  <TableHead>Monthly Depreciation</TableHead>
                  <TableHead>Accumulated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depreciationRecords?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No depreciation schedules found. Create your first schedule!
                    </TableCell>
                  </TableRow>
                ) : (
                  depreciationRecords?.map((record) => {
                    const depreciation = calculateDepreciation(record);
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{record.assets?.asset_code}</div>
                            <div className="text-sm text-muted-foreground">{record.assets?.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {record.method.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.useful_life_years} years</TableCell>
                        <TableCell>${record.assets?.purchase_cost.toLocaleString()}</TableCell>
                        <TableCell>${record.assets?.current_book_value.toLocaleString()}</TableCell>
                        <TableCell>${Math.round(depreciation.annual).toLocaleString()}</TableCell>
                        <TableCell>${Math.round(depreciation.monthly).toLocaleString()}</TableCell>
                        <TableCell>${Math.round(depreciation.accumulated).toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}