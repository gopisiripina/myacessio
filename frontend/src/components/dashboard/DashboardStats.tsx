import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Database, 
  AlertTriangle, 
  RefreshCw,
  Activity
} from 'lucide-react';
import { useServiceStats } from '@/hooks/useServices';
import { formatCurrency } from '@/lib/currency';

export function DashboardStats() {
  const { data: stats, isLoading } = useServiceStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-20 mb-1"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.totalMonthlySpend?.byCurrency?.map((curr, index) => (
              <div key={curr.currency}>
                {formatCurrency(curr.amount, curr.currency as 'INR' | 'USD' | 'EUR')}
                {index < (stats.totalMonthlySpend?.byCurrency?.length || 0) - 1 && <span className="text-lg"> + </span>}
              </div>
            )) || formatCurrency(0, 'INR')}
          </div>
          <p className="text-xs text-muted-foreground">
            Current month active subscriptions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projected Yearly</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.projectedYearlySpend?.byCurrency?.map((curr, index) => (
              <div key={curr.currency}>
                {formatCurrency(curr.amount, curr.currency as 'INR' | 'USD' | 'EUR')}
                {index < (stats.projectedYearlySpend?.byCurrency?.length || 0) - 1 && <span className="text-lg"> + </span>}
              </div>
            )) || formatCurrency(0, 'INR')}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on current subscriptions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.totalSpent?.byCurrency?.map((curr, index) => (
              <div key={curr.currency}>
                {formatCurrency(curr.amount, curr.currency as 'INR' | 'USD' | 'EUR')}
                {index < (stats.totalSpent?.byCurrency?.length || 0) - 1 && <span className="text-lg"> + </span>}
              </div>
            )) || formatCurrency(0, 'INR')}
          </div>
          <p className="text-xs text-muted-foreground">
            All time actual payments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Year Spent</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.yearlySpent?.byCurrency?.map((curr, index) => (
              <div key={curr.currency}>
                {formatCurrency(curr.amount, curr.currency as 'INR' | 'USD' | 'EUR')}
                {index < (stats.yearlySpent?.byCurrency?.length || 0) - 1 && <span className="text-lg"> + </span>}
              </div>
            )) || formatCurrency(0, 'INR')}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date().getFullYear()} actual payments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Services</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {stats?.activeServices || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            of {stats?.totalServices || 0} total services
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expired Services</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {stats?.expiredServices || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Need immediate attention
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Auto Renewal</CardTitle>
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {stats?.autoRenewServices || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Services with auto-renewal enabled
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Health Score</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              {stats?.totalServices ? Math.round((stats.activeServices / stats.totalServices) * 100) : 0}%
            </div>
            <Badge variant={
              stats?.totalServices && (stats.activeServices / stats.totalServices) > 0.8 ? "default" :
              stats?.totalServices && (stats.activeServices / stats.totalServices) > 0.6 ? "secondary" : "destructive"
            }>
              {stats?.totalServices && (stats.activeServices / stats.totalServices) > 0.8 ? "Excellent" :
               stats?.totalServices && (stats.activeServices / stats.totalServices) > 0.6 ? "Good" : "Needs Attention"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Active vs total services ratio
          </p>
        </CardContent>
      </Card>
    </div>
  );
}