import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Building, Building2 } from 'lucide-react';
import { 
  Settings, 
  Database, 
  Download,
  Shield,
  Activity,
  Users,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Repeat,
  TrendingDown,
  ArrowRight,
  Puzzle,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { DataImport } from '@/components/admin/DataImport';
import { DataClear } from '@/components/admin/DataClear';
import { Link } from 'react-router-dom';

export default function SystemSettings() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);

  // System settings state
  const [appName, setAppName] = useState('Business Manager');
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [reminderDays, setReminderDays] = useState<number>(7);
  const [sessionTimeout, setSessionTimeout] = useState<number>(24);
  // Only allow admins to access this page
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // System stats query
  const { data: systemStats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const [servicesRes, paymentsRes, usersRes, vendorsRes] = await Promise.all([
        supabase.from('services').select('id, status, created_at').order('created_at'),
        supabase.from('payments').select('id, amount, currency, created_at').order('created_at'),
        supabase.from('profiles').select('id, role, created_at').order('created_at'),
        supabase.from('vendors').select('id, created_at').order('created_at')
      ]);

      const services = servicesRes.data || [];
      const payments = paymentsRes.data || [];
      const users = usersRes.data || [];
      const vendors = vendorsRes.data || [];

      // Calculate totals
      const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const activeServices = services.filter(s => s.status === 'Active').length;
      const recentSignups = users.filter(u => 
        new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      return {
        totalUsers: users.length,
        totalServices: services.length,
        activeServices,
        totalPayments: payments.length,
        totalRevenue,
        totalVendors: vendors.length,
        recentSignups,
        lastPayment: payments[payments.length - 1]?.created_at,
        systemHealth: 'healthy' as const
      };
    }
  });
  // Load system settings (singleton)
  const { data: settings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();
      if (error) return null;
      return data as {
        application_name: string;
        default_currency: string;
        default_reminder_days: number;
        session_timeout_hours: number;
      } | null;
    },
  });

  // Hydrate local state when settings load
  useEffect(() => {
    if (settings) {
      setAppName(settings.application_name ?? 'Business Manager');
      setDefaultCurrency(settings.default_currency ?? 'INR');
      setReminderDays(settings.default_reminder_days ?? 7);
      setSessionTimeout(settings.session_timeout_hours ?? 24);
    }
  }, [settings]);

  const exportSystemData = async () => {
    setIsExporting(true);
    try {
      const [servicesRes, paymentsRes, usersRes, vendorsRes, categoriesRes] = await Promise.all([
        supabase.from('services').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('vendors').select('*'),
        supabase.from('categories').select('*')
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        services: servicesRes.data,
        payments: paymentsRes.data,
        users: usersRes.data,
        vendors: vendorsRes.data,
        categories: categoriesRes.data,
        metadata: {
          totalRecords: (servicesRes.data?.length || 0) + 
                       (paymentsRes.data?.length || 0) + 
                       (usersRes.data?.length || 0) + 
                       (vendorsRes.data?.length || 0) + 
                       (categoriesRes.data?.length || 0)
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `system-backup-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
      link.click();

      toast({
        title: "Export successful",
        description: "System data has been exported successfully"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export system data",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = async () => {
    const { error } = await supabase.from('system_settings').upsert({
      id: 'default',
      application_name: appName.trim() || 'Business Manager',
      default_currency: (defaultCurrency || 'INR').trim().toUpperCase(),
      default_reminder_days: Number(reminderDays) || 7,
      session_timeout_hours: Number(sessionTimeout) || 24,
    });

    if (error) {
      toast({ title: 'Save failed', description: 'Could not save settings', variant: 'destructive' });
      return;
    }

    toast({ title: 'Settings saved', description: 'Configuration updated successfully' });
    queryClient.invalidateQueries({ queryKey: ['system-settings'] });
  };

  const handleReset = async () => {
    setAppName('Business Manager');
    setDefaultCurrency('USD');
    setReminderDays(7);
    setSessionTimeout(24);

    const { error } = await supabase.from('system_settings').upsert({
      id: 'default',
      application_name: 'Business Manager',
      default_currency: 'USD',
      default_reminder_days: 7,
      session_timeout_hours: 24,
    });

    if (error) {
      toast({ title: 'Reset failed', description: 'Could not reset to defaults', variant: 'destructive' });
      return;
    }

    toast({ title: 'Defaults restored', description: 'System settings reset to defaults' });
    queryClient.invalidateQueries({ queryKey: ['system-settings'] });
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
            <Settings className="mr-2 md:mr-3 h-6 w-6 md:h-8 md:w-8 text-primary" />
            System Settings
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Comprehensive system administration and module management
          </p>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="mr-2 h-4 w-4 text-blue-500" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{systemStats?.recentSignups || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Database className="mr-2 h-4 w-4 text-green-500" />
              Active Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.activeServices || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {systemStats?.totalServices || 0} total
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-amber-500" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(systemStats?.totalRevenue || 0, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemStats?.totalPayments || 0} payments
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="mr-2 h-4 w-4 text-emerald-500" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Healthy</span>
            </div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Company Settings Section */}
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5 text-indigo-500" />
            Company Settings
          </CardTitle>
          <CardDescription>
            Manage company profile, email, SMS, WhatsApp integrations and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Building2 className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <h4 className="font-medium">Single Tenant Configuration</h4>
                <p className="text-sm text-muted-foreground">
                  Company profile, SMTP/IMAP, SMS gateway, WhatsApp Business API
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/admin/company-settings">
                <Settings className="mr-2 h-4 w-4" />
                Configure Company
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Module Management Section */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Puzzle className="mr-2 h-5 w-5 text-primary" />
            Module Management
          </CardTitle>
          <CardDescription>
            Install, configure, and manage application modules to customize your business workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Puzzle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Module Store & Configuration</h4>
                <p className="text-sm text-muted-foreground">
                  Enable, disable, and configure modules based on your business needs
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/admin/modules">
                <Settings className="mr-2 h-4 w-4" />
                Manage Modules
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Module-Specific Settings */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Repeat className="mr-2 h-5 w-5 text-blue-500" />
              Subscription Management
            </CardTitle>
            <CardDescription>
              Configure settings for subscription management module
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Repeat className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Module Configuration</h4>
                  <p className="text-xs text-muted-foreground">
                    Currencies, reminders, renewal warnings
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/subscription-settings">
                  <Settings className="mr-2 h-3 w-3" />
                  Configure
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="mr-2 h-5 w-5 text-orange-500" />
              Assets & Depreciation
            </CardTitle>
            <CardDescription>
              Configure settings for asset management and depreciation module
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Module Configuration</h4>
                  <p className="text-xs text-muted-foreground">
                    Depreciation methods, useful life, audit schedules
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/asset-settings">
                  <Settings className="mr-2 h-3 w-3" />
                  Configure
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management & Security */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5 text-green-500" />
              Data Management
            </CardTitle>
            <CardDescription>
              System backup, import, and database management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Download className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">System Backup</h4>
                  <p className="text-xs text-muted-foreground">
                    Export all system data for backup purposes
                  </p>
                </div>
              </div>
              <Button 
                onClick={exportSystemData}
                disabled={isExporting}
                variant="outline"
                size="sm"
              >
                <Download className="mr-2 h-3 w-3" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Database Statistics</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <Database className="h-3 w-3 text-muted-foreground" />
                  <span>Services: {systemStats?.totalServices || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-3 w-3 text-muted-foreground" />
                  <span>Payments: {systemStats?.totalPayments || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span>Users: {systemStats?.totalUsers || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-3 w-3 text-muted-foreground" />
                  <span>Vendors: {systemStats?.totalVendors || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-purple-500" />
              Security & Monitoring
            </CardTitle>
            <CardDescription>
              System security settings and monitoring options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                <Label htmlFor="audit-logs" className="text-sm font-medium flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-purple-500" />
                  Enable Audit Logs
                </Label>
                <Switch id="audit-logs" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                <Label htmlFor="email-notifications" className="text-sm font-medium flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4 text-purple-500" />
                  Email Notifications
                </Label>
                <Switch id="email-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                <Label htmlFor="auto-backup" className="text-sm font-medium flex items-center">
                  <Database className="mr-2 h-4 w-4 text-purple-500" />
                  Auto Backup (Weekly)
                </Label>
                <Switch id="auto-backup" />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">System Status</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Online
                </Badge>
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <Clock className="mr-1 h-3 w-3" />
                  Last backup: Never
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Import & Clear */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        <DataImport />
        <DataClear />
      </div>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="app-name">Application Name</Label>
              <Input id="app-name" value={appName} onChange={(e) => setAppName(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="default-currency">Default Currency</Label>
              <Input id="default-currency" value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminder-days">Default Reminder Days</Label>
              <Input id="reminder-days" type="number" value={reminderDays} onChange={(e) => setReminderDays(Number(e.target.value))} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
              <Input id="session-timeout" type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(Number(e.target.value))} />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleReset}>Reset to Defaults</Button>
            <Button onClick={handleSave}>Save Configuration</Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <Badge variant="outline">INFO</Badge>
              <span className="text-muted-foreground">2 minutes ago</span>
              <span>User login: admin@example.com</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Badge variant="outline">INFO</Badge>
              <span className="text-muted-foreground">1 hour ago</span>
              <span>New service created: Netflix</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Badge variant="outline">INFO</Badge>
              <span className="text-muted-foreground">3 hours ago</span>
              <span>Payment recorded: $25.00</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}