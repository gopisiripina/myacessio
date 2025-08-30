-- Fix the RLS policy for viewing organizations
-- The current policy has an incorrect condition that references m.id instead of organizations.id
DROP POLICY IF EXISTS "View orgs you belong to" ON public.organizations;

CREATE POLICY "View orgs you belong to" 
ON public.organizations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM organization_members m
  WHERE m.org_id = organizations.id AND m.user_id = auth.uid() AND m.deleted_at IS NULL
));