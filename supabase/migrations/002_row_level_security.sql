-- ============================================================================
-- BRIGHTPATH CRM - MIGRATION 002: ROW LEVEL SECURITY (RLS) & ACCESS CONTROL
-- Description: Enables RLS on all tables and creates zero-leakage security policies.
-- Aligned with: Section 11 & 12 of BrightPath CRM Master Build Prompt
-- ============================================================================

-- 1. Enable Row Level Security across all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 2. Helper function to check current user's role without recursive RLS deadlock
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(v_role, 'counsellor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper to check if current user is admin or manager
CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS boolean AS $$
BEGIN
  RETURN public.get_current_user_role() IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ----------------------------------------------------------------------------
-- POLICIES: profiles
-- ----------------------------------------------------------------------------

-- SELECT: Users can read their own profile; managers and admins can read all profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR public.is_manager_or_admin()
  );

-- UPDATE: Users can update their own full_name, but CANNOT self-promote their role
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id OR public.get_current_user_role() = 'admin'
  )
  WITH CHECK (
    -- If non-admin is updating, the role must remain unchanged
    (public.get_current_user_role() = 'admin') OR
    (role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()))
  );

-- INSERT: Handled via trigger or admin creation
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id OR public.get_current_user_role() = 'admin'
  );

-- ----------------------------------------------------------------------------
-- POLICIES: leads
-- ----------------------------------------------------------------------------

-- SELECT: Counsellor sees created/assigned leads; Managers/Admins see all
DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
CREATE POLICY "leads_select_policy"
  ON public.leads FOR SELECT
  USING (
    public.is_manager_or_admin() OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

-- INSERT: Authenticated users can create leads (auto-setting created_by)
DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
CREATE POLICY "leads_insert_policy"
  ON public.leads FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- UPDATE: Counsellor can update their assigned/created leads; Managers/Admins can update any
DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
CREATE POLICY "leads_update_policy"
  ON public.leads FOR UPDATE
  USING (
    public.is_manager_or_admin() OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  )
  WITH CHECK (
    public.is_manager_or_admin() OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

-- DELETE: Only Admins and Managers can delete leads (preserving data integrity)
DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;
CREATE POLICY "leads_delete_policy"
  ON public.leads FOR DELETE
  USING (
    public.is_manager_or_admin()
  );

-- ----------------------------------------------------------------------------
-- POLICIES: follow_ups
-- Follow-up access inherits permission from the associated lead
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "follow_ups_select_policy" ON public.follow_ups;
CREATE POLICY "follow_ups_select_policy"
  ON public.follow_ups FOR SELECT
  USING (
    public.is_manager_or_admin() OR
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = follow_ups.lead_id AND (
        l.assigned_to = auth.uid() OR
        l.created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "follow_ups_insert_policy" ON public.follow_ups;
CREATE POLICY "follow_ups_insert_policy"
  ON public.follow_ups FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "follow_ups_update_policy" ON public.follow_ups;
CREATE POLICY "follow_ups_update_policy"
  ON public.follow_ups FOR UPDATE
  USING (
    public.is_manager_or_admin() OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  )
  WITH CHECK (
    public.is_manager_or_admin() OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS "follow_ups_delete_policy" ON public.follow_ups;
CREATE POLICY "follow_ups_delete_policy"
  ON public.follow_ups FOR DELETE
  USING (
    public.is_manager_or_admin()
  );

-- ----------------------------------------------------------------------------
-- POLICIES: activities
-- Activity logs inherit permission from the associated lead; immutable (no UPDATE/DELETE)
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "activities_select_policy" ON public.activities;
CREATE POLICY "activities_select_policy"
  ON public.activities FOR SELECT
  USING (
    public.is_manager_or_admin() OR
    actor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = activities.lead_id AND (
        l.assigned_to = auth.uid() OR
        l.created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "activities_insert_policy" ON public.activities;
CREATE POLICY "activities_insert_policy"
  ON public.activities FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );
