import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  ExternalLink,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  Eye,
  Play,
  Pause,
  X
} from 'lucide-react';
import { ServiceWithPayments } from '@/lib/types';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ServicesTableMobileProps {
  services: ServiceWithPayments[];
  canManageData: boolean;
  onDelete: (serviceId: string) => void;
  onStatusUpdate: (serviceId: string, status: 'Active' | 'Paused' | 'Cancelled' | 'Expired') => void;
}

export function ServicesTableMobile({ 
  services, 
  canManageData, 
  onDelete, 
  onStatusUpdate 
}: ServicesTableMobileProps) {
  const { toast } = useToast();
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'cancelled': return 'outline';
      case 'expired': return 'destructive';
      default: return 'default';
    }
  };

  const getUrgencyColor = (renewalDate: string | null) => {
    if (!renewalDate) return '';
    const days = Math.ceil((new Date(renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'text-red-600';
    if (days <= 7) return 'text-orange-600';
    if (days <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No services found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <Card key={service.id}>
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Header Row */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-base truncate">{service.service_name}</h3>
                  <p className="text-sm text-muted-foreground">{service.provider}</p>
                  {service.plan_name && (
                    <p className="text-xs text-muted-foreground">{service.plan_name}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <Badge variant={getStatusBadgeVariant(service.status)}>
                    {service.status}
                  </Badge>
                  {canManageData && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {service.dashboard_url && (
                          <DropdownMenuItem asChild>
                            <a href={service.dashboard_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Dashboard
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link to={`/services/edit/${service.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Service
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onStatusUpdate(
                            service.id,
                            service.status === 'Paused' ? 'Active' : 'Paused'
                          )}
                        >
                          {service.status === 'Paused' ? (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Resume Service
                            </>
                          ) : (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Service
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onStatusUpdate(service.id, 'Cancelled')}
                          disabled={service.status === 'Cancelled'}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel Service
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(service.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Service
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Category and Amount Row */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  <div className="flex items-center">
                    {service.categories?.icon && <span className="mr-1">{service.categories.icon}</span>}
                    {service.categories?.name || 'Unknown'}
                  </div>
                </Badge>
                <div className="flex items-center font-medium">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {formatCurrency(service.amount, service.currency)}
                </div>
              </div>

              {/* Billing and Renewal Row */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  <span>{service.billing_cycle}</span>
                  {service.auto_renew && (
                    <Badge variant="secondary" className="ml-2 text-xs">Auto</Badge>
                  )}
                </div>
                {service.next_renewal_date ? (
                  <div className={`flex items-center ${getUrgencyColor(service.next_renewal_date)}`}>
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(service.next_renewal_date), 'MMM dd, yyyy')}
                  </div>
                ) : (
                  <span className="text-muted-foreground">No renewal date</span>
                )}
              </div>

              {/* Invoice and Actions Row */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  {service.invoice_file_url ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        try {
                          console.log('Original invoice URL:', service.invoice_file_url);
                          
                          // Extract the file path from the URL
                          const url = new URL(service.invoice_file_url!);
                          console.log('Parsed URL pathname:', url.pathname);
                          
                          // Extract everything after '/storage/v1/object/public/invoices/'
                          const pathParts = url.pathname.split('/storage/v1/object/public/invoices/');
                          const filePath = pathParts[1];
                          console.log('Extracted file path:', filePath);
                          
                          if (!filePath) {
                            throw new Error('Could not extract file path from URL');
                          }
                          
                          // Generate signed URL for private bucket
                          console.log('Creating signed URL for path:', filePath);
                          const { data, error } = await supabase.storage
                            .from('invoices')
                            .createSignedUrl(filePath, 300); // 5 minutes expiry
                          
                          if (error) {
                            console.error('Error creating signed URL:', error);
                            toast({
                              title: "Error",
                              description: `Failed to load invoice: ${error.message}`,
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          console.log('Signed URL created successfully:', data.signedUrl);
                          window.open(data.signedUrl, '_blank');
                        } catch (error) {
                          console.error('Error viewing invoice:', error);
                          toast({
                            title: "Error",
                            description: `Failed to open invoice: ${error instanceof Error ? error.message : 'Unknown error'}`, 
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Invoice
                    </Button>
                  ) : (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <FileText className="h-3 w-3 mr-1" />
                      No invoice
                    </div>
                  )}
                </div>
                
                {!canManageData && service.dashboard_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={service.dashboard_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}