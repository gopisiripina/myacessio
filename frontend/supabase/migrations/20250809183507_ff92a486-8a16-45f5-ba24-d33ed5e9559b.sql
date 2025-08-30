-- Remove organization system from the database
-- First, drop the organization_members table
DROP TABLE IF EXISTS public.organization_members CASCADE;

-- Then drop the organizations table  
DROP TABLE IF EXISTS public.organizations CASCADE;

-- Drop the user_role enum that was used for organization roles
DROP TYPE IF EXISTS public.user_role CASCADE;

-- Remove the is_org_member function as it's no longer needed
DROP FUNCTION IF EXISTS public.is_org_member(uuid, text[]) CASCADE;