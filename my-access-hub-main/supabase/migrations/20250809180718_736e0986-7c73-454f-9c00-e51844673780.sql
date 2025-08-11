-- Fix: remove generated column with subquery; use trigger instead
-- Re-create/ensure purchase_info table without generated column
DROP TABLE IF EXISTS public.purchase_info CASCADE;

CREATE TABLE public.purchase_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES public.asset_vendors(id),
  invoice_number text,
  invoice_date date,
  purchase_date date,
  purchase_location text,
  payment_method text,
  shipping_cost numeric(14,2) DEFAULT 0,
  customs_duty numeric(14,2) DEFAULT 0,
  total_cost numeric(14,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

-- Trigger to keep total_cost in sync
CREATE OR REPLACE FUNCTION public.set_purchase_total_cost()
RETURNS TRIGGER AS $$
DECLARE base_cost numeric(14,2);
BEGIN
  SELECT COALESCE(a.purchase_cost, 0) INTO base_cost FROM public.assets a WHERE a.id = NEW.asset_id;
  NEW.total_cost := COALESCE(base_cost,0) + COALESCE(NEW.shipping_cost,0) + COALESCE(NEW.customs_duty,0);
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_purchase_total_cost ON public.purchase_info;
CREATE TRIGGER trg_set_purchase_total_cost
BEFORE INSERT OR UPDATE ON public.purchase_info
FOR EACH ROW EXECUTE FUNCTION public.set_purchase_total_cost();

-- Ensure index & RLS/policies exist for purchase_info after recreation
CREATE INDEX IF NOT EXISTS idx_purchase_info_org_id ON public.purchase_info(org_id);
ALTER TABLE public.purchase_info ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  PERFORM 1 FROM pg_policies WHERE policyname = 'Asset: view purchase info' AND tablename='purchase_info';
  IF NOT FOUND THEN
    EXECUTE $$CREATE POLICY "Asset: view purchase info" ON public.purchase_info FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL)$$;
  END IF;
END $$;
DO $$ BEGIN
  PERFORM 1 FROM pg_policies WHERE policyname = 'Asset: manage purchase info (admin/manager)' AND tablename='purchase_info';
  IF NOT FOUND THEN
    EXECUTE $$CREATE POLICY "Asset: manage purchase info (admin/manager)" ON public.purchase_info FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']))$$;
  END IF;
END $$;