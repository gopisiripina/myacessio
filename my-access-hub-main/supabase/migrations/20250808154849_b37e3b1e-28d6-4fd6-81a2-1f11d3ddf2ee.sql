-- Fix security warnings by setting search_path on functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.can_manage_data(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role IN ('admin', 'finance')
  )
$$;

CREATE OR REPLACE FUNCTION public.calculate_next_renewal_date(
  start_date DATE,
  billing_cycle billing_cycle,
  custom_cycle_days INTEGER DEFAULT NULL
)
RETURNS DATE
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  CASE billing_cycle
    WHEN 'Monthly' THEN
      RETURN start_date + INTERVAL '1 month';
    WHEN 'Quarterly' THEN
      RETURN start_date + INTERVAL '3 months';
    WHEN 'Semi-Annual' THEN
      RETURN start_date + INTERVAL '6 months';
    WHEN 'Annual' THEN
      RETURN start_date + INTERVAL '1 year';
    WHEN 'Custom_days' THEN
      IF custom_cycle_days IS NULL OR custom_cycle_days <= 0 THEN
        RAISE EXCEPTION 'custom_cycle_days must be provided and positive for Custom_days billing cycle';
      END IF;
      RETURN start_date + (custom_cycle_days || ' days')::INTERVAL;
    ELSE
      RAISE EXCEPTION 'Invalid billing cycle: %', billing_cycle;
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_service_renewal_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  service_record RECORD;
  new_renewal_date DATE;
BEGIN
  -- Get service details
  SELECT * INTO service_record FROM public.services WHERE id = NEW.service_id;
  
  -- Calculate new renewal date from payment date
  CASE service_record.billing_cycle
    WHEN 'Monthly' THEN
      new_renewal_date := NEW.payment_date + INTERVAL '1 month';
    WHEN 'Quarterly' THEN
      new_renewal_date := NEW.payment_date + INTERVAL '3 months';
    WHEN 'Semi-Annual' THEN
      new_renewal_date := NEW.payment_date + INTERVAL '6 months';
    WHEN 'Annual' THEN
      new_renewal_date := NEW.payment_date + INTERVAL '1 year';
    WHEN 'Custom_days' THEN
      new_renewal_date := NEW.payment_date + (service_record.custom_cycle_days || ' days')::INTERVAL;
  END CASE;
  
  -- Update service with new renewal date and set status to Active if it was Expired
  UPDATE public.services 
  SET 
    next_renewal_date = new_renewal_date,
    status = CASE 
      WHEN status = 'Expired' THEN 'Active'::service_status 
      ELSE status 
    END,
    updated_at = now()
  WHERE id = NEW.service_id;
  
  RETURN NEW;
END;
$$;