-- Create enum types
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'viewer', 'auditor');
CREATE TYPE public.asset_condition AS ENUM ('new', 'used', 'refurbished', 'damaged');
CREATE TYPE public.asset_status AS ENUM ('in_use', 'in_storage', 'under_repair', 'transferred', 'scrapped', 'lost');
CREATE TYPE public.depreciation_method AS ENUM ('straight_line', 'declining_balance', 'units_of_production');
CREATE TYPE public.attachment_kind AS ENUM ('invoice', 'warranty', 'photo', 'other');

-- Organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Organization members table
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  UNIQUE(org_id, user_id)
);

-- Categories table
CREATE TABLE public.categories (
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

-- Locations table
CREATE TABLE public.locations (
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

-- Vendors table
CREATE TABLE public.vendors (
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

-- Assets table
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_code TEXT NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  sub_category TEXT,
  description TEXT,
  serial_number TEXT,
  model_number TEXT,
  condition asset_condition DEFAULT 'new',
  status asset_status DEFAULT 'in_use',
  assigned_to_user UUID NULL,
  assigned_to_department TEXT NULL,
  location_id UUID REFERENCES public.locations(id),
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

-- Purchase info table
CREATE TABLE public.purchase_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id),
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

-- Warranty table
CREATE TABLE public.warranty (
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

-- Depreciation table
CREATE TABLE public.depreciation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL UNIQUE REFERENCES public.assets(id) ON DELETE CASCADE,
  is_depreciable BOOLEAN DEFAULT true,
  method depreciation_method DEFAULT 'straight_line',
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

-- Depreciation log table
CREATE TABLE public.depreciation_log (
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

-- Repairs table
CREATE TABLE public.repairs (
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

-- Transfers table
CREATE TABLE public.transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  from_location_id UUID REFERENCES public.locations(id),
  to_location_id UUID REFERENCES public.locations(id),
  transfer_date DATE NOT NULL,
  reason TEXT,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Audit log table
CREATE TABLE public.audit_log (
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

-- Attachments table
CREATE TABLE public.attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  kind attachment_kind DEFAULT 'other',
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create indexes for performance
CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_organization_members_org_id ON public.organization_members(org_id);
CREATE INDEX idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_categories_org_id ON public.categories(org_id);
CREATE INDEX idx_locations_org_id ON public.locations(org_id);
CREATE INDEX idx_vendors_org_id ON public.vendors(org_id);
CREATE INDEX idx_assets_org_id ON public.assets(org_id);
CREATE INDEX idx_assets_org_status ON public.assets(org_id, status);
CREATE INDEX idx_assets_asset_code ON public.assets(asset_code);
CREATE INDEX idx_purchase_info_org_id ON public.purchase_info(org_id);
CREATE INDEX idx_warranty_org_id ON public.warranty(org_id);
CREATE INDEX idx_warranty_org_expiry ON public.warranty(org_id, warranty_expiry);
CREATE INDEX idx_depreciation_org_id ON public.depreciation(org_id);
CREATE INDEX idx_depreciation_log_org_id ON public.depreciation_log(org_id);
CREATE INDEX idx_depreciation_log_org_period ON public.depreciation_log(org_id, period);
CREATE INDEX idx_repairs_org_id ON public.repairs(org_id);
CREATE INDEX idx_transfers_org_id ON public.transfers(org_id);
CREATE INDEX idx_audit_log_org_id ON public.audit_log(org_id);
CREATE INDEX idx_attachments_org_id ON public.attachments(org_id);

-- Create function to check organization membership
CREATE OR REPLACE FUNCTION public.is_org_member(org_uuid UUID, required_roles TEXT[] DEFAULT ARRAY['admin','manager','viewer','auditor'])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE org_id = org_uuid
      AND user_id = auth.uid()
      AND role::TEXT = ANY(required_roles)
      AND deleted_at IS NULL
  )
$$;

-- Create function to get user's current organization
CREATE OR REPLACE FUNCTION public.get_user_current_org()
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
    AND deleted_at IS NULL
  ORDER BY created_at ASC
  LIMIT 1
$$;

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depreciation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depreciation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view organizations they're members of"
ON public.organizations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE org_id = id AND user_id = auth.uid() AND deleted_at IS NULL
  )
);

CREATE POLICY "Organization admins can update organizations"
ON public.organizations FOR UPDATE
TO authenticated
USING (is_org_member(id, ARRAY['admin']));

-- RLS Policies for organization_members
CREATE POLICY "Users can view organization members for their orgs"
ON public.organization_members FOR SELECT
TO authenticated
USING (is_org_member(org_id));

CREATE POLICY "Organization admins can manage members"
ON public.organization_members FOR ALL
TO authenticated
USING (is_org_member(org_id, ARRAY['admin']));

-- Generic RLS policies for all other tables
CREATE POLICY "Users can view data in their organizations"
ON public.categories FOR SELECT
TO authenticated
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "Admins and managers can manage categories"
ON public.categories FOR ALL
TO authenticated
USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Users can view locations in their organizations"
ON public.locations FOR SELECT
TO authenticated
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "Admins and managers can manage locations"
ON public.locations FOR ALL
TO authenticated
USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Users can view vendors in their organizations"
ON public.vendors FOR SELECT
TO authenticated
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "Admins and managers can manage vendors"
ON public.vendors FOR ALL
TO authenticated
USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Users can view assets in their organizations"
ON public.assets FOR SELECT
TO authenticated
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "Admins and managers can manage assets"
ON public.assets FOR ALL
TO authenticated
USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Users can view purchase info in their organizations"
ON public.purchase_info FOR SELECT
TO authenticated
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "Admins and managers can manage purchase info"
ON public.purchase_info FOR ALL
TO authenticated
USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Users can view warranty in their organizations"
ON public.warranty FOR SELECT
TO authenticated
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "Admins and managers can manage warranty"
ON public.warranty FOR ALL
TO authenticated
USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Users can view depreciation in their organizations"
ON public.depreciation FOR SELECT
TO authenticated
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "Admins and managers can manage depreciation"
ON public.depreciation FOR ALL
TO authenticated
USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Users can view depreciation log in their organizations"
ON public.depreciation_log FOR SELECT
TO authenticated
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "Admins and managers can manage depreciation log"
ON public.depreciation_log FOR ALL
TO authenticated
USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Users can view repairs in their organizations"
ON public.repairs FOR SELECT
TO authenticated
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "Admins and managers can manage repairs"
ON public.repairs FOR ALL
TO authenticated
USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Users can view transfers in their organizations"
ON public.transfers FOR SELECT
TO authenticated
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "Admins and managers can manage transfers"
ON public.transfers FOR ALL
TO authenticated
USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Users can view audit log in their organizations"
ON public.audit_log FOR SELECT
TO authenticated
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "Admins, managers and auditors can create audit entries"
ON public.audit_log FOR INSERT
TO authenticated
WITH CHECK (is_org_member(org_id, ARRAY['admin','manager','auditor']));

CREATE POLICY "Admins and managers can manage audit log"
ON public.audit_log FOR UPDATE
TO authenticated
USING (is_org_member(org_id, ARRAY['admin','manager']));

CREATE POLICY "Admins can delete audit log"
ON public.audit_log FOR DELETE
TO authenticated
USING (is_org_member(org_id, ARRAY['admin']));

CREATE POLICY "Users can view attachments in their organizations"
ON public.attachments FOR SELECT
TO authenticated
USING (is_org_member(org_id) AND deleted_at IS NULL);

CREATE POLICY "Admins and managers can manage attachments"
ON public.attachments FOR ALL
TO authenticated
USING (is_org_member(org_id, ARRAY['admin','manager']));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_info_updated_at
  BEFORE UPDATE ON public.purchase_info
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_warranty_updated_at
  BEFORE UPDATE ON public.warranty
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_depreciation_updated_at
  BEFORE UPDATE ON public.depreciation
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_depreciation_log_updated_at
  BEFORE UPDATE ON public.depreciation_log
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_repairs_updated_at
  BEFORE UPDATE ON public.repairs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transfers_updated_at
  BEFORE UPDATE ON public.transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audit_log_updated_at
  BEFORE UPDATE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attachments_updated_at
  BEFORE UPDATE ON public.attachments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for asset files
INSERT INTO storage.buckets (id, name, public) VALUES ('asset-files', 'asset-files', false);

-- Storage policies for asset files
CREATE POLICY "Users can view files in their organization"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'asset-files' AND EXISTS (
  SELECT 1 FROM public.assets a
  JOIN public.attachments att ON a.id = att.asset_id
  WHERE storage.foldername(name)[1] = CONCAT('org_', a.org_id::text)
    AND is_org_member(a.org_id)
));

CREATE POLICY "Admins and managers can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'asset-files');

CREATE POLICY "Admins and managers can update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'asset-files');

CREATE POLICY "Admins can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'asset-files');

-- Insert seed categories
INSERT INTO public.categories (org_id, name, description, created_by) VALUES
((SELECT id FROM public.organizations LIMIT 1), 'Appliances', 'Home and office appliances', NULL),
((SELECT id FROM public.organizations LIMIT 1), 'Equipment', 'Various types of equipment', NULL),
((SELECT id FROM public.organizations LIMIT 1), 'Hardware & Networking', 'IT hardware and networking equipment', NULL),
((SELECT id FROM public.organizations LIMIT 1), 'Infrastructure', 'Infrastructure related assets', NULL),
((SELECT id FROM public.organizations LIMIT 1), 'Machines', 'Industrial and office machines', NULL),
((SELECT id FROM public.organizations LIMIT 1), 'Raw Materials', 'Raw materials for production', NULL),
((SELECT id FROM public.organizations LIMIT 1), 'Measuring Instruments', 'Precision measuring tools', NULL),
((SELECT id FROM public.organizations LIMIT 1), 'Test Instruments', 'Testing and measurement equipment', NULL),
((SELECT id FROM public.organizations LIMIT 1), 'Hand Tools', 'Manual tools and equipment', NULL),
((SELECT id FROM public.organizations LIMIT 1), 'Power Tools', 'Electric and battery powered tools', NULL),
((SELECT id FROM public.organizations LIMIT 1), 'Inventory', 'Stock and inventory items', NULL),
((SELECT id FROM public.organizations LIMIT 1), 'Consumables/Spares/Accessories', 'Consumable items and spare parts', NULL),
((SELECT id FROM public.organizations LIMIT 1), 'Miscellaneous', 'Other uncategorized items', NULL);