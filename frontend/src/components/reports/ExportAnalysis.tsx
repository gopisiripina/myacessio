import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, TrendingDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';

interface ExportAnalysisProps {
  summaryData: any;
}

export function ExportAnalysis({ summaryData }: ExportAnalysisProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const downloadCSV = async () => {
    setIsExporting(true);
    try {
      // Fetch all services with related data
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select(`
          *,
          categories!inner(name),
          vendors(name),
          payments(payment_date, amount, currency, invoice_number)
        `);

      if (servicesError) throw servicesError;

      // Create CSV content
      const headers = [
        'Service Name',
        'Provider',
        'Category',
        'Vendor',
        'Amount',
        'Currency',
        'Billing Cycle',
        'Status',
        'Start Date',
        'Next Renewal',
        'Auto Renew',
        'Importance',
        'Account Email',
        'Last Payment Date',
        'Last Payment Amount'
      ];

      const csvContent = [
        headers.join(','),
        ...services.map(service => [
          `"${service.service_name}"`,
          `"${service.provider}"`,
          `"${service.categories?.name || ''}"`,
          `"${service.vendors?.name || ''}"`,
          service.amount,
          service.currency,
          service.billing_cycle,
          service.status,
          service.start_date,
          service.next_renewal_date || '',
          service.auto_renew,
          service.importance,
          `"${service.account_email || ''}"`,
          service.payments?.[0]?.payment_date || '',
          service.payments?.[0]?.amount || ''
        ].join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `services-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();

      toast({
        title: "Export successful",
        description: "Services data has been downloaded as CSV"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generateMonthlyReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Fetch detailed data for report
      const { data: services } = await supabase
        .from('services')
        .select(`
          *,
          categories!inner(name),
          vendors(name),
          payments(payment_date, amount, currency)
        `);

      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .gte('payment_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('payment_date');

      // Generate comprehensive report content
      const reportContent = `
MONTHLY SUBSCRIPTION REPORT
Generated: ${format(new Date(), 'PPpp')}

=== SUMMARY ===
Total Monthly Spend: ${formatCurrency(summaryData.totalMonthlySpend.inr, 'INR')} (${formatCurrency(summaryData.totalMonthlySpend.usd, 'USD')})
Active Services: ${summaryData.serviceCount}
Categories: ${summaryData.categoryBreakdown.length}
Top Category: ${summaryData.topCategory?.category || 'N/A'}

=== CATEGORY BREAKDOWN ===
${summaryData.categoryBreakdown.map(cat => 
  `${cat.category}: ${formatCurrency(cat.amount)} (${cat.percentage}%)`
).join('\n')}

=== ACTIVE SERVICES ===
${services?.map(service => 
  `${service.service_name} - ${service.provider}
  Category: ${service.categories?.name}
  Amount: ${formatCurrency(service.amount, service.currency)}
  Billing: ${service.billing_cycle}
  Status: ${service.status}
  Next Renewal: ${service.next_renewal_date || 'Not set'}
  ---`
).join('\n')}

=== PAYMENT HISTORY (Last 12 Months) ===
${payments?.map(payment => 
  `${payment.payment_date}: ${formatCurrency(payment.amount, payment.currency)} ${payment.invoice_number ? `(${payment.invoice_number})` : ''}`
).join('\n')}
      `;

      // Download report as text file
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `monthly-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      link.click();

      toast({
        title: "Report generated",
        description: "Monthly report has been downloaded"
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Report generation failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const analyzeCosts = async () => {
    setIsAnalyzing(true);
    try {
      // Fetch data for analysis
      const { data: services } = await supabase
        .from('services')
        .select(`
          *,
          categories!inner(name),
          vendors(name)
        `);

      if (!services) throw new Error('No services found');

      // Perform cost analysis
      const analysis = {
        potentialSavings: 0,
        duplicateServices: [] as string[],
        unusedServices: [] as string[],
        expensiveServices: [] as string[],
        recommendations: [] as string[]
      };

      // Find duplicate categories
      const categoryCount: Record<string, string[]> = {};
      services.forEach(service => {
        const category = service.categories?.name || 'Unknown';
        if (!categoryCount[category]) categoryCount[category] = [];
        categoryCount[category].push(service.service_name);
      });

      Object.entries(categoryCount).forEach(([category, serviceNames]) => {
        if (serviceNames.length > 1) {
          analysis.duplicateServices.push(`${category}: ${serviceNames.join(', ')}`);
          analysis.recommendations.push(`Consider consolidating ${category} services to reduce costs`);
        }
      });

      // Calculate actual monthly amounts for current month renewals
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const monthlyAmounts = services.map(service => {
        if (!service.next_renewal_date) return null;
        
        const nextRenewal = new Date(service.next_renewal_date);
        const renewalMonth = nextRenewal.getMonth();
        const renewalYear = nextRenewal.getFullYear();
        
        // Only count if renewal is due in current month/year
        if (renewalYear === currentYear && renewalMonth === currentMonth) {
          return { service: service.service_name, amount: service.amount, currency: service.currency };
        }
        
        return null;
      }).filter(Boolean) as Array<{ service: string; amount: number; currency: string }>;

      const top20Percent = Math.ceil(monthlyAmounts.length * 0.2);
      analysis.expensiveServices = monthlyAmounts.slice(0, top20Percent).map(s => 
        `${s.service}: ${formatCurrency(s.amount, s.currency)}/month`
      );

      // Find services without recent payments (potentially unused)
      const { data: recentPayments } = await supabase
        .from('payments')
        .select('service_id')
        .gte('payment_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      const recentPaymentServiceIds = new Set(recentPayments?.map(p => p.service_id) || []);
      analysis.unusedServices = services
        .filter(service => !recentPaymentServiceIds.has(service.id) && service.status === 'Active')
        .map(service => service.service_name);

      if (analysis.unusedServices.length > 0) {
        analysis.recommendations.push('Review services without recent payments - they might be unused');
      }

      // Generate analysis report
      const analysisContent = `
COST ANALYSIS REPORT
Generated: ${format(new Date(), 'PPpp')}

=== SUMMARY ===
Total Services Analyzed: ${services.length}
Potential Areas for Optimization: ${analysis.recommendations.length}

=== EXPENSIVE SERVICES (Top 20%) ===
${analysis.expensiveServices.join('\n')}

=== DUPLICATE CATEGORIES ===
${analysis.duplicateServices.length > 0 ? analysis.duplicateServices.join('\n') : 'No duplicate categories found'}

=== POTENTIALLY UNUSED SERVICES ===
${analysis.unusedServices.length > 0 ? analysis.unusedServices.join('\n') : 'All services have recent payment activity'}

=== RECOMMENDATIONS ===
${analysis.recommendations.length > 0 ? analysis.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n') : 'No specific recommendations at this time'}

=== NEXT STEPS ===
1. Review expensive services to ensure they provide adequate value
2. Consider annual billing for frequently used services (often cheaper)
3. Audit services without recent payments
4. Look for bundle opportunities with duplicate category services
5. Set up usage tracking for high-cost services
      `;

      // Download analysis report
      const blob = new Blob([analysisContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `cost-analysis-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      link.click();

      toast({
        title: "Analysis complete",
        description: `Found ${analysis.recommendations.length} optimization opportunities`
      });
    } catch (error) {
      console.error('Cost analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze costs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export & Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 border rounded-lg">
            <div className="flex justify-center mb-3">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-medium mb-2">Monthly Report</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Detailed breakdown by month, category, and vendor
            </p>
            <Button 
              onClick={generateMonthlyReport}
              disabled={isGeneratingReport}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isGeneratingReport ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><FileText className="h-4 w-4 mr-2" /> Generate Report</>
              )}
            </Button>
          </div>

          <div className="text-center p-4 border rounded-lg">
            <div className="flex justify-center mb-3">
              <Download className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-medium mb-2">Export CSV</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Download all services and payments data
            </p>
            <Button 
              onClick={downloadCSV}
              disabled={isExporting}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isExporting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Exporting...</>
              ) : (
                <><Download className="h-4 w-4 mr-2" /> Download CSV</>
              )}
            </Button>
          </div>

          <div className="text-center p-4 border rounded-lg">
            <div className="flex justify-center mb-3">
              <TrendingDown className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-medium mb-2">Cost Analysis</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Identify optimization opportunities
            </p>
            <Button 
              onClick={analyzeCosts}
              disabled={isAnalyzing}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isAnalyzing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><TrendingDown className="h-4 w-4 mr-2" /> Analyze Costs</>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}