-- Revert the application name back to be more generic
UPDATE public.system_settings 
SET 
  application_name = 'Business Manager',
  updated_at = now()
WHERE id = 'default';

-- Create subscription-specific settings table
CREATE TABLE public.subscription_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  default_reminder_days INTEGER NOT NULL DEFAULT 7,
  default_currency currency NOT NULL DEFAULT 'USD',
  auto_renewal_warning_days INTEGER NOT NULL DEFAULT 30,
  late_payment_grace_days INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create asset-specific settings table  
CREATE TABLE public.asset_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  default_depreciation_method depreciation_method NOT NULL DEFAULT 'straight_line',
  default_useful_life_years INTEGER NOT NULL DEFAULT 5,
  default_salvage_value_percent NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  depreciation_calculation_frequency TEXT NOT NULL DEFAULT 'monthly',
  asset_audit_reminder_days INTEGER NOT NULL DEFAULT 90,
  maintenance_reminder_days INTEGER NOT NULL DEFAULT 180,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.subscription_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription settings (admin only)
CREATE POLICY "Admins can manage subscription settings" ON public.subscription_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read subscription settings" ON public.subscription_settings
FOR SELECT
USING (true);

-- Create policies for asset settings (admin only)
CREATE POLICY "Admins can manage asset settings" ON public.asset_settings  
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read asset settings" ON public.asset_settings
FOR SELECT
USING (true);

-- Insert default settings for both modules
INSERT INTO public.subscription_settings (
  default_reminder_days,
  default_currency,
  auto_renewal_warning_days,
  late_payment_grace_days
) VALUES (7, 'USD', 30, 5);

INSERT INTO public.asset_settings (
  default_depreciation_method,
  default_useful_life_years,
  default_salvage_value_percent,
  depreciation_calculation_frequency,
  asset_audit_reminder_days,
  maintenance_reminder_days
) VALUES ('straight_line', 5, 10.00, 'monthly', 90, 180);