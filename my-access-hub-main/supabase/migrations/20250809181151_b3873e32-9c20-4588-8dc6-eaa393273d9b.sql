-- Harden function with explicit search_path and security definer
CREATE OR REPLACE FUNCTION public.set_purchase_total_cost()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE base_cost numeric(14,2);
BEGIN
  SELECT COALESCE(a.purchase_cost, 0) INTO base_cost FROM public.assets a WHERE a.id = NEW.asset_id;
  NEW.total_cost := COALESCE(base_cost,0) + COALESCE(NEW.shipping_cost,0) + COALESCE(NEW.customs_duty,0);
  RETURN NEW;
END; $$;