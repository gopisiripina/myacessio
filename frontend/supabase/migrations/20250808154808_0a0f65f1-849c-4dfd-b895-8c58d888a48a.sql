-- Create enum types
CREATE TYPE public.service_category AS ENUM ('VPS', 'Domain', 'Hosting', 'SSL', 'AI Tool', 'Cloud Storage', 'Software License', 'Communication', 'Email/Marketing', 'Other');

CREATE TYPE public.billing_cycle AS ENUM ('Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'Custom_days');

CREATE TYPE public.currency AS ENUM ('INR', 'USD', 'EUR');

CREATE TYPE public.payment_method AS ENUM ('Card', 'UPI', 'NetBanking', 'Bank Transfer', 'PayPal', 'Other');

CREATE TYPE public.service_status AS ENUM ('Active', 'Paused', 'Cancelled', 'Expired');

CREATE TYPE public.importance_level AS ENUM ('Critical', 'Normal', 'Nice-to-have');

CREATE TYPE public.app_role AS ENUM ('admin', 'finance', 'viewer');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  support_email TEXT,
  support_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  category service_category NOT NULL,
  provider TEXT NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id),
  plan_name TEXT,
  account_email TEXT,
  dashboard_url TEXT,
  start_date DATE NOT NULL,
  billing_cycle billing_cycle NOT NULL,
  custom_cycle_days INTEGER,
  amount DECIMAL(10,2) NOT NULL,
  currency currency NOT NULL DEFAULT 'USD',
  payment_method payment_method,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  next_renewal_date DATE,
  reminder_days_before INTEGER NOT NULL DEFAULT 7,
  status service_status NOT NULL DEFAULT 'Active',
  importance importance_level NOT NULL DEFAULT 'Normal',
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency currency NOT NULL,
  paid_by TEXT,
  invoice_number TEXT,
  invoice_file_url TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin or finance
CREATE OR REPLACE FUNCTION public.can_manage_data(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role IN ('admin', 'finance')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for vendors
CREATE POLICY "Anyone can view vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Admin and finance can manage vendors" ON public.vendors FOR ALL USING (public.can_manage_data(auth.uid()));

-- RLS Policies for services
CREATE POLICY "Users can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admin and finance can manage services" ON public.services FOR INSERT WITH CHECK (public.can_manage_data(auth.uid()));
CREATE POLICY "Admin and finance can update services" ON public.services FOR UPDATE USING (public.can_manage_data(auth.uid()));
CREATE POLICY "Admin can delete services" ON public.services FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for payments
CREATE POLICY "Users can view payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Admin and finance can manage payments" ON public.payments FOR INSERT WITH CHECK (public.can_manage_data(auth.uid()));
CREATE POLICY "Admin and finance can update payments" ON public.payments FOR UPDATE USING (public.can_manage_data(auth.uid()));
CREATE POLICY "Admin can delete payments" ON public.payments FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', 'User'),
    NEW.email,
    'viewer'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate next renewal date
CREATE OR REPLACE FUNCTION public.calculate_next_renewal_date(
  start_date DATE,
  billing_cycle billing_cycle,
  custom_cycle_days INTEGER DEFAULT NULL
)
RETURNS DATE
LANGUAGE plpgsql
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

-- Function to update next renewal date when payment is added
CREATE OR REPLACE FUNCTION public.update_service_renewal_date()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Trigger to update renewal date when payment is added
CREATE TRIGGER update_renewal_date_on_payment
  AFTER INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_service_renewal_date();