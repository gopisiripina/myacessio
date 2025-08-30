-- Add exchange_rate column to services table for tracking exchange rates at time of entry
ALTER TABLE public.services ADD COLUMN exchange_rate NUMERIC DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.services.exchange_rate IS 'Exchange rate to USD at the time of service creation/update for non-USD currencies';