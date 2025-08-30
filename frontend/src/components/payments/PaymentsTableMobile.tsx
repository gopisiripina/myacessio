import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Calendar,
  DollarSign,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  User,
  CreditCard
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { usePermissions } from '@/hooks/usePermissions';

interface PaymentWithService {
  id: string;
  payment_date: string;
  amount: number;
  currency: string;
  paid_by?: string;
  invoice_number?: string;
  invoice_file_url?: string;
  remarks?: string;
  service: {
    service_name: string;
    provider: string;
  };
}

interface PaymentsTableMobileProps {
  payments: PaymentWithService[];
  onEdit?: (payment: PaymentWithService) => void;
  onDelete?: (paymentId: string) => void;
  onViewInvoice?: (url: string) => void;
}

export function PaymentsTableMobile({ 
  payments, 
  onEdit, 
  onDelete, 
  onViewInvoice 
}: PaymentsTableMobileProps) {
  const { isAdmin } = usePermissions();

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-lg">No payments found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or add a new payment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <Card key={payment.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Header Row with Service and Amount */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-semibold text-base leading-tight">
                    {payment.service.service_name}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="truncate">{payment.service.provider}</span>
                  </div>
                </div>
                <div className="ml-3 text-right">
                  <div className="flex items-center font-bold text-lg">
                    {formatCurrency(payment.amount, payment.currency)}
                  </div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {payment.currency}
                  </Badge>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {/* Date */}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">
                      {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-muted-foreground">Payment Date</div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">
                      {payment.paid_by || 'Not specified'}
                    </div>
                    <div className="text-xs text-muted-foreground">Paid By</div>
                  </div>
                </div>
              </div>

              {/* Invoice and Additional Info */}
              {(payment.invoice_number || payment.invoice_file_url || payment.remarks) && (
                <div className="space-y-2 pt-3 border-t border-muted">
                  {(payment.invoice_number || payment.invoice_file_url) && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm">
                        <FileText className="h-4 w-4 text-green-500" />
                        <span className="font-medium">
                          {payment.invoice_number || 'Invoice attached'}
                        </span>
                      </div>
                      {payment.invoice_file_url && onViewInvoice && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewInvoice(payment.invoice_file_url!)}
                          className="h-7 px-2"
                        >
                          <ExternalLink className="h-3 w-3 mr-1 text-green-500" />
                          View
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {payment.remarks && (
                    <div className="text-sm bg-muted/50 rounded-md p-2">
                      <div className="font-medium text-muted-foreground mb-1">Remarks:</div>
                      <div className="text-foreground">{payment.remarks}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {isAdmin && (onEdit || onDelete) && (
                <div className="flex justify-end pt-2 border-t border-muted">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(payment)}>
                          <Edit className="mr-2 h-4 w-4 text-blue-500" />
                          Edit Payment
                        </DropdownMenuItem>
                      )}
                      {payment.invoice_file_url && onViewInvoice && (
                        <DropdownMenuItem onClick={() => onViewInvoice(payment.invoice_file_url!)}>
                          <ExternalLink className="mr-2 h-4 w-4 text-green-500" />
                          View Invoice
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                              Delete Payment
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this payment for {payment.service.service_name}? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => onDelete(payment.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}