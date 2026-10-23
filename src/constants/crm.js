/**
 * BrightPath CRM Constants and Master Enums
 * Aligned with BrightPath Academy CRM Master Build Prompt
 */

export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Converted',
  'Lost'
];

export const LEAD_SOURCES = [
  'Website',
  'Walk-in',
  'Phone Call',
  'Referral',
  'Social Media',
  'Other'
];

export const COURSES = [
  'Full Stack Web Development',
  'Data Science & AI',
  'Python for Beginners',
  'Cloud & DevOps',
  'Digital Marketing',
  'UI/UX Design'
];

export const USER_ROLES = ['admin', 'manager', 'counsellor'];

export const FOLLOW_UP_STATUSES = ['pending', 'completed', 'cancelled'];

export const INITIAL_DEMO_LEADS = [
  {
    id: 'demo-lead-1',
    full_name: 'Aarav Shah',
    phone: '+91 98765 43210',
    email: 'aarav.shah@example.com',
    course_interest: 'Full Stack Web Development',
    source: 'Website',
    status: 'New',
    assigned_to_name: 'Priya Sharma (Counsellor)',
    notes: 'Interested in evening weekend batch.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'demo-lead-2',
    full_name: 'Priya Patel',
    phone: '+91 98220 11223',
    email: 'priya.patel@example.com',
    course_interest: 'Data Science & AI',
    source: 'Walk-in',
    status: 'Qualified',
    assigned_to_name: 'Rohan Verma (Counsellor)',
    notes: 'B.Tech graduate looking for placement support.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'demo-lead-3',
    full_name: 'Rohan Mehta',
    phone: '+91 97110 99887',
    email: 'rohan.mehta@example.com',
    course_interest: 'Cloud & DevOps',
    source: 'Referral',
    status: 'Contacted',
    assigned_to_name: 'Priya Sharma (Counsellor)',
    notes: 'Working professional, requested syllabus brochure.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'demo-lead-4',
    full_name: 'Neha Desai',
    phone: '+91 99887 77665',
    email: 'neha.desai@example.com',
    course_interest: 'Python for Beginners',
    source: 'Social Media',
    status: 'Converted',
    assigned_to_name: 'Arishit Thakkar (Admin)',
    notes: 'Enrolled in upcoming Monday batch. Fee receipt generated.',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'demo-lead-5',
    full_name: 'Kabir Joshi',
    phone: '+91 91234 56789',
    email: 'kabir.joshi@example.com',
    course_interest: 'UI/UX Design',
    source: 'Phone Call',
    status: 'Lost',
    lost_reason: 'Location too far for offline classes',
    assigned_to_name: 'Rohan Verma (Counsellor)',
    notes: 'Prefers physical classroom coaching in South Delhi.',
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
  }
];

export const INITIAL_DEMO_FOLLOW_UPS = [
  {
    id: 'demo-fu-1',
    lead_id: 'demo-lead-1',
    lead_name: 'Aarav Shah',
    due_at: new Date(Date.now() - 3600000 * 4).toISOString(), // Overdue
    note: 'Call back regarding fee discount structure',
    status: 'pending',
    assigned_to_name: 'Priya Sharma'
  },
  {
    id: 'demo-fu-2',
    lead_id: 'demo-lead-2',
    lead_name: 'Priya Patel',
    due_at: new Date(Date.now() + 3600000 * 20).toISOString(), // Tomorrow
    note: 'Schedule demo lecture with Data Science faculty',
    status: 'pending',
    assigned_to_name: 'Rohan Verma'
  },
  {
    id: 'demo-fu-3',
    lead_id: 'demo-lead-3',
    lead_name: 'Rohan Mehta',
    due_at: new Date(Date.now() + 3600000 * 48).toISOString(),
    note: 'Follow up after syllabus review',
    status: 'pending',
    assigned_to_name: 'Priya Sharma'
  }
];
