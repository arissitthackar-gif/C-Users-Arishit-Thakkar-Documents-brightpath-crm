-- ============================================================================
-- BRIGHTPATH CRM - MIGRATION 003: DEMO SEED DATA
-- Description: Idempotent fictional student enquiries and follow-ups for BrightPath Academy.
-- Aligned with: Section 13 & 20 of BrightPath CRM Master Build Prompt
-- ============================================================================

DO $$
DECLARE
  v_lead_1 uuid := 'a1000000-0000-0000-0000-000000000001';
  v_lead_2 uuid := 'a2000000-0000-0000-0000-000000000002';
  v_lead_3 uuid := 'a3000000-0000-0000-0000-000000000003';
  v_lead_4 uuid := 'a4000000-0000-0000-0000-000000000004';
  v_lead_5 uuid := 'a5000000-0000-0000-0000-000000000005';
BEGIN
  -- Insert Demo Student Leads (if not already present)
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

  -- Update lost_reason for the lost lead
  UPDATE public.leads 
  SET lost_reason = 'Location too far for offline classes'
  WHERE id = v_lead_5;

  -- Insert Demo Follow-ups (including overdue and upcoming)
  INSERT INTO public.follow_ups (id, lead_id, due_at, note, status, created_at)
  VALUES
    ('b1000000-0000-0000-0000-000000000001', v_lead_1, now() - interval '4 hours', 'Call back regarding fee discount structure (OVERDUE)', 'pending', now() - interval '1 day'),
    ('b2000000-0000-0000-0000-000000000002', v_lead_2, now() + interval '18 hours', 'Schedule demo lecture with Data Science faculty', 'pending', now() - interval '12 hours'),
    ('b3000000-0000-0000-0000-000000000003', v_lead_3, now() + interval '2 days', 'Follow up after syllabus brochure review', 'pending', now() - interval '1 day')
  ON CONFLICT (id) DO UPDATE SET
    due_at = EXCLUDED.due_at,
    note = EXCLUDED.note,
    status = EXCLUDED.status;

  -- Insert Demo Activity Logs
  INSERT INTO public.activities (id, lead_id, activity_type, description, created_at)
  VALUES
    ('c1000000-0000-0000-0000-000000000001', v_lead_1, 'created', 'Enquiry recorded for Aarav Shah (Full Stack Web Development).', now() - interval '2 hours'),
    ('c2000000-0000-0000-0000-000000000002', v_lead_2, 'followup_scheduled', 'Follow-up scheduled with Priya Patel regarding Data Science demo lecture.', now() - interval '1 day'),
    ('c3000000-0000-0000-0000-000000000003', v_lead_4, 'status_changed', 'Admission confirmed for Neha Desai (Python for Beginners).', now() - interval '3 days')
  ON CONFLICT (id) DO NOTHING;
END $$;
