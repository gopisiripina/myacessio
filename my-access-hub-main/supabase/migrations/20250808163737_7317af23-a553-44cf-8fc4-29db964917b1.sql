-- Ensure all services have category_id set
UPDATE public.services 
SET category_id = (
  SELECT id FROM public.categories 
  WHERE public.categories.name = public.services.category::text
)
WHERE category_id IS NULL;

-- Make category_id NOT NULL
ALTER TABLE public.services 
ALTER COLUMN category_id SET NOT NULL;

-- Set default to the 'Other' category
ALTER TABLE public.services 
ALTER COLUMN category_id SET DEFAULT '39904b37-b9ff-4a5f-af6f-88cb1169f6ab';

-- Drop the old category column
ALTER TABLE public.services DROP COLUMN category;