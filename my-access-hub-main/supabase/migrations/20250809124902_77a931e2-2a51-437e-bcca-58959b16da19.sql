-- Add optional next_renewal_amount to services for specifying upcoming renewal amount
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS next_renewal_amount numeric;