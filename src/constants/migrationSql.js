/**
 * Consolidated SQL Migration text for in-app viewer and one-click copy tool.
 * Exact mirror of supabase/migrations/000_full_setup.sql
 */

export const CONSOLIDATED_MIGRATION_SQL = `-- BRIGHTPATH CRM - COMPLETE CONSOLIDATED MIGRATION
-- Run this in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. PROFILES TABLE (Linked 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'counsellor' CHECK (role IN ('admin', 'manager', 'counsellor')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'counsellor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- 3. LEADS TABLE
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  course_interest text NOT NULL,
  source text NOT NULL CHECK (source IN ('Website', 'Walk-in', 'Phone Call', 'Referral', 'Social Media', 'Other')),
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')),
  lost_reason text,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

DROP TRIGGER IF EXISTS trigger_leads_updated_at ON public.leads;
CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. FOLLOW-UPS TABLE
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_at timestamptz NOT NULL,
  note text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  completed_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 5. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  activity_type text NOT NULL,
  description text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_course ON public.leads(course_interest);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_followups_lead_id ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_followups_due_status ON public.follow_ups(due_at, status);
CREATE INDEX IF NOT EXISTS idx_followups_assigned_to ON public.follow_ups(assigned_to);

CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'counsellor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS boolean AS $$
BEGIN
  RETURN public.get_current_user_role() IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_manager_or_admin());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.get_current_user_role() = 'admin')
  WITH CHECK (
    (public.get_current_user_role() = 'admin') OR
    (role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()))
  );

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.get_current_user_role() = 'admin');

-- Leads Policies
DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
CREATE POLICY "leads_select_policy" ON public.leads FOR SELECT
  USING (
    public.is_manager_or_admin() OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
CREATE POLICY "leads_insert_policy" ON public.leads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
CREATE POLICY "leads_update_policy" ON public.leads FOR UPDATE
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

DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;
CREATE POLICY "leads_delete_policy" ON public.leads FOR DELETE
  USING (public.is_manager_or_admin());

-- Follow-ups Policies
DROP POLICY IF EXISTS "follow_ups_select_policy" ON public.follow_ups;
CREATE POLICY "follow_ups_select_policy" ON public.follow_ups FOR SELECT
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
CREATE POLICY "follow_ups_insert_policy" ON public.follow_ups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "follow_ups_update_policy" ON public.follow_ups;
CREATE POLICY "follow_ups_update_policy" ON public.follow_ups FOR UPDATE
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
CREATE POLICY "follow_ups_delete_policy" ON public.follow_ups FOR DELETE
  USING (public.is_manager_or_admin());

-- Activities Policies
DROP POLICY IF EXISTS "activities_select_policy" ON public.activities;
CREATE POLICY "activities_select_policy" ON public.activities FOR SELECT
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
CREATE POLICY "activities_insert_policy" ON public.activities FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 8. DEMO SEED DATA
DO $$
DECLARE
  v_lead_1 uuid := 'a1000000-0000-0000-0000-000000000001';
  v_lead_2 uuid := 'a2000000-0000-0000-0000-000000000002';
  v_lead_3 uuid := 'a3000000-0000-0000-0000-000000000003';
  v_lead_4 uuid := 'a4000000-0000-0000-0000-000000000004';
  v_lead_5 uuid := 'a5000000-0000-0000-0000-000000000005';
BEGIN
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, notes, created_at)
  VALUES 
    (v_lead_1, 'Aarav Shah', 'aarav.shah@example.com', '+91 98765 43210', 'Full Stack Web Development', 'Website', 'New', 'Interested in weekend batch. Requested syllabus brochure.', now() - interval '2 hours'),
    (v_lead_2, 'Priya Patel', 'priya.patel@example.com', '+91 98220 11223', 'Data Science & AI', 'Walk-in', 'Qualified', 'B.Tech graduate seeking placement assistance.', now() - interval '1 day'),
    (v_lead_3, 'Rohan Mehta', 'rohan.mehta@example.com', '+91 97110 99887', 'Cloud & DevOps', 'Referral', 'Contacted', 'Working IT professional, looking for AWS/GCP coaching.', now() - interval '2 days'),
    (v_lead_4, 'Neha Desai', 'neha.desai@example.com', '+91 99887 77665', 'Python for Beginners', 'Social Media', 'Converted', 'Enrolled in upcoming batch. Enrollment fee confirmed.', now() - interval '3 days'),
    (v_lead_5, 'Kabir Joshi', 'kabir.joshi@example.com', '+91 91234 56789', 'UI/UX Design', 'Phone Call', 'Lost', 'Prefers physical classroom coaching in South campus.', now() - interval '4 days')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    course_interest = EXCLUDED.course_interest,
    source = EXCLUDED.source,
    status = EXCLUDED.status,
    notes = EXCLUDED.notes;

  UPDATE public.leads 
  SET lost_reason = 'Location too far for offline classes'
  WHERE id = v_lead_5;

  INSERT INTO public.follow_ups (id, lead_id, due_at, note, status, created_at)
  VALUES
    ('b1000000-0000-0000-0000-000000000001', v_lead_1, now() - interval '4 hours', 'Call back regarding fee discount structure (OVERDUE)', 'pending', now() - interval '1 day'),
    ('b2000000-0000-0000-0000-000000000002', v_lead_2, now() + interval '18 hours', 'Schedule demo lecture with Data Science faculty', 'pending', now() - interval '12 hours'),
    ('b3000000-0000-0000-0000-000000000003', v_lead_3, now() + interval '2 days', 'Follow up after syllabus brochure review', 'pending', now() - interval '1 day')
  ON CONFLICT (id) DO UPDATE SET
    due_at = EXCLUDED.due_at,
    note = EXCLUDED.note,
    status = EXCLUDED.status;

  INSERT INTO public.activities (id, lead_id, activity_type, description, created_at)
  VALUES
    ('c1000000-0000-0000-0000-000000000001', v_lead_1, 'created', 'Enquiry recorded for Aarav Shah (Full Stack Web Development).', now() - interval '2 hours'),
    ('c2000000-0000-0000-0000-000000000002', v_lead_2, 'followup_scheduled', 'Follow-up scheduled with Priya Patel regarding Data Science demo lecture.', now() - interval '1 day'),
    ('c3000000-0000-0000-0000-000000000003', v_lead_4, 'status_changed', 'Admission confirmed for Neha Desai (Python for Beginners).', now() - interval '3 days')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- 9. VERIFICATION
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
`;
