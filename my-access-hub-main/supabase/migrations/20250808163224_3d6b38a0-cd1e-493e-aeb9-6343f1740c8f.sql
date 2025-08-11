-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active categories" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin and finance can manage categories" 
ON public.categories 
FOR ALL 
USING (can_manage_data(auth.uid()));

-- Insert existing categories
INSERT INTO public.categories (name, description, sort_order) VALUES
('VPS', 'Virtual Private Server hosting', 1),
('Domain', 'Domain name registration and management', 2),
('Hosting', 'Web hosting services', 3),
('SSL', 'SSL certificates and security', 4),
('AI Tool', 'Artificial Intelligence tools and services', 5),
('Cloud Storage', 'Cloud storage and backup services', 6),
('Software License', 'Software licenses and subscriptions', 7),
('Communication', 'Communication and collaboration tools', 8),
('Email/Marketing', 'Email and marketing platforms', 9),
('Other', 'Other services and tools', 10);

-- Add trigger for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update services table to reference categories table instead of enum
-- First, add the new category_id column
ALTER TABLE public.services ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Update existing services to reference the new categories
UPDATE public.services 
SET category_id = (
  SELECT id FROM public.categories 
  WHERE public.categories.name = public.services.category
);