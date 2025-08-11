-- Asset and Depreciation Module Database Schema

-- Create enums for asset module
CREATE TYPE public.asset_condition AS ENUM ('new', 'used', 'refurbished', 'damaged');
CREATE TYPE public.asset_status AS ENUM ('in_use', 'available', 'maintenance', 'disposed', 'lost');
CREATE TYPE public.attachment_kind AS ENUM ('invoice', 'warranty', 'manual', 'photo', 'other');
CREATE TYPE public.depreciation_method AS ENUM ('straight_line', 'declining_balance', 'sum_of_years');

-- Asset Categories
CREATE TABLE public.asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Asset Locations
CREATE TABLE public.asset_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name TEXT NOT NULL,
  department TEXT,
  floor TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Asset Vendors
CREATE TABLE public.asset_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_info JSONB,
  location TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Main Assets Table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  asset_category_id UUID REFERENCES asset_categories(id),
  condition asset_condition DEFAULT 'new',
  status asset_status DEFAULT 'available',
  assigned_to_user UUID,
  assigned_to_department TEXT,
  location_id UUID REFERENCES asset_locations(id),
  purchase_cost NUMERIC(14,2) DEFAULT 0,
  current_book_value NUMERIC(14,2) DEFAULT 0,
  model_number TEXT,
  serial_number TEXT,
  sub_category TEXT,
  qr_code_url TEXT,
  end_of_life DATE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Asset Attachments
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  file_path TEXT NOT NULL,
  kind attachment_kind DEFAULT 'other',
  uploaded_by UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Depreciation Settings
CREATE TABLE public.depreciation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  method depreciation_method DEFAULT 'straight_line',
  is_depreciable BOOLEAN DEFAULT true,
  useful_life_years INTEGER,
  rate_percent NUMERIC(5,2),
  salvage_value NUMERIC(14,2) DEFAULT 0,
  start_date DATE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Depreciation Log
CREATE TABLE public.depreciation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  period DATE NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  book_value_after NUMERIC(14,2) NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Purchase Information
CREATE TABLE public.purchase_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  vendor_id UUID REFERENCES asset_vendors(id),
  purchase_date DATE,
  invoice_date DATE,
  invoice_number TEXT,
  total_cost NUMERIC(14,2),
  shipping_cost NUMERIC(14,2) DEFAULT 0,
  customs_duty NUMERIC(14,2) DEFAULT 0,
  purchase_location TEXT,
  payment_method TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Asset Repairs
CREATE TABLE public.repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  repair_date DATE NOT NULL,
  issue TEXT,
  cost NUMERIC(14,2) DEFAULT 0,
  vendor TEXT,
  remarks TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Asset Transfers
CREATE TABLE public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  from_location_id UUID REFERENCES asset_locations(id),
  to_location_id UUID REFERENCES asset_locations(id),
  transfer_date DATE NOT NULL,
  reason TEXT,
  approved_by UUID,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Warranty Information
CREATE TABLE public.warranty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  under_warranty BOOLEAN DEFAULT false,
  warranty_period_months INTEGER,
  warranty_expiry DATE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Audit Log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  verified_by UUID NOT NULL,
  verified_on DATE NOT NULL,
  remarks TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE depreciation ENABLE ROW LEVEL SECURITY;
ALTER TABLE depreciation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Asset Categories
CREATE POLICY "Users can manage their asset categories"
ON asset_categories FOR ALL
USING (user_id = auth.uid());

-- Asset Locations
CREATE POLICY "Users can manage their asset locations"
ON asset_locations FOR ALL
USING (user_id = auth.uid());

-- Asset Vendors
CREATE POLICY "Users can manage their asset vendors"
ON asset_vendors FOR ALL
USING (user_id = auth.uid());

-- Assets
CREATE POLICY "Users can manage their assets"
ON assets FOR ALL
USING (user_id = auth.uid());

-- Attachments
CREATE POLICY "Users can manage their asset attachments"
ON attachments FOR ALL
USING (user_id = auth.uid());

-- Depreciation
CREATE POLICY "Users can manage their asset depreciation"
ON depreciation FOR ALL
USING (user_id = auth.uid());

-- Depreciation Log
CREATE POLICY "Users can manage their depreciation log"
ON depreciation_log FOR ALL
USING (user_id = auth.uid());

-- Purchase Info
CREATE POLICY "Users can manage their purchase info"
ON purchase_info FOR ALL
USING (user_id = auth.uid());

-- Repairs
CREATE POLICY "Users can manage their asset repairs"
ON repairs FOR ALL
USING (user_id = auth.uid());

-- Transfers
CREATE POLICY "Users can manage their asset transfers"
ON transfers FOR ALL
USING (user_id = auth.uid());

-- Warranty
CREATE POLICY "Users can manage their asset warranty"
ON warranty FOR ALL
USING (user_id = auth.uid());

-- Audit Log
CREATE POLICY "Users can manage their audit log"
ON audit_log FOR ALL
USING (user_id = auth.uid());