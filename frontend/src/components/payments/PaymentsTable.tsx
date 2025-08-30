import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  DollarSign,
  FileText,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Payment } from '@/lib/types';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import { aggregateMultiCurrencyAmounts } from '@/lib/currencyConverter';
import { PaymentsTableMobile } from './PaymentsTableMobile';
import { PaymentForm } from './PaymentForm';
import { usePermissions } from '@/hooks/usePermissions';
import { useDeletePayment } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';

interface PaymentWithService extends Payment {
  service: {
    service_name: string;
    provider: string;
  };
}

interface PaymentsTableProps {
  searchTerm?: string;
}

export function PaymentsTable({ searchTerm: externalSearchTerm }: PaymentsTableProps) {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [isMobile, setIsMobile] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentWithService | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Use external search term if provided, otherwise use internal
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  
  const { isAdmin } = usePermissions();
  const deletePayment = useDeletePayment();
  const { toast } = useToast();

  const handleEditPayment = (payment: PaymentWithService) => {
    setEditingPayment(payment);
    setShowEditDialog(true);
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await deletePayment.mutateAsync(paymentId);
      toast({
        title: 'Payment deleted',
        description: 'The payment has been deleted successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleViewInvoice = (invoiceUrl: string) => {
    window.open(invoiceUrl, '_blank');
  };

  // Check if we're on mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async (): Promise<PaymentWithService[]> => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          service:services(service_name, provider)
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = payment.service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.service.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCurrency = currencyFilter === 'all' || payment.currency === currencyFilter;
    
    const paymentMonth = new Date(payment.payment_date).getMonth();
    const currentMonth = new Date().getMonth();
    const matchesMonth = monthFilter === 'all' || 
                        (monthFilter === 'current' && paymentMonth === currentMonth) ||
                        (monthFilter === 'last' && paymentMonth === currentMonth - 1);
    
    return matchesSearch && matchesCurrency && matchesMonth;
  }) || [];


const amounts = filteredPayments.map(p => ({ amount: p.amount, currency: p.currency }));
const totalsAgg = aggregateMultiCurrencyAmounts(amounts);
const totalsByCurrency = Object.fromEntries(totalsAgg.totals.map(t => [t.currency, t.amount]));
const totalINR = totalsAgg.convertedToINR;
const totalUSD = totalsAgg.convertedToUSD;
const primaryCurrency = currencyFilter !== 'all' ? (currencyFilter as 'INR' | 'USD' | 'EUR') : 'INR';
const primaryAmount = currencyFilter !== 'all'
  ? (totalsByCurrency[primaryCurrency] || 0)
  : totalINR;


  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payments</CardTitle>
<div className="text-right">
  <p className="text-sm text-muted-foreground">Total (filtered)</p>
  <p className="text-lg font-semibold">{formatCurrency(primaryAmount, primaryCurrency)}</p>
  <p className="text-xs text-muted-foreground">
    {primaryCurrency === 'INR' 
      ? formatCurrency(totalUSD, 'USD') 
      : `${formatCurrency(totalINR, 'INR')} • ${formatCurrency(totalUSD, 'USD')}`}
  </p>
</div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Only show search input if external search is not provided */}
          {externalSearchTerm === undefined && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={internalSearchTerm}
                onChange={(e) => setInternalSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          
          {/* Always show filters */}
          <div className="flex gap-2">
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Currencies</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="current">This Month</SelectItem>
                <SelectItem value="last">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <PaymentsTableMobile 
            payments={filteredPayments} 
            onEdit={handleEditPayment}
            onDelete={handleDeletePayment}
            onViewInvoice={handleViewInvoice}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Remarks</TableHead>
                  {isAdmin && <TableHead className="w-[70px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-12">
                      <div className="text-muted-foreground">
                        {searchTerm || currencyFilter !== 'all' || monthFilter !== 'all' 
                          ? 'No payments match your filters' 
                          : 'No payments recorded yet.'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="py-3">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {payment.service.service_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {payment.service.provider}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          {payment.service.provider}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3 text-orange-500" />
                          <div>
                            <div className="text-sm font-medium">
                              {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(payment.payment_date), 'EEE')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="text-right">
                          <div className="font-semibold text-sm">
                            {formatCurrency(payment.amount, payment.currency)}
                          </div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {payment.currency}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-3 w-3 text-blue-500" />
                          {payment.paid_by ? (
                            <Badge variant="outline" className="text-xs font-normal">
                              {payment.paid_by}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Not specified</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center space-x-2">
                          {payment.invoice_file_url ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewInvoice(payment.invoice_file_url!)}
                              className="h-7 px-2 text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1 text-green-500" />
                              View
                            </Button>
                          ) : payment.invoice_number ? (
                            <div className="flex items-center space-x-1">
                              <FileText className="h-3 w-3 text-blue-500" />
                              <span className="text-xs font-medium">{payment.invoice_number}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">No invoice</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 max-w-[150px]">
                        {payment.remarks ? (
                          <div 
                            className="text-xs bg-muted/50 rounded-md p-2 cursor-help truncate" 
                            title={payment.remarks}
                          >
                            {payment.remarks.length > 30 
                              ? `${payment.remarks.substring(0, 30)}...` 
                              : payment.remarks}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">No remarks</span>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-muted">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background border shadow-md">
                              <DropdownMenuItem 
                                onClick={() => handleEditPayment(payment)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4 text-blue-500" />
                                Edit Payment
                              </DropdownMenuItem>
                              {payment.invoice_file_url && (
                                <DropdownMenuItem onClick={() => handleViewInvoice(payment.invoice_file_url!)}>
                                  <ExternalLink className="mr-2 h-4 w-4 text-green-500" />
                                  View Invoice
                                </DropdownMenuItem>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this payment? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeletePayment(payment.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Edit Payment Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="mx-3 max-w-2xl md:mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          {editingPayment && (
            <PaymentForm 
              payment={editingPayment} 
              onSuccess={() => {
                setShowEditDialog(false);
                setEditingPayment(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}