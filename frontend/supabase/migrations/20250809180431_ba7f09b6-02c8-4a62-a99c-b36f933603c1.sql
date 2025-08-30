-- Safe create enum helper
DO $$ BEGIN PERFORM 1 FROM pg_type WHERE typname = 'user_role'; IF NOT FOUND THEN CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'viewer', 'auditor'); END IF; END $$;
DO $$ BEGIN PERFORM 1 FROM pg_type WHERE typname = 'asset_condition'; IF NOT FOUND THEN CREATE TYPE public.asset_condition AS ENUM ('new', 'used', 'refurbished', 'damaged'); END IF; END $$;
DO $$ BEGIN PERFORM 1 FROM pg_type WHERE typname = 'asset_status'; IF NOT FOUND THEN CREATE TYPE public.asset_status AS ENUM ('in_use', 'in_storage', 'under_repair', 'transferred', 'scrapped', 'lost'); END IF; END $$;
DO $$ BEGIN PERFORM 1 FROM pg_type WHERE typname = 'depreciation_method'; IF NOT FOUND THEN CREATE TYPE public.depreciation_method AS ENUM ('straight_line', 'declining_balance', 'units_of_production'); END IF; END $$;
DO $$ BEGIN PERFORM 1 FROM pg_type WHERE typname = 'attachment_kind'; IF NOT FOUND THEN CREATE TYPE public.attachment_kind AS ENUM ('invoice', 'warranty', 'photo', 'other'); END IF; END $$;

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Organization members
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  UNIQUE(org_id, user_id)
);

-- Asset-specific reference tables (avoid conflict with existing app tables)
CREATE TABLE IF NOT EXISTS public.asset_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE IF NOT EXISTS public.asset_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  floor TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE IF NOT EXISTS public.asset_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_info JSONB,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Assets core
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_code TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_category_id UUID REFERENCES public.asset_categories(id),
  sub_category TEXT,
  description TEXT,
  serial_number TEXT,
  model_number TEXT,
  condition public.asset_condition DEFAULT 'new',
  status public.asset_status DEFAULT 'in_use',
  assigned_to_user UUID NULL,
  assigned_to_department TEXT NULL,
  location_id UUID REFERENCES public.asset_locations(id),
  purchase_cost NUMERIC(14,2) DEFAULT 0,
  current_book_value NUMERIC(14,2) DEFAULT 0,
  end_of_life DATE NULL,
  qr_code_url TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  UNIQUE(org_id, asset_code)
);

-- Purchase info
CREATE TABLE IF NOT EXISTS public.purchase_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.asset_vendors(id),
  invoice_number TEXT,
  invoice_date DATE,
  purchase_date DATE,
  purchase_location TEXT,
  payment_method TEXT,
  shipping_cost NUMERIC(14,2) DEFAULT 0,
  customs_duty NUMERIC(14,2) DEFAULT 0,
  total_cost NUMERIC(14,2) GENERATED ALWAYS AS (
    COALESCE((SELECT purchase_cost FROM public.assets WHERE id = asset_id), 0) +
    COALESCE(shipping_cost, 0) +
    COALESCE(customs_duty, 0)
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Warranty
CREATE TABLE IF NOT EXISTS public.warranty (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL UNIQUE REFERENCES public.assets(id) ON DELETE CASCADE,
  warranty_period_months INTEGER,
  warranty_expiry DATE,
  under_warranty BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Depreciation setup
CREATE TABLE IF NOT EXISTS public.depreciation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL UNIQUE REFERENCES public.assets(id) ON DELETE CASCADE,
  is_depreciable BOOLEAN DEFAULT true,
  method public.depreciation_method DEFAULT 'straight_line',
  rate_percent NUMERIC(5,2) NULL,
  useful_life_years INTEGER NULL,
  start_date DATE NOT NULL,
  salvage_value NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE IF NOT EXISTS public.depreciation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  period DATE NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  book_value_after NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  UNIQUE(asset_id, period)
);

-- Repairs, Transfers, Audit, Attachments
CREATE TABLE IF NOT EXISTS public.repairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  repair_date DATE NOT NULL,
  issue TEXT,
  vendor TEXT,
  cost NUMERIC(14,2) DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE IF NOT EXISTS public.transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  from_location_id UUID REFERENCES public.asset_locations(id),
  to_location_id UUID REFERENCES public.asset_locations(id),
  transfer_date DATE NOT NULL,
  reason TEXT,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  verified_on DATE NOT NULL,
  verified_by UUID NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  kind public.attachment_kind DEFAULT 'other',
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

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
CREATE INDEX IF NOT EXISTS idx_purchase_info_org_id ON public.purchase_info(org_id);
CREATE INDEX IF NOT EXISTS idx_warranty_org_id ON public.warranty(org_id);
CREATE INDEX IF NOT EXISTS idx_warranty_org_expiry ON public.warranty(org_id, warranty_expiry);
CREATE INDEX IF NOT EXISTS idx_depreciation_org_id ON public.depreciation(org_id);
CREATE INDEX IF NOT EXISTS idx_depreciation_log_org_id ON public.depreciation_log(org_id);
CREATE INDEX IF NOT EXISTS idx_depreciation_log_org_period ON public.depreciation_log(org_id, period);
CREATE INDEX IF NOT EXISTS idx_repairs_org_id ON public.repairs(org_id);
CREATE INDEX IF NOT EXISTS idx_transfers_org_id ON public.transfers(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_org_id ON public.audit_log(org_id);
CREATE INDEX IF NOT EXISTS idx_attachments_org_id ON public.attachments(org_id);

-- Membership helper
CREATE OR REPLACE FUNCTION public.is_org_member(org_uuid UUID, required_roles TEXT[] DEFAULT ARRAY['admin','manager','viewer','auditor'])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members m
    WHERE m.org_id = org_uuid
      AND m.user_id = auth.uid()
      AND m.role::TEXT = ANY(required_roles)
      AND m.deleted_at IS NULL
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

-- RLS policies
CREATE POLICY IF NOT EXISTS "View orgs you belong to" ON public.organizations FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.organization_members m WHERE m.org_id = id AND m.user_id = auth.uid() AND m.deleted_at IS NULL)
);
CREATE POLICY IF NOT EXISTS "Admins update org" ON public.organizations FOR UPDATE TO authenticated USING (is_org_member(id, ARRAY['admin']));

CREATE POLICY IF NOT EXISTS "View org members" ON public.organization_members FOR SELECT TO authenticated USING (is_org_member(org_id));
CREATE POLICY IF NOT EXISTS "Admins manage members" ON public.organization_members FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin']));

-- Generic asset-module policies
DO $$ BEGIN
  -- asset_categories
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: view categories" ON public.asset_categories FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL)$$;
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: manage categories (admin/manager)" ON public.asset_categories FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']))$$;
  -- asset_locations
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: view locations" ON public.asset_locations FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL)$$;
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: manage locations (admin/manager)" ON public.asset_locations FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']))$$;
  -- asset_vendors
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: view vendors" ON public.asset_vendors FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL)$$;
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: manage vendors (admin/manager)" ON public.asset_vendors FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']))$$;
  -- assets
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: view assets" ON public.assets FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL)$$;
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: manage assets (admin/manager)" ON public.assets FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']))$$;
  -- purchase_info
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: view purchase info" ON public.purchase_info FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL)$$;
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: manage purchase info (admin/manager)" ON public.purchase_info FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']))$$;
  -- warranty
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: view warranty" ON public.warranty FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL)$$;
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: manage warranty (admin/manager)" ON public.warranty FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']))$$;
  -- depreciation
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: view depreciation" ON public.depreciation FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL)$$;
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: manage depreciation (admin/manager)" ON public.depreciation FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']))$$;
  -- depreciation_log
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: view depreciation log" ON public.depreciation_log FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL)$$;
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: manage depreciation log (admin/manager)" ON public.depreciation_log FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']))$$;
  -- repairs
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: view repairs" ON public.repairs FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL)$$;
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: manage repairs (admin/manager)" ON public.repairs FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']))$$;
  -- transfers
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: view transfers" ON public.transfers FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL)$$;
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: manage transfers (admin/manager)" ON public.transfers FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']))$$;
  -- audit_log
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: view audit log" ON public.audit_log FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL)$$;
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: insert audit (admin/manager/auditor)" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (is_org_member(org_id, ARRAY['admin','manager','auditor']))$$;
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: update audit (admin/manager)" ON public.audit_log FOR UPDATE TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']))$$;
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: delete audit (admin)" ON public.audit_log FOR DELETE TO authenticated USING (is_org_member(org_id, ARRAY['admin']))$$;
  -- attachments
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: view attachments" ON public.attachments FOR SELECT TO authenticated USING (is_org_member(org_id) AND deleted_at IS NULL)$$;
  EXECUTE $$CREATE POLICY IF NOT EXISTS "Asset: manage attachments (admin/manager)" ON public.attachments FOR ALL TO authenticated USING (is_org_member(org_id, ARRAY['admin','manager']))$$;
END $$;

-- updated_at trigger (re-use or create)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach triggers
DO $$ BEGIN
  PERFORM 1; -- dummy
  CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN END $$;
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
INSERT INTO storage.buckets (id, name, public)
VALUES ('asset-files', 'asset-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for objects using attachments mapping (no foldername indexing)
-- Allow read if there is an attachment row for the object name and user is member of that org
CREATE POLICY IF NOT EXISTS "Asset files: select via attachments" ON storage.objects
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

-- Allow insert/update/delete in bucket to authenticated (app enforces exact path & creates attachments row)
CREATE POLICY IF NOT EXISTS "Asset files: insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'asset-files');

CREATE POLICY IF NOT EXISTS "Asset files: update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'asset-files');

CREATE POLICY IF NOT EXISTS "Asset files: delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'asset-files');