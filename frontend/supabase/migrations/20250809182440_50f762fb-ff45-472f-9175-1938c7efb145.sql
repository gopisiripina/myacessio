-- Allow authenticated users to create organizations they own
CREATE POLICY IF NOT EXISTS "Users can create organizations"
ON public.organizations
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- Allow the creator to seed first admin membership for a new org
CREATE POLICY IF NOT EXISTS "Seed first org admin"
ON public.organization_members
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'admin'::public.user_role
  AND NOT EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.org_id = organization_members.org_id AND m.deleted_at IS NULL
  )
);
