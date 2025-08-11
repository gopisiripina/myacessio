-- CLEAN START: drop policies if partially created (safe if not present)
DO $$ BEGIN
  PERFORM 1; -- placeholder
  -- storage policies
  BEGIN DROP POLICY "Asset files: select via attachments" ON storage.objects; EXCEPTION WHEN undefined_object THEN END; 
  BEGIN DROP POLICY "Asset files: insert" ON storage.objects; EXCEPTION WHEN undefined_object THEN END; 
  BEGIN DROP POLICY "Asset files: update" ON storage.objects; EXCEPTION WHEN undefined_object THEN END; 
  BEGIN DROP POLICY "Asset files: delete" ON storage.objects; EXCEPTION WHEN undefined_object THEN END; 
  -- org/asset policies
  BEGIN DROP POLICY "View orgs you belong to" ON public.organizations; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Admins update org" ON public.organizations; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "View org members" ON public.organization_members; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Admins manage members" ON public.organization_members; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: view categories" ON public.asset_categories; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: manage categories (admin/manager)" ON public.asset_categories; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: view locations" ON public.asset_locations; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: manage locations (admin/manager)" ON public.asset_locations; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: view vendors" ON public.asset_vendors; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: manage vendors (admin/manager)" ON public.asset_vendors; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: view assets" ON public.assets; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: manage assets (admin/manager)" ON public.assets; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: view purchase info" ON public.purchase_info; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: manage purchase info (admin/manager)" ON public.purchase_info; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: view warranty" ON public.warranty; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: manage warranty (admin/manager)" ON public.warranty; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: view depreciation" ON public.depreciation; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: manage depreciation (admin/manager)" ON public.depreciation; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: view depreciation log" ON public.depreciation_log; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: manage depreciation log (admin/manager)" ON public.depreciation_log; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: view repairs" ON public.repairs; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: manage repairs (admin/manager)" ON public.repairs; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: view transfers" ON public.transfers; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: manage transfers (admin/manager)" ON public.transfers; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: view audit log" ON public.audit_log; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: insert audit (admin/manager/auditor)" ON public.audit_log; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: update audit (admin/manager)" ON public.audit_log; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: delete audit (admin)" ON public.audit_log; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: view attachments" ON public.attachments; EXCEPTION WHEN undefined_object THEN END;
  BEGIN DROP POLICY "Asset: manage attachments (admin/manager)" ON public.attachments; EXCEPTION WHEN undefined_object THEN END;
END $$;

-- Enums
DO $$ BEGIN PERFORM 1 FROM pg_type WHERE typname = 'user_role'; IF NOT FOUND THEN CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'viewer', 'auditor'); END IF; END $$;
DO $$ BEGIN PERFORM 1 FROM pg_type WHERE typname = 'asset_condition'; IF NOT FOUND THEN CREATE TYPE public.asset_condition AS ENUM ('new', 'used', 'refurbished', 'damaged'); END IF; END $$;
DO $$ BEGIN PERFORM 1 FROM pg_type WHERE typname = 'asset_status'; IF NOT FOUND THEN CREATE TYPE public.asset_status AS ENUM ('in_use', 'in_storage', 'under_repair', 'transferred', 'scrapped', 'lost'); END IF; END $$;
DO $$ BEGIN PERFORM 1 FROM pg_type WHERE typname = 'depreciation_method'; IF NOT FOUND THEN CREATE TYPE public.depreciation_method AS ENUM ('straight_line', 'declining_balance', 'units_of_production'); END IF; END $$;
DO $$ BEGIN PERFORM 1 FROM pg_type WHERE typname = 'attachment_kind'; IF NOT FOUND THEN CREATE TYPE public.attachment_kind AS ENUM ('invoice', 'warranty', 'photo', 'other'); END IF; END $$;

-- Tables (order matters)
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.user_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  UNIQUE(org_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.asset_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.asset_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  location_name text NOT NULL,
  floor text,
  department text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.asset_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_info jsonb,
  location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_code text NOT NULL,
  name text NOT NULL,
  asset_category_id uuid REFERENCES public.asset_categories(id),
  sub_category text,
  description text,
  serial_number text,
  model_number text,
  condition public.asset_condition DEFAULT 'new',
  status public.asset_status DEFAULT 'in_use',
  assigned_to_user uuid,
  assigned_to_department text,
  location_id uuid REFERENCES public.asset_locations(id),
  purchase_cost numeric(14,2) DEFAULT 0,
  current_book_value numeric(14,2) DEFAULT 0,
  end_of_life date,
  qr_code_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  UNIQUE(org_id, asset_code)
);

CREATE TABLE IF NOT EXISTS public.warranty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL UNIQUE REFERENCES public.assets(id) ON DELETE CASCADE,
  warranty_period_months int,
  warranty_expiry date,
  under_warranty boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.depreciation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL UNIQUE REFERENCES public.assets(id) ON DELETE CASCADE,
  is_depreciable boolean DEFAULT true,
  method public.depreciation_method DEFAULT 'straight_line',
  rate_percent numeric(5,2),
  useful_life_years int,
  start_date date NOT NULL,
  salvage_value numeric(14,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.depreciation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  period date NOT NULL,
  amount numeric(14,2) NOT NULL,
  book_value_after numeric(14,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  UNIQUE(asset_id, period)
);

CREATE TABLE IF NOT EXISTS public.repairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  repair_date date NOT NULL,
  issue text,
  vendor text,
  cost numeric(14,2) DEFAULT 0,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  from_location_id uuid REFERENCES public.asset_locations(id),
  to_location_id uuid REFERENCES public.asset_locations(id),
  transfer_date date NOT NULL,
  reason text,
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  verified_on date NOT NULL,
  verified_by uuid NOT NULL,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  kind public.attachment_kind DEFAULT 'other',
  uploaded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz
);

-- purchase_info last (requires assets & asset_vendors)
CREATE TABLE IF NOT EXISTS public.purchase_info (
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

-- Trigger for total_cost
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON public.organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_categories_org_id ON public.asset_categories(org_id);
CREATE INDEX IF NOT EXISTS idx_asset_locations_org_id ON public.asset_locations(org_id);
CREATE INDEX IF NOT EXISTS idx_asset_vendors_org_id ON public.asset_vendors(org_id);
CREATE INDEX IF NOT EXISTS idx_assets_org_id ON public.assets(org_id);
CREATE INDEX IF NOT EXISTS idx_assets_org_status ON public.assets(org_id, status);
CREATE INDEX IF NOT EXISTS idx_assets_asset_code ON public.assets(asset_code);
CREATE INDEX IF NOT EXISTS idx_warranty_org_id ON public.warranty(org_id);
CREATE INDEX IF NOT EXISTS idx_warranty_org_expiry ON public.warranty(org_id, warranty_expiry);
CREATE INDEX IF NOT EXISTS idx_depreciation_org_id ON public.depreciation(org_id);
CREATE INDEX IF NOT EXISTS idx_depreciation_log_org_id ON public.depreciation_log(org_id);
CREATE INDEX IF NOT EXISTS idx_depreciation_log_org_period ON public.depreciation_log(org_id, period);
CREATE INDEX IF NOT EXISTS idx_repairs_org_id ON public.repairs(org_id);
CREATE INDEX IF NOT EXISTS idx_transfers_org_id ON public.transfers(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_org_id ON public.audit_log(org_id);
CREATE INDEX IF NOT EXISTS idx_attachments_org_id ON public.attachments(org_id);
CREATE INDEX IF NOT EXISTS idx_purchase_info_org_id ON public.purchase_info(org_id);

-- Helper
CREATE OR REPLACE FUNCTION public.is_org_member(org_uuid uuid, required_roles text[] DEFAULT ARRAY['admin','manager','viewer','auditor'])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.org_id = org_uuid AND m.user_id = auth.uid() AND m.role::text = ANY(required_roles) AND m.deleted_at IS NULL
  );
$$;

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depreciation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depreciation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "View orgs you belong to" ON public.organizations FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.organization_members m WHERE m.org_id = id AND m.user_id = auth.uid() AND m.deleted_at IS NULL)
);
CREATE POLICY "Admins update org" ON public.organizations FOR UPDATE TO authenticated USING (is_org_member(id, ARRAY['admin']));

CREATE POLICY "View org members" ON public.organization_members FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY "Admins manage members" ON public.organization_members FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin']));

CREATE POLICY "Asset: view categories" ON public.asset_categories FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Asset: manage categories (admin/manager)" ON public.asset_categories FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Asset: view locations" ON public.asset_locations FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Asset: manage locations (admin/manager)" ON public.asset_locations FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Asset: view vendors" ON public.asset_vendors FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Asset: manage vendors (admin/manager)" ON public.asset_vendors FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Asset: view assets" ON public.assets FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Asset: manage assets (admin/manager)" ON public.assets FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Asset: view purchase info" ON public.purchase_info FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Asset: manage purchase info (admin/manager)" ON public.purchase_info FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Asset: view warranty" ON public.warranty FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Asset: manage warranty (admin/manager)" ON public.warranty FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Asset: view depreciation" ON public.depreciation FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Asset: manage depreciation (admin/manager)" ON public.depreciation FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Asset: view depreciation log" ON public.depreciation_log FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Asset: manage depreciation log (admin/manager)" ON public.depreciation_log FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Asset: view repairs" ON public.repairs FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Asset: manage repairs (admin/manager)" ON public.repairs FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Asset: view transfers" ON public.transfers FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Asset: manage transfers (admin/manager)" ON public.transfers FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Asset: view audit log" ON public.audit_log FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Asset: insert audit (admin/manager/auditor)" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id, ARRAY['admin','manager','auditor']));
CREATE POLICY "Asset: update audit (admin/manager)" ON public.audit_log FOR UPDATE TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']));
CREATE POLICY "Asset: delete audit (admin)" ON public.audit_log FOR DELETE TO authenticated USING (is_org_member(org_id, ARRAY['admin']));

CREATE POLICY "Asset: view attachments" ON public.attachments FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Asset: manage attachments (admin/manager)" ON public.attachments FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']));

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers (ignore duplicates)
DO $$ BEGIN CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TRIGGER update_organization_members_updated_at BEFORE UPDATE ON public.organization_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TRIGGER update_asset_categories_updated_at BEFORE UPDATE ON public.asset_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TRIGGER update_asset_locations_updated_at BEFORE UPDATE ON public.asset_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TRIGGER update_asset_vendors_updated_at BEFORE UPDATE ON public.asset_vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TRIGGER update_purchase_info_updated_at BEFORE UPDATE ON public.purchase_info FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TRIGGER update_warranty_updated_at BEFORE UPDATE ON public.warranty FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TRIGGER update_depreciation_updated_at BEFORE UPDATE ON public.depreciation FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TRIGGER update_depreciation_log_updated_at BEFORE UPDATE ON public.depreciation_log FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON public.repairs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TRIGGER update_transfers_updated_at BEFORE UPDATE ON public.transfers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TRIGGER update_audit_log_updated_at BEFORE UPDATE ON public.audit_log FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TRIGGER update_attachments_updated_at BEFORE UPDATE ON public.attachments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN END $$;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('asset-files', 'asset-files', false) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Asset files: select via attachments" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'asset-files'
  AND EXISTS (
    SELECT 1 FROM public.attachments att
    WHERE att.file_path = storage.objects.name
      AND att.deleted_at IS NULL
      AND EXISTS (
        SELECT 1 FROM public.organization_members m
        WHERE m.org_id = att.org_id AND m.user_id = auth.uid() AND m.deleted_at IS NULL
      )
  )
);
CREATE POLICY "Asset files: insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'asset-files');
CREATE POLICY "Asset files: update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'asset-files');
CREATE POLICY "Asset files: delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'asset-files');