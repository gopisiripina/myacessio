-- Create a singleton system settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id TEXT PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  application_name TEXT NOT NULL DEFAULT 'SubsTracker',
  default_currency TEXT NOT NULL DEFAULT 'INR',
  default_reminder_days INTEGER NOT NULL DEFAULT 7,
  session_timeout_hours INTEGER NOT NULL DEFAULT 24,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  -- Anyone can read settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'system_settings' AND policyname = 'Anyone can read system settings'
  ) THEN
    CREATE POLICY "Anyone can read system settings"
    ON public.system_settings
    FOR SELECT
    USING (true);
  END IF;

  -- Admins can insert settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'system_settings' AND policyname = 'Admins can insert system settings'
  ) THEN
    CREATE POLICY "Admins can insert system settings"
    ON public.system_settings
    FOR INSERT
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;

  -- Admins can update settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'system_settings' AND policyname = 'Admins can update system settings'
  ) THEN
    CREATE POLICY "Admins can update system settings"
    ON public.system_settings
    FOR UPDATE
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- Timestamp trigger
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed singleton row
INSERT INTO public.system_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;