import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  DollarSign,
  AlertTriangle,
  Plus,
  Tag,
  FileText,
  ArrowRight,
  Repeat
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UpcomingRenewals } from '@/components/dashboard/UpcomingRenewals';

export default function SubscriptionDashboard() {
  // Get subscription statistics
  const { data: stats } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      const [servicesResult, paymentsResult, categoriesResult, recentPayments] = await Promise.all([
        supabase.from('services').select('*').neq('status', 'Cancelled'),
        supabase.from('payments').select('amount, currency').gte('payment_date', new Date(new Date().getFullYear(), 0, 1).toISOString()),
        supabase.from('categories').select('*').eq('is_active', true),
        supabase.from('payments').select('*').order('payment_date', { ascending: false }).limit(5)
      ]);

      const activeServices = servicesResult.data?.length || 0;
      const totalPayments = paymentsResult.data?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      const categoriesCount = categoriesResult.data?.length || 0;
      const recentPaymentsCount = recentPayments.data?.length || 0;
      
      // Calculate upcoming renewals (next 30 days)
      const upcomingRenewals = servicesResult.data?.filter(service => {
        if (!service.next_renewal_date) return false;
        const renewalDate = new Date(service.next_renewal_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return renewalDate <= thirtyDaysFromNow;
      }).length || 0;

      return {
        activeServices,
        totalPayments,
        categoriesCount,
        upcomingRenewals,
        recentPaymentsCount
      };
    }
  });

  const dashboardStats = [
    {
      title: 'Active Services',
      value: stats?.activeServices || 0,
      icon: Database,
      description: 'Currently active subscriptions',
      color: 'text-blue-600'
    },
    {
      title: 'Total Payments (YTD)',
      value: `$${(stats?.totalPayments || 0).toLocaleString()}`,
      icon: DollarSign,
      description: 'Year-to-date payments',
      color: 'text-green-600'
    },
    {
      title: 'Service Categories',
      value: stats?.categoriesCount || 0,
      icon: TrendingUp,
      description: 'Available categories',
      color: 'text-purple-600'
    },
    {
      title: 'Upcoming Renewals',
      value: stats?.upcomingRenewals || 0,
      icon: AlertTriangle,
      description: 'Next 30 days',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Repeat className="mr-3 h-8 w-8 text-primary" />
          Subscription Dashboard
        </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your subscription services
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/services/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <Link to="/services" className="block">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">Manage Services</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage all subscriptions
                </p>
              </div>
            </div>
          </Link>
        </Card>
        
        <Card className="p-4 hover:shadow-md transition-shadow">
          <Link to="/payments" className="block">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold">Payment History</h3>
                <p className="text-sm text-muted-foreground">
                  Track subscription payments
                </p>
              </div>
            </div>
          </Link>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <Link to="/categories" className="block">
            <div className="flex items-center space-x-3">
              <Tag className="h-8 w-8 text-orange-600" />
              <div>
                <h3 className="font-semibold">Service Categories</h3>
                <p className="text-sm text-muted-foreground">
                  Organize subscription categories
                </p>
              </div>
            </div>
          </Link>
        </Card>
        
        <Card className="p-4 hover:shadow-md transition-shadow">
          <Link to="/reports" className="block">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold">Reports & Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Generate detailed reports
                </p>
              </div>
            </div>
          </Link>
        </Card>
      </div>


      {/* Upcoming Renewals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Upcoming Renewals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UpcomingRenewals />
        </CardContent>
      </Card>
    </div>
  );
}