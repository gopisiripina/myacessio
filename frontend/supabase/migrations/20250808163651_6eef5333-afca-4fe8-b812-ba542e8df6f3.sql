-- Make category_id column NOT NULL and drop the old category column
-- First, ensure all services have category_id set
UPDATE public.services 
SET category_id = (
  SELECT id FROM public.categories 
  WHERE public.categories.name = public.services.category::text
)
WHERE category_id IS NULL;

-- Now make category_id NOT NULL and set a default
ALTER TABLE public.services 
ALTER COLUMN category_id SET NOT NULL;

-- Add a default category_id (pointing to 'Other')
ALTER TABLE public.services 
ALTER COLUMN category_id SET DEFAULT (
  SELECT id FROM public.categories WHERE name = 'Other' LIMIT 1
);

-- Drop the old category column
ALTER TABLE public.services DROP COLUMN category;