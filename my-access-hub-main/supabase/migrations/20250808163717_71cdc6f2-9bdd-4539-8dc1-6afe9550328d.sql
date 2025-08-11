-- First, get the 'Other' category ID to use as default
SELECT id FROM public.categories WHERE name = 'Other' LIMIT 1;