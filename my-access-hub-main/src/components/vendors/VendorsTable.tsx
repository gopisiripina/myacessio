import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/currency';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreHorizontal,
  ExternalLink,
  Mail,
  Phone,
  Edit,
  Trash2,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Vendor } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

interface VendorWithStats extends Vendor {
  service_count: number;
  total_monthly_spend: number;
}

export function VendorsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { canManageData } = usePermissions();
  const queryClient = useQueryClient();

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async (): Promise<VendorWithStats[]> => {
      // Get vendors with service counts and spending
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .order('name');

      if (vendorsError) throw vendorsError;

      // Get service statistics for each vendor
      const vendorsWithStats = await Promise.all(
        (vendorsData || []).map(async (vendor) => {
          const { data: services } = await supabase
            .from('services')
            .select('amount, billing_cycle, custom_cycle_days, status')
            .eq('vendor_id', vendor.id)
            .eq('status', 'Active');

          const serviceCount = services?.length || 0;
          
          // Calculate monthly spend
          const monthlySpend = services?.reduce((total, service) => {
            let monthlyAmount = 0;
            switch (service.billing_cycle) {
              case 'Monthly':
                monthlyAmount = service.amount;
                break;
              case 'Quarterly':
                monthlyAmount = service.amount / 3;
                break;
              case 'Semi-Annual':
                monthlyAmount = service.amount / 6;
                break;
              case 'Annual':
                monthlyAmount = service.amount / 12;
                break;
              case 'Custom_days':
                monthlyAmount = service.amount / (service.custom_cycle_days || 30) * 30;
                break;
            }
            return total + monthlyAmount;
          }, 0) || 0;

          return {
            ...vendor,
            service_count: serviceCount,
            total_monthly_spend: monthlySpend,
          };
        })
      );

      return vendorsWithStats;
    },
  });

  const deleteVendorMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      // Check if vendor has services
      const { data: services } = await supabase
        .from('services')
        .select('id')
        .eq('vendor_id', vendorId);

      if (services && services.length > 0) {
        throw new Error('Cannot delete vendor with active services. Please remove or reassign services first.');
      }

      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({
        title: 'Vendor deleted',
        description: 'The vendor has been removed successfully.',
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

  const filteredVendors = vendors?.filter(vendor => 
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.support_email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];


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
        <CardTitle>Vendors</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Monthly Spend</TableHead>
                <TableHead>Website</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-muted-foreground">
                      {searchTerm 
                        ? 'No vendors match your search' 
                        : 'No vendors yet. Add vendors to organize your services.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{vendor.name}</div>
                          {vendor.notes && (
                            <div className="text-xs text-muted-foreground">
                              {vendor.notes.length > 50 
                                ? `${vendor.notes.substring(0, 50)}...` 
                                : vendor.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {vendor.support_email && (
                          <div className="flex items-center text-xs">
                            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                            <a 
                              href={`mailto:${vendor.support_email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {vendor.support_email}
                            </a>
                          </div>
                        )}
                        {vendor.support_phone && (
                          <div className="flex items-center text-xs">
                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                            <a 
                              href={`tel:${vendor.support_phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {vendor.support_phone}
                            </a>
                          </div>
                        )}
                        {!vendor.support_email && !vendor.support_phone && (
                          <span className="text-muted-foreground text-xs">No contact info</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{vendor.service_count}</div>
                        <div className="text-xs text-muted-foreground">
                          {vendor.service_count === 1 ? 'service' : 'services'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {vendor.total_monthly_spend > 0 
                          ? formatCurrency(vendor.total_monthly_spend)
                          : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {vendor.website ? (
                        <a 
                          href={vendor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Visit site
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                     <TableCell>
                       {canManageData ? (
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" className="h-8 w-8 p-0">
                               <MoreHorizontal className="h-4 w-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuLabel>Actions</DropdownMenuLabel>
                             {vendor.website && (
                               <DropdownMenuItem asChild>
                                 <a href={vendor.website} target="_blank" rel="noopener noreferrer">
                                   <ExternalLink className="mr-2 h-4 w-4" />
                                   Visit Website
                                 </a>
                               </DropdownMenuItem>
                             )}
                             {vendor.support_email && (
                               <DropdownMenuItem asChild>
                                 <a href={`mailto:${vendor.support_email}`}>
                                   <Mail className="mr-2 h-4 w-4" />
                                   Send Email
                                 </a>
                               </DropdownMenuItem>
                             )}
                             <DropdownMenuItem>
                               <Edit className="mr-2 h-4 w-4" />
                               Edit Vendor
                             </DropdownMenuItem>
                             <DropdownMenuItem
                               onClick={() => deleteVendorMutation.mutate(vendor.id)}
                               className="text-red-600"
                               disabled={vendor.service_count > 0}
                             >
                               <Trash2 className="mr-2 h-4 w-4" />
                               Delete Vendor
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       ) : (
                         <div className="flex items-center space-x-2">
                           {vendor.website && (
                             <Button variant="outline" size="sm" asChild>
                               <a href={vendor.website} target="_blank" rel="noopener noreferrer">
                                 <ExternalLink className="h-4 w-4" />
                               </a>
                             </Button>
                           )}
                           {vendor.support_email && (
                             <Button variant="outline" size="sm" asChild>
                               <a href={`mailto:${vendor.support_email}`}>
                                 <Mail className="h-4 w-4" />
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
      </CardContent>
    </Card>
  );
}