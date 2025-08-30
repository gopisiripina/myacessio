import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Building, Globe, Mail, MessageSquare, Smartphone, Bell, TestTube2, Upload, Save, RefreshCw, ArrowLeft, Building2, Phone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { EmailTab } from './CompanySettingsEmailTab';
import { SmsTab } from './CompanySettingsSmsTab';
import { WhatsAppTab } from './CompanySettingsWhatsAppTab';
import { NotificationTab } from './CompanySettingsNotificationTab';
import { Navigate, useNavigate } from 'react-router-dom';

interface CompanyProfile {
  id: string;
  company_name: string;
  company_logo_url?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  tax_id?: string;
  registration_number?: string;
  industry?: string;
  employee_count?: number;
  founded_year?: number;
  description?: string;
  timezone: string;
  currency: string;
}

interface EmailSettings {
  id?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  smtp_from_email: string;
  smtp_from_name: string;
  imap_host?: string;
  imap_port: number;
  imap_username?: string;
  imap_password?: string;
  imap_encryption: string;
  is_enabled: boolean;
}

interface SMSSettings {
  id?: string;
  provider: string;
  api_key: string;
  api_secret?: string;
  sender_id?: string;
  base_url?: string;
  webhook_url?: string;
  is_enabled: boolean;
}

interface WhatsAppSettings {
  id?: string;
  provider: string;
  phone_number_id: string;
  access_token: string;
  business_account_id?: string;
  webhook_verify_token?: string;
  webhook_url?: string;
  is_enabled: boolean;
}

interface NotificationSettings {
  id?: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  push_notifications: boolean;
  notification_types: {
    reminders: boolean;
    payments: boolean;
    system: boolean;
    security: boolean;
  };
}

export default function CompanySettings() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State for all settings
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
  const [smsSettings, setSmsSettings] = useState<SMSSettings | null>(null);
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);

  // Only allow admins to access this page
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    try {
      setIsLoading(true);
      
      const [companyRes, emailRes, smsRes, whatsappRes, notificationRes] = await Promise.all([
        supabase.from('company_profile').select('*').single(),
        supabase.from('email_settings').select('*').single(),
        supabase.from('sms_settings').select('*').single(),
        supabase.from('whatsapp_settings').select('*').single(),
        supabase.from('notification_settings').select('*').single(),
      ]);

      if (companyRes.data) setCompanyProfile(companyRes.data);
      if (emailRes.data) setEmailSettings(emailRes.data);
      if (smsRes.data) setSmsSettings(smsRes.data);
      if (whatsappRes.data) setWhatsappSettings(whatsappRes.data);
      if (notificationRes.data) {
        // Parse the JSONB notification_types field
        const parsedNotificationTypes = typeof notificationRes.data.notification_types === 'string' 
          ? JSON.parse(notificationRes.data.notification_types)
          : notificationRes.data.notification_types;
        
        setNotificationSettings({
          ...notificationRes.data,
          notification_types: parsedNotificationTypes || {
            reminders: true,
            payments: true,
            system: true,
            security: true
          }
        });
      }

    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load company settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCompanyProfile = async () => {
    if (!companyProfile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('company_profile')
        .upsert({
          ...companyProfile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company profile updated successfully",
      });
    } catch (error) {
      console.error('Error saving company profile:', error);
      toast({
        title: "Error",
        description: "Failed to save company profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEmailSettings = async () => {
    if (!emailSettings) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('email_settings')
        .upsert({
          ...emailSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email settings updated successfully",
      });
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSMSSettings = async () => {
    if (!smsSettings) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('sms_settings')
        .upsert({
          ...smsSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "SMS settings updated successfully",
      });
    } catch (error) {
      console.error('Error saving SMS settings:', error);
      toast({
        title: "Error",
        description: "Failed to save SMS settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWhatsAppSettings = async () => {
    if (!whatsappSettings) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('whatsapp_settings')
        .upsert({
          ...whatsappSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "WhatsApp settings updated successfully",
      });
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error);
      toast({
        title: "Error",
        description: "Failed to save WhatsApp settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    if (!notificationSettings) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          ...notificationSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>Loading company settings...</p>
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
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Building2 className="mr-3 h-8 w-8 text-primary" />
              Company Settings
            </h1>
            <p className="text-muted-foreground">Manage your organization profile and integration settings</p>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Company</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>SMS</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Profile Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5 text-primary" />
                Company Profile
              </CardTitle>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {companyProfile && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name *</Label>
                      <Input
                        id="company_name"
                        value={companyProfile.company_name}
                        onChange={(e) => setCompanyProfile({...companyProfile, company_name: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={companyProfile.email || ''}
                        onChange={(e) => setCompanyProfile({...companyProfile, email: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={companyProfile.phone || ''}
                        onChange={(e) => setCompanyProfile({...companyProfile, phone: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={companyProfile.website || ''}
                        onChange={(e) => setCompanyProfile({...companyProfile, website: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={companyProfile.industry || ''}
                        onChange={(e) => setCompanyProfile({...companyProfile, industry: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employee_count">Employee Count</Label>
                      <Input
                        id="employee_count"
                        type="number"
                        value={companyProfile.employee_count || ''}
                        onChange={(e) => setCompanyProfile({...companyProfile, employee_count: parseInt(e.target.value) || undefined})}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Address Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address_line1">Address Line 1</Label>
                        <Input
                          id="address_line1"
                          value={companyProfile.address_line1 || ''}
                          onChange={(e) => setCompanyProfile({...companyProfile, address_line1: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address_line2">Address Line 2</Label>
                        <Input
                          id="address_line2"
                          value={companyProfile.address_line2 || ''}
                          onChange={(e) => setCompanyProfile({...companyProfile, address_line2: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={companyProfile.city || ''}
                          onChange={(e) => setCompanyProfile({...companyProfile, city: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          value={companyProfile.state || ''}
                          onChange={(e) => setCompanyProfile({...companyProfile, state: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postal_code">Postal Code</Label>
                        <Input
                          id="postal_code"
                          value={companyProfile.postal_code || ''}
                          onChange={(e) => setCompanyProfile({...companyProfile, postal_code: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={companyProfile.country || ''}
                          onChange={(e) => setCompanyProfile({...companyProfile, country: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      value={companyProfile.description || ''}
                      onChange={(e) => setCompanyProfile({...companyProfile, description: e.target.value})}
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveCompanyProfile} disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save Company Profile'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-blue-500" />
                Email Settings (SMTP/IMAP)
              </CardTitle>
              <CardDescription>
                Configure email server settings for sending and receiving emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {emailSettings && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={emailSettings.is_enabled}
                      onCheckedChange={(checked) => setEmailSettings({...emailSettings, is_enabled: checked})}
                    />
                    <Label>Enable Email Integration</Label>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">SMTP Settings (Outgoing Email)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtp_host">SMTP Host *</Label>
                        <Input
                          id="smtp_host"
                          value={emailSettings.smtp_host}
                          onChange={(e) => setEmailSettings({...emailSettings, smtp_host: e.target.value})}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="smtp_port">SMTP Port *</Label>
                        <Input
                          id="smtp_port"
                          type="number"
                          value={emailSettings.smtp_port}
                          onChange={(e) => setEmailSettings({...emailSettings, smtp_port: parseInt(e.target.value)})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtp_username">SMTP Username *</Label>
                        <Input
                          id="smtp_username"
                          value={emailSettings.smtp_username}
                          onChange={(e) => setEmailSettings({...emailSettings, smtp_username: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtp_password">SMTP Password *</Label>
                        <Input
                          id="smtp_password"
                          type="password"
                          value={emailSettings.smtp_password}
                          onChange={(e) => setEmailSettings({...emailSettings, smtp_password: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtp_from_email">From Email *</Label>
                        <Input
                          id="smtp_from_email"
                          type="email"
                          value={emailSettings.smtp_from_email}
                          onChange={(e) => setEmailSettings({...emailSettings, smtp_from_email: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtp_from_name">From Name *</Label>
                        <Input
                          id="smtp_from_name"
                          value={emailSettings.smtp_from_name}
                          onChange={(e) => setEmailSettings({...emailSettings, smtp_from_name: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtp_encryption">Encryption</Label>
                        <Select 
                          value={emailSettings.smtp_encryption} 
                          onValueChange={(value) => setEmailSettings({...emailSettings, smtp_encryption: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tls">TLS</SelectItem>
                            <SelectItem value="ssl">SSL</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveEmailSettings} disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save Email Settings'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Settings Tab */}
        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-green-500" />
                SMS Gateway Settings
              </CardTitle>
              <CardDescription>
                Configure SMS service provider for sending notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {smsSettings && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={smsSettings.is_enabled}
                      onCheckedChange={(checked) => setSmsSettings({...smsSettings, is_enabled: checked})}
                    />
                    <Label>Enable SMS Integration</Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sms_provider">SMS Provider</Label>
                      <Select 
                        value={smsSettings.provider} 
                        onValueChange={(value) => setSmsSettings({...smsSettings, provider: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="twilio">Twilio</SelectItem>
                          <SelectItem value="nexmo">Vonage (Nexmo)</SelectItem>
                          <SelectItem value="textlocal">TextLocal</SelectItem>
                          <SelectItem value="custom">Custom Provider</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sms_api_key">API Key *</Label>
                      <Input
                        id="sms_api_key"
                        type="password"
                        value={smsSettings.api_key}
                        onChange={(e) => setSmsSettings({...smsSettings, api_key: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sms_api_secret">API Secret</Label>
                      <Input
                        id="sms_api_secret"
                        type="password"
                        value={smsSettings.api_secret || ''}
                        onChange={(e) => setSmsSettings({...smsSettings, api_secret: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sender_id">Sender ID</Label>
                      <Input
                        id="sender_id"
                        value={smsSettings.sender_id || ''}
                        onChange={(e) => setSmsSettings({...smsSettings, sender_id: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveSMSSettings} disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save SMS Settings'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Settings Tab */}
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-green-600" />
                WhatsApp Business API
              </CardTitle>
              <CardDescription>
                Configure WhatsApp Business API for messaging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {whatsappSettings && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={whatsappSettings.is_enabled}
                      onCheckedChange={(checked) => setWhatsappSettings({...whatsappSettings, is_enabled: checked})}
                    />
                    <Label>Enable WhatsApp Integration</Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wa_provider">Provider</Label>
                      <Select 
                        value={whatsappSettings.provider} 
                        onValueChange={(value) => setWhatsappSettings({...whatsappSettings, provider: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="meta">Meta (Facebook)</SelectItem>
                          <SelectItem value="twilio">Twilio</SelectItem>
                          <SelectItem value="custom">Custom Provider</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number_id">Phone Number ID *</Label>
                      <Input
                        id="phone_number_id"
                        value={whatsappSettings.phone_number_id}
                        onChange={(e) => setWhatsappSettings({...whatsappSettings, phone_number_id: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="access_token">Access Token *</Label>
                      <Input
                        id="access_token"
                        type="password"
                        value={whatsappSettings.access_token}
                        onChange={(e) => setWhatsappSettings({...whatsappSettings, access_token: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_account_id">Business Account ID</Label>
                      <Input
                        id="business_account_id"
                        value={whatsappSettings.business_account_id || ''}
                        onChange={(e) => setWhatsappSettings({...whatsappSettings, business_account_id: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="webhook_verify_token">Webhook Verify Token</Label>
                      <Input
                        id="webhook_verify_token"
                        value={whatsappSettings.webhook_verify_token || ''}
                        onChange={(e) => setWhatsappSettings({...whatsappSettings, webhook_verify_token: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveWhatsAppSettings} disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save WhatsApp Settings'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-purple-500" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how and when to send notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {notificationSettings && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Channels</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={notificationSettings.email_notifications}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, email_notifications: checked})}
                        />
                        <Label>Email Notifications</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={notificationSettings.sms_notifications}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, sms_notifications: checked})}
                        />
                        <Label>SMS Notifications</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={notificationSettings.whatsapp_notifications}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, whatsapp_notifications: checked})}
                        />
                        <Label>WhatsApp Notifications</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={notificationSettings.push_notifications}
                          onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, push_notifications: checked})}
                        />
                        <Label>Push Notifications</Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Types</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={notificationSettings.notification_types.reminders}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings, 
                            notification_types: {...notificationSettings.notification_types, reminders: checked}
                          })}
                        />
                        <Label>Reminder Notifications</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={notificationSettings.notification_types.payments}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings, 
                            notification_types: {...notificationSettings.notification_types, payments: checked}
                          })}
                        />
                        <Label>Payment Notifications</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={notificationSettings.notification_types.system}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings, 
                            notification_types: {...notificationSettings.notification_types, system: checked}
                          })}
                        />
                        <Label>System Notifications</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={notificationSettings.notification_types.security}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings, 
                            notification_types: {...notificationSettings.notification_types, security: checked}
                          })}
                        />
                        <Label>Security Notifications</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotificationSettings} disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save Notification Settings'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}