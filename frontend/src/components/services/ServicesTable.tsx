import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ExternalLink,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Service, ServiceWithPayments } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import { usePermissions } from '@/hooks/usePermissions';
import { Link } from 'react-router-dom';
import { ServicesTableMobile } from './ServicesTableMobile';
import { 
  Play,
  Pause,
  X
} from 'lucide-react';

interface ServicesTableProps {
  searchTerm?: string;
}

export function ServicesTable({ searchTerm: externalSearchTerm }: ServicesTableProps) {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isMobile, setIsMobile] = useState(false);
  const { canManageData } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use external search term if provided, otherwise use internal
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;

  // Check if we're on mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async (): Promise<ServiceWithPayments[]> => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          vendor:vendors(*),
          payments(*),
          categories!inner(id, name, icon)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({
        title: 'Service deleted',
        description: 'The service has been removed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateServiceStatusMutation = useMutation({
    mutationFn: async ({ serviceId, status }: { serviceId: string; status: 'Active' | 'Paused' | 'Cancelled' | 'Expired' }) => {
      const { error } = await supabase
        .from('services')
        .update({ status })
        .eq('id', serviceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({
        title: 'Service updated',
        description: 'Service status has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const filteredServices = services?.filter(service => {
    const matchesSearch = service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'all' || service.categories?.name === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];


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

  // Get categories for filtering
  const { data: categories } = useQuery({
    queryKey: ['categories-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data || [];
    },
  });

  const statuses = ['Active', 'Paused', 'Cancelled', 'Expired'];

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
    <div className="space-y-4">
      {/* Search and Filters - Only show if external search is not provided */}
      {externalSearchTerm === undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={internalSearchTerm}
                  onChange={(e) => setInternalSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status.toLowerCase()}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Always show filters */}
      <div className="flex gap-2 justify-end">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map(status => (
              <SelectItem key={status} value={status.toLowerCase()}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map(category => (
              <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table Content */}
      <Card className="animate-fade-in">
        <CardContent className="p-0">
          {isMobile ? (
            <ServicesTableMobile 
              services={filteredServices}
              canManageData={canManageData}
              onDelete={(serviceId) => deleteServiceMutation.mutate(serviceId)}
              onStatusUpdate={(serviceId, status) => updateServiceStatusMutation.mutate({ serviceId, status })}
            />
          ) : (
            <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Next Renewal</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="text-muted-foreground">
                        {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                          ? 'No services match your filters' 
                          : 'No services yet. Add your first service to get started.'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="py-3">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{service.service_name}</div>
                          {service.plan_name && (
                            <div className="text-xs text-muted-foreground">{service.plan_name}</div>
                          )}
                          {service.dashboard_url && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-xs"
                              asChild
                            >
                              <a href={service.dashboard_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1 text-indigo-500" />
                                Dashboard
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          {service.provider}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          <div className="flex items-center">
                            {service.categories?.icon && <span className="mr-1 text-xs">{service.categories.icon}</span>}
                            {service.categories?.name || 'Unknown'}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="text-right">
                          <div className="font-semibold text-sm">
                            {formatCurrency(service.amount, service.currency)}
                          </div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {service.currency}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="h-3 w-3 text-blue-500" />
                          <div>
                            <div className="text-sm font-medium">{service.billing_cycle}</div>
                            {service.auto_renew && (
                              <Badge variant="secondary" className="text-xs">Auto</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        {service.next_renewal_date ? (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-3 w-3 text-orange-500" />
                            <div>
                              <div className={`text-sm font-medium ${getUrgencyColor(service.next_renewal_date)}`}>
                                {format(new Date(service.next_renewal_date), 'MMM dd, yyyy')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(service.next_renewal_date), 'EEE')}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
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
                            View
                          </Button>
                        ) : (
                          <div className="flex items-center text-muted-foreground">
                            <FileText className="h-3 w-3 mr-1" />
                            No invoice
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge 
                          variant={getStatusBadgeVariant(service.status)}
                          className="text-xs font-normal"
                        >
                          {service.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        {canManageData ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-muted">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background border shadow-md">
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
                                onClick={() => updateServiceStatusMutation.mutate({
                                  serviceId: service.id,
                                  status: service.status === 'Paused' ? 'Active' : 'Paused'
                                })}
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
                                onClick={() => updateServiceStatusMutation.mutate({
                                  serviceId: service.id,
                                  status: 'Cancelled'
                                })}
                                disabled={service.status === 'Cancelled'}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancel Service
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteServiceMutation.mutate(service.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Service
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <div className="flex items-center space-x-2">
                            {service.dashboard_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={service.dashboard_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}