import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types for all settings
export interface CompanyProfile {
  id?: string;
  company_name: string;
  description?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  registration_number?: string;
  tax_id?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  employee_count?: number;
  founded_year?: number;
  company_logo_url?: string;
  currency?: string;
  timezone?: string;
}

export interface EmailSettings {
  id?: string;
  is_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: 'tls' | 'ssl' | 'none';
  smtp_from_email: string;
  smtp_from_name: string;
  imap_host?: string;
  imap_port?: number;
  imap_username?: string;
  imap_password?: string;
  imap_encryption?: 'ssl' | 'tls' | 'none';
}

export interface SmsSettings {
  id?: string;
  is_enabled: boolean;
  provider: string;
  api_key: string;
  api_secret?: string;
  sender_id?: string;
  base_url?: string;
  webhook_url?: string;
}

export interface WhatsAppSettings {
  id?: string;
  is_enabled: boolean;
  provider: string;
  phone_number_id: string;
  access_token: string;
  business_account_id?: string;
  webhook_url?: string;
  webhook_verify_token?: string;
}

export interface NotificationSettings {
  id?: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  push_notifications: boolean;
  notification_types: {
    system: boolean;
    payments: boolean;
    security: boolean;
    reminders: boolean;
  };
}

export const useCompanySettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Company Profile
  const {
    data: companyProfile,
    isLoading: isLoadingCompany,
    error: companyError
  } = useQuery({
    queryKey: ['company-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_profile')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  // Email Settings
  const {
    data: emailSettings,
    isLoading: isLoadingEmail,
    error: emailError
  } = useQuery({
    queryKey: ['email-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  // SMS Settings
  const {
    data: smsSettings,
    isLoading: isLoadingSms,
    error: smsError
  } = useQuery({
    queryKey: ['sms-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  // WhatsApp Settings
  const {
    data: whatsappSettings,
    isLoading: isLoadingWhatsApp,
    error: whatsappError
  } = useQuery({
    queryKey: ['whatsapp-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  // Notification Settings
  const {
    data: notificationSettings,
    isLoading: isLoadingNotifications,
    error: notificationsError
  } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  // Update Company Profile
  const updateCompanyProfile = useMutation({
    mutationFn: async (data: CompanyProfile) => {
      const { error } = await supabase
        .from('company_profile')
        .upsert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      toast({
        title: "Success",
        description: "Company profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update company profile: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update Email Settings
  const updateEmailSettings = useMutation({
    mutationFn: async (data: EmailSettings) => {
      const { error } = await supabase
        .from('email_settings')
        .upsert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-settings'] });
      toast({
        title: "Success",
        description: "Email settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update email settings: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update SMS Settings
  const updateSmsSettings = useMutation({
    mutationFn: async (data: SmsSettings) => {
      const { error } = await supabase
        .from('sms_settings')
        .upsert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-settings'] });
      toast({
        title: "Success",
        description: "SMS settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update SMS settings: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update WhatsApp Settings
  const updateWhatsAppSettings = useMutation({
    mutationFn: async (data: WhatsAppSettings) => {
      const { error } = await supabase
        .from('whatsapp_settings')
        .upsert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-settings'] });
      toast({
        title: "Success",
        description: "WhatsApp settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update WhatsApp settings: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update Notification Settings
  const updateNotificationSettings = useMutation({
    mutationFn: async (data: NotificationSettings) => {
      const { error } = await supabase
        .from('notification_settings')
        .upsert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update notification settings: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Test Email Configuration
  const testEmailConfiguration = useMutation({
    mutationFn: async (settings: EmailSettings) => {
      const { data, error } = await supabase.functions.invoke('test-email-config', {
        body: settings
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email configuration test successful",
      });
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: `Email configuration test failed: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Test SMS Configuration
  const testSmsConfiguration = useMutation({
    mutationFn: async (settings: SmsSettings) => {
      const { data, error } = await supabase.functions.invoke('test-sms-config', {
        body: settings
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SMS configuration test successful",
      });
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: `SMS configuration test failed: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Test WhatsApp Configuration
  const testWhatsAppConfiguration = useMutation({
    mutationFn: async (settings: WhatsAppSettings) => {
      const { data, error } = await supabase.functions.invoke('test-whatsapp-config', {
        body: settings
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "WhatsApp configuration test successful",
      });
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: `WhatsApp configuration test failed: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const isLoading = isLoadingCompany || isLoadingEmail || isLoadingSms || isLoadingWhatsApp || isLoadingNotifications;
  const errors = [companyError, emailError, smsError, whatsappError, notificationsError].filter(Boolean);

  return {
    // Data
    companyProfile,
    emailSettings,
    smsSettings,
    whatsappSettings,
    notificationSettings,
    
    // Loading states
    isLoading,
    isLoadingCompany,
    isLoadingEmail,
    isLoadingSms,
    isLoadingWhatsApp,
    isLoadingNotifications,
    
    // Errors
    errors,
    
    // Mutations
    updateCompanyProfile,
    updateEmailSettings,
    updateSmsSettings,
    updateWhatsAppSettings,
    updateNotificationSettings,
    
    // Test functions
    testEmailConfiguration,
    testSmsConfiguration,
    testWhatsAppConfiguration,
    
    // Loading states for mutations
    isUpdatingCompany: updateCompanyProfile.isPending,
    isUpdatingEmail: updateEmailSettings.isPending,
    isUpdatingSms: updateSmsSettings.isPending,
    isUpdatingWhatsApp: updateWhatsAppSettings.isPending,
    isUpdatingNotifications: updateNotificationSettings.isPending,
    isTestingEmail: testEmailConfiguration.isPending,
    isTestingSms: testSmsConfiguration.isPending,
    isTestingWhatsApp: testWhatsAppConfiguration.isPending,
  };
};