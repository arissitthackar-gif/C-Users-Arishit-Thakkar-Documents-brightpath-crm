# BrightPath CRM — Master Implementation Plan & Context Tracker

> **Specification Reference:** `BrightPath_CRM_Full_Master_Build_Prompt.docx`  
> **Workflow Contract:** Each feature is taken one at a time through a strict 6-stage lifecycle:  
> **Develop ➔ Test Locally ➔ Verify ➔ Deploy to Vercel ➔ Test on Live URL ➔ Move to Next Feature**

---

## Architecture & Technology Stack

* **Frontend**: React 19 + Vite 8 (Vanilla CSS design system preserved from `src/App.css`)
* **Icons**: `lucide-react`
* **Database & Auth**: Supabase (PostgreSQL with Row Level Security + Supabase Auth)
* **Hosting & CI/CD**: GitHub + Vercel
* **Data Flow**: `React UI` ➔ `Service Layer (src/services)` ➔ `Supabase Client (src/lib)` ➔ `PostgreSQL (RLS policies)`

---

## Phase Status Tracker

| Phase # | Feature Scope | Status | Milestone Commit / Notes |
| :---: | :--- | :---: | :--- |
| **Phase 1** | **Core Tooling & Project Structure** | **COMPLETED** | Commit `bed360d`: `.gitignore` hardened, `@supabase/supabase-js` & `lucide-react` installed, modular layout built, 0 lint/build errors. |
| **Phase 2** | **Supabase Client & Config Guard** | **COMPLETED** | Implemented `src/lib/supabaseClient.js`, runtime env validator, non-crashing fallback, and live Supabase connection. |
| **Phase 3** | **Database Schema, Migrations & RLS** | **COMPLETED** | Created `supabase/migrations/` (`001_initial_schema.sql`, `002_row_level_security.sql`, `003_seed_demo_data.sql`, `000_full_setup.sql`) + In-App SQL Copy Utility in SettingsView. |
| **Phase 4** | **Authentication & User Profiles** | **COMPLETED** | Supabase Auth login/registration modal, session listener (`onAuthStateChange`), profile hydration from `public.profiles`, role handling. |
| **Phase 5** | **Lead Management (CRUD)** | *PENDING* | Education enquiry CRUD, multi-filters (Course, Status, Source), search, persistence. |
| **Phase 6** | **Follow-ups & Overdue Engine** | *PENDING* | Follow-up scheduler, overdue calculation (`due_at < now()`), mark completed. |
| **Phase 7** | **Activity History & Audit Trail** | *PENDING* | Immutable timeline of lead creations, status transitions, follow-up callbacks. |
| **Phase 8** | **Dashboard & Live Analytics** | *PENDING* | Permitted data scoping, real database KPI cards, conversion rate calculation. |
| **Phase 9** | **Reports & Academic Breakdown** | *PENDING* | Course demand breakdown, lead acquisition channels, CSV export. |
| **Phase 10** | **Mobile & Accessibility Polish** | *PENDING* | Responsive mobile drawer, accessible forms, keyboard navigation, toasts. |
| **Phase 11** | **Handover & Production Readiness** | *PENDING* | Complete README, verification matrix, final production handover. |

---

## Database Schema Specification

### 1. `profiles`
* `id` (`uuid, PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`)
* `full_name` (`text NOT NULL`)
* `role` (`text NOT NULL CHECK (role IN ('admin', 'manager', 'counsellor')) DEFAULT 'counsellor'`)
* `created_at`, `updated_at` (`timestamptz DEFAULT now()`)

### 2. `leads`
* `id` (`uuid PRIMARY KEY DEFAULT gen_random_uuid()`)
* `full_name` (`text NOT NULL`)
* `email` (`text NULL`)
* `phone` (`text NOT NULL`)
* `course_interest` (`text NOT NULL`)
* `source` (`text NOT NULL CHECK (source IN ('Website', 'Walk-in', 'Phone Call', 'Referral', 'Social Media', 'Other'))`)
* `status` (`text NOT NULL CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')) DEFAULT 'New'`)
* `lost_reason` (`text NULL`)
* `assigned_to` (`uuid REFERENCES profiles(id) ON DELETE SET NULL`)
* `created_by` (`uuid REFERENCES profiles(id) ON DELETE SET NULL`)
* `notes` (`text NULL`)
* `created_at`, `updated_at` (`timestamptz DEFAULT now()`)

### 3. `follow_ups`
* `id` (`uuid PRIMARY KEY DEFAULT gen_random_uuid()`)
* `lead_id` (`uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE`)
* `assigned_to` (`uuid REFERENCES profiles(id) ON DELETE SET NULL`)
* `due_at` (`timestamptz NOT NULL`)
* `note` (`text NOT NULL`)
* `status` (`text NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending'`)
* `completed_at` (`timestamptz NULL`)
* `created_by` (`uuid REFERENCES profiles(id) ON DELETE SET NULL`)
* `created_at` (`timestamptz DEFAULT now()`)

### 4. `activities`
* `id` (`uuid PRIMARY KEY DEFAULT gen_random_uuid()`)
* `lead_id` (`uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE`)
* `actor_id` (`uuid REFERENCES profiles(id) ON DELETE SET NULL`)
* `activity_type` (`text NOT NULL`)
* `description` (`text NOT NULL`)
* `metadata` (`jsonb NULL`)
* `created_at` (`timestamptz DEFAULT now()`)

---

## Detailed Ordered Phases & Criteria

### Phase 1: Environment Hardening & Core Structure (COMPLETED)
- **Delivered**: `.gitignore` hardened, `.env.example` created, dependencies installed, modular architecture created in `src/`.
- **Verified**: `npm run build` PASS, `npm run lint` PASS, `npm run dev` running at `http://localhost:5173/`.
- **Milestone Commit**: `bed360d`.

### Phase 2: Supabase Client & Configuration Guard
- **Scope**:
  - Implement `src/lib/supabaseClient.js`.
  - Validate presence of `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  - Provide a non-crashing setup banner explaining how to configure credentials if missing.
- **Verification**:
  - Run without `.env` ➔ banner displays gracefully.
  - Run with `.env` ➔ client initializes properly.
- **Milestone Commit & Deploy**: Commit and deploy to Vercel.

### Phase 3: Database Schema, Migrations & RLS
- **Scope**:
  - Create `supabase/migrations/001_initial_schema.sql` (tables, constraints, foreign keys, indexes).
  - Create `supabase/migrations/002_row_level_security.sql` (RLS policies for `counsellor`, `manager`, `admin`).
  - Create `supabase/migrations/003_seed_demo_data.sql` (sample student leads & follow-ups).
- **Verification**:
  - Apply SQL in Supabase SQL Editor.
  - Confirm all 4 tables exist and RLS badges are active.
- **Milestone Commit & Deploy**: Commit migrations and deploy.

### Phase 4: Authentication & User Profiles
- **Scope**:
  - Implement `AuthContext.jsx` with Supabase Auth listeners.
  - Create Sign In modal with email/password and friendly error feedback.
  - Load `profiles` table row matching `auth.uid()`.
  - Display user role in Sidebar and Topbar; implement Sign Out.
- **Verification**:
  - Sign in, test role assignment, verify session persistence across tab reload.
- **Milestone Commit & Deploy**: Commit and verify live login on Vercel.

### Phase 5: Lead Management Module (CRUD)
- **Scope**:
  - Create `src/services/leadsService.js` for Supabase queries.
  - Lead listing, search, filtering by Course, Status, Source.
  - Lead creation/edit form with phone and email validation.
  - Status progression; require `lost_reason` when marking a lead as `Lost`.
- **Verification**:
  - Create, search, filter, edit lead. Verify persistence on page refresh.
- **Milestone Commit & Deploy**: Commit and test CRUD operations on live URL.

### Phase 6: Follow-up Engine & Overdue Reminders
- **Scope**:
  - Create `src/services/followUpsService.js`.
  - Follow-up scheduling modal (due date/time, note, counsellor assignment).
  - Dynamic overdue calculation: `due_at < now() AND status = 'pending'`.
  - One-click completion marking `status = 'completed'` and setting `completed_at`.
- **Verification**:
  - Create past-due follow-up ➔ confirms Overdue banner and badge.
  - Mark completed ➔ status updates to completed and removed from overdue.
- **Milestone Commit & Deploy**: Commit and test live follow-up lifecycle.

### Phase 7: Activity History & Audit Trail
- **Scope**:
  - Create `src/services/activitiesService.js`.
  - Automatic event logging on: lead creation, status updates, follow-up scheduling/completion.
  - Chronological timeline rendered inside lead details view.
- **Verification**:
  - Perform actions on a lead and verify timeline logs actions with actor and timestamp.
- **Milestone Commit & Deploy**: Commit and verify live timeline.

### Phase 8: Dashboard & Live Analytics
- **Scope**:
  - Replace demo counts with real aggregated database queries scoped by RLS.
  - Metrics: Total Enquiries, New Enquiries, Converted Enquiries, Overdue Follow-ups, Conversion Rate %.
  - Admissions Funnel breakdown and Recent Enquiries widget.
- **Verification**:
  - Reconcile KPI numbers against Lead list table rows.
- **Milestone Commit & Deploy**: Commit and verify live dashboard reconciliation.

### Phase 9: Reports & Academic Enquiry Analytics
- **Scope**:
  - Enquiries by Course Interest (bar breakdown).
  - Enquiries by Source Channel.
  - Filterable by date range.
  - Export filtered enquiries to CSV.
- **Verification**:
  - Filter reports, verify counts, test CSV export download.
- **Milestone Commit & Deploy**: Commit and verify live reports.

### Phase 10: Mobile & Accessibility Polish
- **Scope**:
  - Responsive mobile drawer for sidebar.
  - Keyboard navigation and accessible `<label>` associations.
  - Non-blocking toast alerts for network events.
- **Verification**:
  - Test on 375px mobile emulator and verify keyboard navigation.
- **Milestone Commit & Deploy**: Commit and test live on mobile device.

### Phase 11: Production Verification & Comprehensive Handover
- **Scope**:
  - Full end-to-end user journey test matrix (Static, Auth, Leads, Follow-ups, RLS).
  - Comprehensive `README.md` with architecture, local setup, migrations, and limitations.
- **Verification**:
  - `npm run build` and `npm run lint` clean; complete walkthrough on live Vercel URL.
- **Milestone Commit & Deploy**: Final production sign-off.
