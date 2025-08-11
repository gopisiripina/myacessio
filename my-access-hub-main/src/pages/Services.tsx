import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Search, Database, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ServicesTable } from '@/components/services/ServicesTable';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/currency';

export default function Services() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Get services statistics
  const { data: stats } = useQuery({
    queryKey: ['services-stats'],
    queryFn: async () => {
      const [servicesResult, paymentsResult] = await Promise.all([
        supabase.from('services').select('*'),
        supabase.from('payments').select('amount, currency').gte('payment_date', new Date(new Date().getFullYear(), 0, 1).toISOString())
      ]);

      const totalServices = servicesResult.data?.length || 0;
      const activeServices = servicesResult.data?.filter(s => s.status === 'Active').length || 0;
      const upcomingRenewals = servicesResult.data?.filter(service => {
        if (!service.next_renewal_date) return false;
        const renewalDate = new Date(service.next_renewal_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return renewalDate <= thirtyDaysFromNow && service.status === 'Active';
      }).length || 0;

      // Calculate total spending this year
      const totalSpent = paymentsResult.data?.reduce((sum, payment) => {
        // Convert to INR for consistency (simplified conversion)
        const amount = payment.currency === 'USD' ? payment.amount * 83 : 
                     payment.currency === 'EUR' ? payment.amount * 90 : payment.amount;
        return sum + amount;
      }, 0) || 0;

      return {
        totalServices,
        activeServices,
        upcomingRenewals,
        totalSpent
      };
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Database className="mr-3 h-8 w-8 text-blue-600" />
              Manage Services
            </h1>
            <p className="text-muted-foreground">
              View and manage all your subscription services
            </p>
          </div>
        </div>
        <Button asChild className="hover-scale">
          <Link to="/services/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalServices || 0}</div>
            <p className="text-xs text-muted-foreground">
              All subscription services
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.activeServices || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.upcomingRenewals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent (2024)</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalSpent || 0, 'INR')}
            </div>
            <p className="text-xs text-muted-foreground">
              This year's payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="flex items-center text-lg">
                <Search className="mr-2 h-5 w-5 text-indigo-500" />
                Service Management
              </CardTitle>
            </div>
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ServicesTable searchTerm={searchTerm} />
        </CardContent>
      </Card>
    </div>
  );
}