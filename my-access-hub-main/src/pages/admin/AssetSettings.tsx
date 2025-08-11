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

interface AssetSettings {
  id: string;
  default_depreciation_method: any;
  default_useful_life_years: number;
  default_salvage_value_percent: number;
  depreciation_calculation_frequency: string;
  asset_audit_reminder_days: number;
  maintenance_reminder_days: number;
}

export default function AssetSettings() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AssetSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('asset_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching asset settings:', error);
      toast({
        title: "Error",
        description: "Failed to load asset settings",
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
        .from('asset_settings')
        .update({
          default_depreciation_method: settings.default_depreciation_method,
          default_useful_life_years: settings.default_useful_life_years,
          default_salvage_value_percent: settings.default_salvage_value_percent,
          depreciation_calculation_frequency: settings.depreciation_calculation_frequency,
          asset_audit_reminder_days: settings.asset_audit_reminder_days,
          maintenance_reminder_days: settings.maintenance_reminder_days,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Asset settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating asset settings:', error);
      toast({
        title: "Error",
        description: "Failed to update asset settings",
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
            <p>Loading asset settings...</p>
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
            <p className="text-muted-foreground">No asset settings found.</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Asset Settings</h1>
            <p className="text-muted-foreground">Configure settings for the asset management & depreciation module</p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Configuration</CardTitle>
          <CardDescription>
            Manage default values and behaviors for asset management and depreciation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Default Depreciation Method */}
            <div className="space-y-2">
              <Label htmlFor="default_depreciation_method">Default Depreciation Method</Label>
              <Select
                value={settings.default_depreciation_method}
                onValueChange={(value) => 
                  setSettings({...settings, default_depreciation_method: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="straight_line">Straight Line</SelectItem>
                  <SelectItem value="declining_balance">Declining Balance</SelectItem>
                  <SelectItem value="sum_of_years">Sum of Years</SelectItem>
                  <SelectItem value="units_of_production">Units of Production</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Default Useful Life Years */}
            <div className="space-y-2">
              <Label htmlFor="default_useful_life_years">Default Useful Life (Years)</Label>
              <Input
                id="default_useful_life_years"
                type="number"
                value={settings.default_useful_life_years}
                onChange={(e) => 
                  setSettings({...settings, default_useful_life_years: parseInt(e.target.value) || 0})
                }
                min="1"
                max="50"
              />
              <p className="text-sm text-muted-foreground">
                Default useful life for new assets
              </p>
            </div>

            {/* Default Salvage Value Percent */}
            <div className="space-y-2">
              <Label htmlFor="default_salvage_value_percent">Default Salvage Value (%)</Label>
              <Input
                id="default_salvage_value_percent"
                type="number"
                step="0.01"
                value={settings.default_salvage_value_percent}
                onChange={(e) => 
                  setSettings({...settings, default_salvage_value_percent: parseFloat(e.target.value) || 0})
                }
                min="0"
                max="100"
              />
              <p className="text-sm text-muted-foreground">
                Default salvage value as percentage of purchase cost
              </p>
            </div>

            {/* Depreciation Calculation Frequency */}
            <div className="space-y-2">
              <Label htmlFor="depreciation_calculation_frequency">Depreciation Calculation Frequency</Label>
              <Select
                value={settings.depreciation_calculation_frequency}
                onValueChange={(value) => 
                  setSettings({...settings, depreciation_calculation_frequency: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Asset Audit Reminder Days */}
            <div className="space-y-2">
              <Label htmlFor="asset_audit_reminder_days">Asset Audit Reminder (Days)</Label>
              <Input
                id="asset_audit_reminder_days"
                type="number"
                value={settings.asset_audit_reminder_days}
                onChange={(e) => 
                  setSettings({...settings, asset_audit_reminder_days: parseInt(e.target.value) || 0})
                }
                min="1"
                max="365"
              />
              <p className="text-sm text-muted-foreground">
                Days between asset audit reminders
              </p>
            </div>

            {/* Maintenance Reminder Days */}
            <div className="space-y-2">
              <Label htmlFor="maintenance_reminder_days">Maintenance Reminder (Days)</Label>
              <Input
                id="maintenance_reminder_days"
                type="number"
                value={settings.maintenance_reminder_days}
                onChange={(e) => 
                  setSettings({...settings, maintenance_reminder_days: parseInt(e.target.value) || 0})
                }
                min="1"
                max="365"
              />
              <p className="text-sm text-muted-foreground">
                Days between maintenance reminders
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