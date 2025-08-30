import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Service, ServiceWithPayments } from '@/lib/types';
import { aggregateMultiCurrencyAmounts } from '@/lib/currencyConverter';

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async (): Promise<ServiceWithPayments[]> => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          vendor:vendors(*),
          payments(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useServiceStats() {
  return useQuery({
    queryKey: ['service-stats'],
    queryFn: async () => {
      console.log('ServiceStats: Starting fetch...');
      const { data: services, error } = await supabase
        .from('services')
        .select('*');

      console.log('ServiceStats: Fetch result:', { count: services?.length, error });
      
      if (error) {
        console.error('ServiceStats: Error:', error);
        throw error;
      }

      // Get payments for total and yearly calculations
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, currency, payment_date');

      if (paymentsError) {
        console.error('ServiceStats: Payments error:', paymentsError);
        throw paymentsError;
      }

      const now = new Date();
      const currentYear = now.getFullYear();

      // Calculate current month spend - services with renewals due this month
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const activeServices = services?.filter(service => service.status === 'Active') || [];
      
      // Filter services that have renewals due in current month
      const currentMonthRenewals = activeServices.filter(service => {
        if (!service.next_renewal_date) return false;
        const renewalDate = new Date(service.next_renewal_date);
        return renewalDate >= currentMonthStart && renewalDate <= currentMonthEnd;
      });
      
      // Calculate amounts for services due this month
      const monthlyAmounts = currentMonthRenewals.map(service => ({
        amount: service.next_renewal_amount ?? service.amount,
        currency: service.currency
      }));

      // Aggregate multi-currency totals
      const { convertedToUSD, convertedToINR, totals } = aggregateMultiCurrencyAmounts(monthlyAmounts);
      
      const totalMonthlySpend = { 
        usd: convertedToUSD, 
        inr: convertedToINR, 
        byCurrency: totals 
      };

      // Calculate total spent (all time) from payments
      const totalSpentAmounts = payments?.map(payment => ({
        amount: payment.amount,
        currency: payment.currency
      })) || [];
      
      const totalSpent = aggregateMultiCurrencyAmounts(totalSpentAmounts);

      // Calculate yearly spent (current year only)
      const currentYearPayments = payments?.filter(payment => {
        const paymentYear = new Date(payment.payment_date).getFullYear();
        return paymentYear === currentYear;
      }).map(payment => ({
        amount: payment.amount,
        currency: payment.currency
      })) || [];
      
      const yearlySpent = aggregateMultiCurrencyAmounts(currentYearPayments);

      const activeServicesCount = services?.filter(s => s.status === 'Active').length || 0;
      const expiredServices = services?.filter(s => s.status === 'Expired').length || 0;
      const autoRenewServices = services?.filter(s => s.auto_renew && s.status === 'Active').length || 0;

      // Calculate projected yearly amounts for renewals that occur in the current year
      const today = new Date();
      const currentYearEnd = new Date(currentYear, 11, 31);
      
      const yearlyAmounts = activeServices.map(service => {
        if (!service.next_renewal_date) return null;
        
        const nextRenewal = new Date(service.next_renewal_date);
        const renewalAmount = service.next_renewal_amount ?? service.amount;
        
        // Only count if renewal happens in current year
        if (nextRenewal.getFullYear() !== currentYear) {
          return null;
        }
        
        let renewalCount = 0;
        let currentRenewalDate = new Date(nextRenewal);
        
        // Count how many renewals will happen from next renewal date to end of year
        while (currentRenewalDate <= currentYearEnd) {
          renewalCount++;
          
          // Calculate next renewal date based on billing cycle
          switch (service.billing_cycle) {
            case 'Monthly':
              currentRenewalDate = new Date(currentRenewalDate.setMonth(currentRenewalDate.getMonth() + 1));
              break;
            case 'Quarterly':
              currentRenewalDate = new Date(currentRenewalDate.setMonth(currentRenewalDate.getMonth() + 3));
              break;
            case 'Semi-Annual':
              currentRenewalDate = new Date(currentRenewalDate.setMonth(currentRenewalDate.getMonth() + 6));
              break;
            case 'Annual':
              currentRenewalDate = new Date(currentRenewalDate.setFullYear(currentRenewalDate.getFullYear() + 1));
              break;
            case 'Custom_days':
              if (service.custom_cycle_days) {
                currentRenewalDate = new Date(currentRenewalDate.getTime() + (service.custom_cycle_days * 24 * 60 * 60 * 1000));
              } else {
                break;
              }
              break;
            default:
              break;
          }
        }
        
        return renewalCount > 0 ? {
          amount: renewalAmount * renewalCount,
          currency: service.currency
        } : null;
      }).filter(Boolean) as Array<{ amount: number; currency: string }>;
      
      const yearlyRenewalTotals = aggregateMultiCurrencyAmounts(yearlyAmounts);

      return {
        totalMonthlySpend,
        projectedYearlySpend: { 
          usd: yearlyRenewalTotals.convertedToUSD, 
          inr: yearlyRenewalTotals.convertedToINR,
          byCurrency: yearlyRenewalTotals.totals
        },
        totalSpent: {
          usd: totalSpent.convertedToUSD,
          inr: totalSpent.convertedToINR,
          byCurrency: totalSpent.totals
        },
        yearlySpent: {
          usd: yearlySpent.convertedToUSD,
          inr: yearlySpent.convertedToINR,
          byCurrency: yearlySpent.totals
        },
        activeServices: activeServicesCount,
        expiredServices,
        autoRenewServices,
        totalServices: services?.length || 0,
      };
    },
  });
}

export function useUpcomingRenewals(days: number = 30) {
  return useQuery({
    queryKey: ['upcoming-renewals', days],
    queryFn: async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          vendor:vendors(*)
        `)
        .eq('status', 'Active')
        .not('next_renewal_date', 'is', null)
        .lte('next_renewal_date', futureDate.toISOString().split('T')[0])
        .order('next_renewal_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useOverdueServices() {
  return useQuery({
    queryKey: ['overdue-services'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          vendor:vendors(*)
        `)
        .in('status', ['Active', 'Expired'])
        .not('next_renewal_date', 'is', null)
        .lt('next_renewal_date', today)
        .order('next_renewal_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}