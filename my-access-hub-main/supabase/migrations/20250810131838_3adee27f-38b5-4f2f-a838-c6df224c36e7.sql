-- Update system settings to be more asset-focused
UPDATE public.system_settings 
SET 
  application_name = 'AssetTracker',
  updated_at = now()
WHERE id = 'default';

-- If no record exists, insert default settings
INSERT INTO public.system_settings (
  id,
  application_name,
  default_currency,
  default_reminder_days,
  session_timeout_hours
) 
SELECT 
  'default',
  'AssetTracker',
  'USD',
  30,
  24
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings WHERE id = 'default');