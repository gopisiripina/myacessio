import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/currency';
import { aggregateMultiCurrencyAmounts, convertToUSD } from '@/lib/currencyConverter';
import { ExportAnalysis } from './ExportAnalysis';

export function ReportsOverview() {
  const { data: summaryData, isLoading, error } = useQuery({
    queryKey: ['reports-summary'],
    queryFn: async () => {
      console.log('Reports: Starting data fetch...');
      // Get category breakdown - now we need to join with categories table
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select(`
          category_id, 
          amount, 
          billing_cycle, 
          custom_cycle_days, 
          status, 
          currency,
          next_renewal_date,
          categories!inner(name)
        `)
        .eq('status', 'Active');

      console.log('Reports: Services fetch result:', { services: services?.length, error: servicesError });
      
      if (servicesError) {
        console.error('Reports: Error fetching services:', servicesError);
        throw servicesError;
      }

      if (!services) return null;

      // Calculate current month actual amounts (not average monthly)
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const monthlyAmounts = services.map(service => {
        if (!service.next_renewal_date) return { amount: 0, currency: service.currency, category: service.categories?.name || 'Unknown' };
        
        const nextRenewal = new Date(service.next_renewal_date);
        const renewalMonth = nextRenewal.getMonth();
        const renewalYear = nextRenewal.getFullYear();
        
        // Only count if renewal is due in current month/year
        if (renewalYear === currentYear && renewalMonth === currentMonth) {
          return {
            amount: service.amount,
            currency: service.currency,
            category: service.categories?.name || 'Unknown'
          };
        }
        
        return { amount: 0, currency: service.currency, category: service.categories?.name || 'Unknown' };
      });

      // Aggregate totals by currency using the centralized converter
      const { convertedToUSD, convertedToINR, totals } = aggregateMultiCurrencyAmounts(monthlyAmounts);

      // Calculate category breakdown using the proper currency converter
      const categoryTotals = monthlyAmounts.reduce((acc, item) => {
        if (item.amount === 0) return acc;
        
        const categoryName = item.category;
        const usdAmount = item.currency === 'USD' ? item.amount : 
                         convertToUSD(item.amount, item.currency);
        acc[categoryName] = (acc[categoryName] || 0) + usdAmount;
        return acc;
      }, {} as Record<string, number>);

      const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0];

      // Get payments for last 3 months trend
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('payment_date, amount, currency')
        .gte('payment_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('payment_date');

      console.log('Reports: Payments fetch result:', { payments: payments?.length, error: paymentsError });
      
      if (paymentsError) {
        console.error('Reports: Error fetching payments:', paymentsError);
        // Don't throw error for payments, just use empty array
      }

      const paymentsAmounts = payments?.map(p => ({ amount: p.amount, currency: p.currency })) || [];
      const { convertedToINR: last3MonthsINR } = aggregateMultiCurrencyAmounts(paymentsAmounts);

      return {
        categoryBreakdown: Object.entries(categoryTotals).map(([category, amount]) => ({
          category,
          amount: Math.round(amount),
          percentage: Math.round((amount / convertedToUSD) * 100)
        })).sort((a, b) => b.amount - a.amount),
        totalMonthlySpend: { 
          usd: Math.round(convertedToUSD), 
          inr: Math.round(convertedToINR) 
        },
        topCategory: topCategory ? { category: topCategory[0], amount: Math.round(topCategory[1]) } : null,
        last3MonthsTotal: Math.round(last3MonthsINR),
        serviceCount: services.length,
        currencyBreakdown: services.reduce((acc, service) => {
          acc[service.currency] = (acc[service.currency] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    },
  });

  console.log('Reports: Component render', { isLoading, hasError: !!error, hasData: !!summaryData });

  if (error) {
    console.error('Reports: Query error:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-2">Error loading reports</p>
        <p className="text-muted-foreground text-sm">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No data available. Add some services to see reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryData.totalMonthlySpend.inr, 'INR')}</div>
            <div className="text-sm text-muted-foreground">{formatCurrency(summaryData.totalMonthlySpend.usd, 'USD')}</div>
            <p className="text-xs text-muted-foreground">
              From {summaryData.serviceCount} active services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData.topCategory?.category || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryData.topCategory && formatCurrency(summaryData.topCategory.amount)} monthly
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quarterly Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryData.last3MonthsTotal)}</div>
            <p className="text-xs text-muted-foreground">
              Last 3 months actual payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.categoryBreakdown.length}</div>
            <p className="text-xs text-muted-foreground">
              Different service types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summaryData.categoryBreakdown.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                  </div>
                  <div className="font-medium">{formatCurrency(item.amount)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(summaryData.currencyBreakdown).map(([currency, count]) => (
                <div key={currency} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{currency}</Badge>
                  </div>
                  <div className="font-medium">
                    {count} {count === 1 ? 'service' : 'services'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <ExportAnalysis summaryData={summaryData} />
    </div>
  );
}