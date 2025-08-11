-- 1) Create enum for day types (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'day_type') THEN
    CREATE TYPE public.day_type AS ENUM (
      'working_day',
      'weekday',
      'weekend',
      'holiday',
      'disaster',
      'event',
      'strike'
    );
  END IF;
END$$;

-- 2) Create table for company calendar assignments
CREATE TABLE IF NOT EXISTS public.company_calendar_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_date date NOT NULL,
  year integer GENERATED ALWAYS AS (EXTRACT(YEAR FROM calendar_date)::int) STORED,
  day_type public.day_type NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- 3) Constraints and indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'uniq_company_calendar_assignments_date'
  ) THEN
    ALTER TABLE public.company_calendar_assignments
      ADD CONSTRAINT uniq_company_calendar_assignments_date UNIQUE (calendar_date);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_company_calendar_year ON public.company_calendar_assignments(year);
CREATE INDEX IF NOT EXISTS idx_company_calendar_type ON public.company_calendar_assignments(day_type);

-- 4) RLS
ALTER TABLE public.company_calendar_assignments ENABLE ROW LEVEL SECURITY;

-- Select: anyone can view
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'company_calendar_assignments'
      AND policyname = 'Anyone can view company calendar'
  ) THEN
    CREATE POLICY "Anyone can view company calendar"
      ON public.company_calendar_assignments
      FOR SELECT
      USING (true);
  END IF;
END$$;

-- Insert: admin/finance can manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'company_calendar_assignments'
      AND policyname = 'Admins and finance can insert company calendar'
  ) THEN
    CREATE POLICY "Admins and finance can insert company calendar"
      ON public.company_calendar_assignments
      FOR INSERT
      WITH CHECK (can_manage_data(auth.uid()));
  END IF;
END$$;

-- Update: admin/finance can manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'company_calendar_assignments'
      AND policyname = 'Admins and finance can update company calendar'
  ) THEN
    CREATE POLICY "Admins and finance can update company calendar"
      ON public.company_calendar_assignments
      FOR UPDATE
      USING (can_manage_data(auth.uid()));
  END IF;
END$$;

-- Delete: admin/finance can manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'company_calendar_assignments'
      AND policyname = 'Admins and finance can delete company calendar'
  ) THEN
    CREATE POLICY "Admins and finance can delete company calendar"
      ON public.company_calendar_assignments
      FOR DELETE
      USING (can_manage_data(auth.uid()));
  END IF;
END$$;

-- 5) Trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_company_calendar_updated_at'
  ) THEN
    CREATE TRIGGER update_company_calendar_updated_at
      BEFORE UPDATE ON public.company_calendar_assignments
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;