import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Search, CreditCard, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentsTable } from '@/components/payments/PaymentsTable';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { usePayments } from '@/hooks/usePayments';
import { formatCurrency } from '@/lib/currency';
import { aggregateMultiCurrencyAmounts } from '@/lib/currencyConverter';

export default function Payments() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { data: payments, isLoading } = usePayments();

  // Calculate payment statistics
  const stats = payments ? {
    totalPayments: payments.length,
    thisMonth: payments.filter(p => {
      const paymentDate = new Date(p.payment_date);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    }).length,
    amounts: aggregateMultiCurrencyAmounts(
      payments.map(p => ({ amount: p.amount, currency: p.currency }))
    )
  } : { totalPayments: 0, thisMonth: 0, amounts: { totals: [], convertedToUSD: 0, convertedToINR: 0 } };

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
              <CreditCard className="mr-3 h-8 w-8 text-green-600" />
              Payment History
            </h1>
            <p className="text-muted-foreground">
              Track and manage all subscription payments
            </p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Payment</DialogTitle>
            </DialogHeader>
            <PaymentForm onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
            <p className="text-xs text-muted-foreground">
              All time transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Payments this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount (USD)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.amounts.convertedToUSD, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground">
              Total payments value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount (INR)</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.amounts.convertedToINR, 'INR')}
            </div>
            <div className="flex gap-2 mt-1">
              {stats.amounts.totals.map(({ currency, amount }) => (
                <Badge key={currency} variant="secondary" className="text-xs">
                  {formatCurrency(amount, currency)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="flex items-center text-lg">
                <Search className="mr-2 h-5 w-5 text-indigo-500" />
                Payment Records
              </CardTitle>
            </div>
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <PaymentsTable searchTerm={searchTerm} />
        </CardContent>
      </Card>
    </div>
  );
}