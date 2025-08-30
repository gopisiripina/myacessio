-- Remove all asset and depreciation related tables
-- Drop tables that reference assets first (due to foreign key constraints)
DROP TABLE IF EXISTS public.attachments CASCADE;
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.depreciation CASCADE;
DROP TABLE IF EXISTS public.depreciation_log CASCADE;
DROP TABLE IF EXISTS public.purchase_info CASCADE;
DROP TABLE IF EXISTS public.repairs CASCADE;
DROP TABLE IF EXISTS public.transfers CASCADE;
DROP TABLE IF EXISTS public.warranty CASCADE;

-- Drop the main assets table
DROP TABLE IF EXISTS public.assets CASCADE;

-- Drop asset-related lookup tables
DROP TABLE IF EXISTS public.asset_categories CASCADE;
DROP TABLE IF EXISTS public.asset_locations CASCADE;
DROP TABLE IF EXISTS public.asset_vendors CASCADE;

-- Drop asset-related custom types/enums
DROP TYPE IF EXISTS public.asset_condition CASCADE;
DROP TYPE IF EXISTS public.asset_status CASCADE;
DROP TYPE IF EXISTS public.attachment_kind CASCADE;
DROP TYPE IF EXISTS public.depreciation_method CASCADE;