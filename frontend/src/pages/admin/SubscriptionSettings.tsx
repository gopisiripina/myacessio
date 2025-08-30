import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionSettings {
  id: string;
  default_reminder_days: number;
  default_currency: any;
  auto_renewal_warning_days: number;
  late_payment_grace_days: number;
}

export default function SubscriptionSettings() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SubscriptionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching subscription settings:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('subscription_settings')
        .update({
          default_reminder_days: settings.default_reminder_days,
          default_currency: settings.default_currency,
          auto_renewal_warning_days: settings.auto_renewal_warning_days,
          late_payment_grace_days: settings.late_payment_grace_days,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating subscription settings:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>Loading subscription settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">No subscription settings found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/settings')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to System Settings
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscription Settings</h1>
            <p className="text-muted-foreground">Configure settings for the subscription management module</p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Configuration</CardTitle>
          <CardDescription>
            Manage default values and behaviors for subscription management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Default Currency */}
            <div className="space-y-2">
              <Label htmlFor="default_currency">Default Currency</Label>
              <Select
                value={settings.default_currency}
                onValueChange={(value) => 
                  setSettings({...settings, default_currency: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Default Reminder Days */}
            <div className="space-y-2">
              <Label htmlFor="default_reminder_days">Default Reminder Days</Label>
              <Input
                id="default_reminder_days"
                type="number"
                value={settings.default_reminder_days}
                onChange={(e) => 
                  setSettings({...settings, default_reminder_days: parseInt(e.target.value) || 0})
                }
                min="1"
                max="365"
              />
              <p className="text-sm text-muted-foreground">
                Default days before renewal to send reminders
              </p>
            </div>

            {/* Auto Renewal Warning Days */}
            <div className="space-y-2">
              <Label htmlFor="auto_renewal_warning_days">Auto Renewal Warning Days</Label>
              <Input
                id="auto_renewal_warning_days"
                type="number"
                value={settings.auto_renewal_warning_days}
                onChange={(e) => 
                  setSettings({...settings, auto_renewal_warning_days: parseInt(e.target.value) || 0})
                }
                min="1"
                max="365"
              />
              <p className="text-sm text-muted-foreground">
                Days before auto-renewal to show warning
              </p>
            </div>

            {/* Late Payment Grace Days */}
            <div className="space-y-2">
              <Label htmlFor="late_payment_grace_days">Late Payment Grace Days</Label>
              <Input
                id="late_payment_grace_days"
                type="number"
                value={settings.late_payment_grace_days}
                onChange={(e) => 
                  setSettings({...settings, late_payment_grace_days: parseInt(e.target.value) || 0})
                }
                min="0"
                max="30"
              />
              <p className="text-sm text-muted-foreground">
                Grace period for late payments before marking as overdue
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}