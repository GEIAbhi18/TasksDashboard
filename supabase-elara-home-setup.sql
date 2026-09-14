-- ==========================================================
-- ELARA HOME: DEDICATED TABLES & TWO-WAY SYNC SETUP
-- ==========================================================
-- Run this entire script in your Supabase SQL Editor.
-- It creates 3 dedicated tables isolated for Elara Home:
--   1. public.elara_projects (6 department test projects)
--   2. public.elara_users    (team members with WhatsApp phone numbers)
--   3. public.elara_tasks    (two-way synced tasks with TaskFlow dashboard)
--
-- Features:
-- - Zero dependencies on legacy Postgres enums (role & status are plain text)
-- - Zero foreign key conflicts with auth.users
-- - 100% idempotent (safe to run multiple times without duplicate errors)
-- - Permissive Row-Level Security (RLS) policies for full two-way dashboard sync
-- - Grants SELECT, INSERT, UPDATE, DELETE permissions to anon & authenticated
-- - Realtime enabled so updates in dashboard reflect instantly in Supabase and vice versa

BEGIN;

-- ==========================================================
-- 1. DEDICATED ELARA HOME PROJECTS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.elara_projects (
    id text PRIMARY KEY,
    name text NOT NULL,
    department text NOT NULL,
    description text,
    color text,
    status text NOT NULL DEFAULT 'Active',
    team_name text NOT NULL DEFAULT 'Elara Home',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- 2. DEDICATED ELARA HOME USERS TABLE (WITH WHATSAPP NUMBERS)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.elara_users (
    id text PRIMARY KEY,
    name text NOT NULL,
    email text,
    role text NOT NULL,
    department text,
    team text NOT NULL DEFAULT 'Elara Home',
    phone text,
    avatar text,
    created_at timestamptz NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- 3. DEDICATED ELARA HOME TASKS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.elara_tasks (
    id text PRIMARY KEY DEFAULT ('task-' || substr(md5(random()::text), 1, 12)),
    project_id text NOT NULL,
    title text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'delay', 'blocker', 'completed'
    priority text NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
    progress integer NOT NULL DEFAULT 0,
    assigned_users text[] DEFAULT '{}',
    due_date timestamptz,
    is_blocked boolean NOT NULL DEFAULT false,
    blocker_reason text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Helpful performance indexes
CREATE INDEX IF NOT EXISTS idx_elara_tasks_project ON public.elara_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_elara_tasks_status ON public.elara_tasks(status);

-- ==========================================================
-- 4. TABLE PERMISSIONS & ROW LEVEL SECURITY (RLS)
-- ==========================================================
-- Grant table privileges to standard Supabase roles
GRANT ALL ON TABLE public.elara_projects TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.elara_users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.elara_tasks TO anon, authenticated, service_role;

-- Enable Row Level Security
ALTER TABLE public.elara_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elara_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elara_tasks ENABLE ROW LEVEL SECURITY;

-- Permissive policies for bidirectional sync
DROP POLICY IF EXISTS "Allow all access to elara_projects" ON public.elara_projects;
CREATE POLICY "Allow all access to elara_projects" ON public.elara_projects
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to elara_users" ON public.elara_users;
CREATE POLICY "Allow all access to elara_users" ON public.elara_users
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to elara_tasks" ON public.elara_tasks;
CREATE POLICY "Allow all access to elara_tasks" ON public.elara_tasks
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==========================================================
-- 5. SEED ELARA HOME PROJECTS (1 TEST PROJECT PER DEPARTMENT)
-- ==========================================================
INSERT INTO public.elara_projects (id, name, department, description, color, status, team_name)
VALUES
    (
        'elara-sales-crm',
        'Elara Home – Sales & CRM Test Project',
        'Sales & CRM',
        'Leads, follow-ups, site visits, bookings, payment milestones, documentation.',
        '#3b82f6',
        'Active',
        'Elara Home'
    ),
    (
        'elara-construction-design',
        'Elara Home – Construction & Design Test Project',
        'Construction & Design',
        'Site execution, drawings, consultant decisions, contractor actions, quality and safety issues.',
        '#10b981',
        'Active',
        'Elara Home'
    ),
    (
        'elara-approvals-compliance',
        'Elara Home – Approvals & Compliance Test Project',
        'Approvals & Compliance',
        'TCP/RERA matters, government approvals, licences, statutory submissions and renewals.',
        '#8b5cf6',
        'Active',
        'Elara Home'
    ),
    (
        'elara-finance-procurement',
        'Elara Home – Finance & Procurement Test Project',
        'Finance & Procurement',
        'Budgets, purchase orders, vendor payments, quotations, billing and cost approvals.',
        '#f59e0b',
        'Active',
        'Elara Home'
    ),
    (
        'elara-marketing-cx',
        'Elara Home – Marketing & Customer Experience Test Project',
        'Marketing & Customer Experience',
        'Campaigns, brochures, events, website updates, buyer communication and handover preparation.',
        '#ec4899',
        'Active',
        'Elara Home'
    ),
    (
        'elara-project-admin',
        'Elara Home – Project Administration Test Project',
        'Project Administration',
        'Hiring, manpower, meetings, reporting, travel, office/site requirements and general coordination.',
        '#06b6d4',
        'Active',
        'Elara Home'
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    department = EXCLUDED.department,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    status = EXCLUDED.status,
    team_name = EXCLUDED.team_name,
    updated_at = NOW();

-- ==========================================================
-- 6. SEED ELARA HOME USERS (WITH WHATSAPP COMMUNICATION NUMBERS)
-- ==========================================================
INSERT INTO public.elara_users (id, name, email, role, department, team, phone)
VALUES
    (
        '1e4a4d9e-ced8-48f0-afd3-494478f05131',
        'Kanav',
        'kanav@goodearthinfra.com',
        'Director',
        'Sales & CRM',
        'Elara Home',
        NULL
    ),
    (
        'e1a00001-0000-4000-8000-000000000002',
        'Rachit',
        'rachit@goodearthinfra.com',
        'Team Member',
        'Construction & Design',
        'Elara Home',
        '919867272041'
    ),
    (
        'e1a00001-0000-4000-8000-000000000003',
        'Bhirmala',
        'bhirmala@goodearthinfra.com',
        'Team Member',
        'Approvals & Compliance',
        'Elara Home',
        '918894577707'
    ),
    (
        'e1a00001-0000-4000-8000-000000000004',
        'Bhagwan Dass',
        'bhagwandass@goodearthinfra.com',
        'Team Member',
        'Finance & Procurement',
        'Elara Home',
        '919816641892'
    ),
    (
        'user-developer',
        'Developer',
        'developer@goodearthinfra.com',
        'Developer',
        'Project Administration',
        'Elara Home',
        NULL
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    team = EXCLUDED.team,
    phone = EXCLUDED.phone;

-- ==========================================================
-- 7. SEED DUMMY TASKS (ACROSS ALL 5 STATUSES)
-- ==========================================================
INSERT INTO public.elara_tasks (
    id, project_id, title, description, status, priority, progress,
    assigned_users, due_date, is_blocked, blocker_reason, created_at
)
VALUES
    -- 1. Sales & CRM
    ('task-sales-1', 'elara-sales-crm', 'Add sample lead', 'Capture inquiry from prospective home buyer for Phase 1.', 'pending', 'medium', 0, ARRAY['Kanav', 'Rachit'], NOW() + INTERVAL '4 days', false, NULL, NOW() - INTERVAL '3 days'),
    ('task-sales-2', 'elara-sales-crm', 'Schedule sample site visit', 'Coordinate site tour for registered client this weekend.', 'in_progress', 'high', 50, ARRAY['Rachit'], NOW() + INTERVAL '2 days', false, NULL, NOW() - INTERVAL '2 days'),
    ('task-sales-3', 'elara-sales-crm', 'Update sample booking', 'Milestone payment verified and booking receipt generated.', 'completed', 'low', 100, ARRAY['Kanav'], NOW() - INTERVAL '1 day', false, NULL, NOW() - INTERVAL '5 days'),

    -- 2. Construction & Design
    ('task-const-1', 'elara-construction-design', 'Review sample drawing', 'Architectural structural drawings review for foundation approval.', 'in_progress', 'high', 60, ARRAY['Rachit', 'Bhirmala'], NOW() + INTERVAL '3 days', false, NULL, NOW() - INTERVAL '4 days'),
    ('task-const-2', 'elara-construction-design', 'Check site execution', 'Conduct weekly quality audit on foundation pouring.', 'pending', 'medium', 20, ARRAY['Rachit'], NOW() + INTERVAL '5 days', false, NULL, NOW() - INTERVAL '2 days'),
    ('task-const-3', 'elara-construction-design', 'Resolve sample quality issue', 'Vendor material delivery delayed by 2 days. Expedited shipment requested.', 'delay', 'high', 30, ARRAY['Bhirmala'], NOW() + INTERVAL '1 day', false, NULL, NOW() - INTERVAL '3 days'),

    -- 3. Approvals & Compliance
    ('task-appr-1', 'elara-approvals-compliance', 'Review sample approval', 'Check municipal water and power sanction compliance.', 'pending', 'medium', 0, ARRAY['Kanav'], NOW() + INTERVAL '6 days', false, NULL, NOW() - INTERVAL '3 days'),
    ('task-appr-2', 'elara-approvals-compliance', 'Prepare sample submission', 'Compile TCP/RERA statutory compliance documentation dossier.', 'in_progress', 'high', 40, ARRAY['Bhirmala'], NOW() + INTERVAL '2 days', false, NULL, NOW() - INTERVAL '2 days'),
    ('task-appr-3', 'elara-approvals-compliance', 'Track sample compliance item', 'Fire safety certificate renewed and filed with regulatory authority.', 'completed', 'low', 100, ARRAY['Kanav', 'Bhirmala'], NOW() - INTERVAL '1 day', false, NULL, NOW() - INTERVAL '6 days'),

    -- 4. Finance & Procurement
    ('task-fin-1', 'elara-finance-procurement', 'Review sample quotation', 'Evaluate competitive quotes for structural steel procurement.', 'in_progress', 'medium', 75, ARRAY['Bhagwan Dass'], NOW() + INTERVAL '2 days', false, NULL, NOW() - INTERVAL '3 days'),
    ('task-fin-2', 'elara-finance-procurement', 'Create sample purchase order', 'Issue PO #GEI-2026-088 for electrical conduits and cabling.', 'pending', 'high', 0, ARRAY['Bhagwan Dass'], NOW() + INTERVAL '3 days', false, NULL, NOW() - INTERVAL '1 day'),
    ('task-fin-3', 'elara-finance-procurement', 'Verify sample vendor payment', 'Vendor invoice audited and payment release cleared by accounts.', 'completed', 'low', 100, ARRAY['Bhagwan Dass'], NOW() - INTERVAL '2 days', false, NULL, NOW() - INTERVAL '5 days'),

    -- 5. Marketing & Customer Experience
    ('task-mkt-1', 'elara-marketing-cx', 'Prepare sample campaign', 'Plan festive promotional launch campaign for Phase 2 villas.', 'pending', 'medium', 10, ARRAY['Rachit'], NOW() + INTERVAL '5 days', false, NULL, NOW() - INTERVAL '4 days'),
    ('task-mkt-2', 'elara-marketing-cx', 'Update sample brochure', 'Refresh villa floorplans, 3D renderings, and specifications list.', 'in_progress', 'low', 50, ARRAY['Bhagwan Dass'], NOW() + INTERVAL '3 days', false, NULL, NOW() - INTERVAL '2 days'),
    ('task-mkt-3', 'elara-marketing-cx', 'Prepare sample buyer communication', 'Quarterly construction progress newsletter dispatched to buyers.', 'completed', 'high', 100, ARRAY['Rachit', 'Bhagwan Dass'], NOW() - INTERVAL '1 day', false, NULL, NOW() - INTERVAL '6 days'),

    -- 6. Project Administration
    ('task-adm-1', 'elara-project-admin', 'Schedule sample meeting', 'Coordinate bi-weekly cross-departmental alignment sync.', 'pending', 'medium', 0, ARRAY['Developer'], NOW() + INTERVAL '1 day', false, NULL, NOW() - INTERVAL '3 days'),
    ('task-adm-2', 'elara-project-admin', 'Prepare sample report', 'Consolidate monthly milestone progress and budget variance overview.', 'in_progress', 'high', 65, ARRAY['Kanav', 'Developer'], NOW() + INTERVAL '2 days', false, NULL, NOW() - INTERVAL '2 days'),
    ('task-adm-3', 'elara-project-admin', 'Coordinate sample manpower requirement', 'Staffing for site surveying and soil testing team awaiting clearance.', 'blocker', 'high', 20, ARRAY['Developer'], NOW() + INTERVAL '1 day', true, 'Awaiting site contractor labor mobilization clearance.', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    priority = EXCLUDED.priority,
    progress = EXCLUDED.progress,
    assigned_users = EXCLUDED.assigned_users,
    due_date = EXCLUDED.due_date,
    is_blocked = EXCLUDED.is_blocked,
    blocker_reason = EXCLUDED.blocker_reason,
    updated_at = NOW();

COMMIT;

-- ==========================================================
-- 8. ENABLE REALTIME REPLICATION (SAFE & IDEMPOTENT)
-- ==========================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.elara_projects;
        EXCEPTION 
            WHEN duplicate_object THEN NULL;
            WHEN OTHERS THEN NULL;
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.elara_users;
        EXCEPTION 
            WHEN duplicate_object THEN NULL;
            WHEN OTHERS THEN NULL;
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.elara_tasks;
        EXCEPTION 
            WHEN duplicate_object THEN NULL;
            WHEN OTHERS THEN NULL;
        END;
    END IF;
END $$;

-- ==========================================================
-- 9. VERIFICATION CHECK (CONFIRM EVERYTHING IS READY)
-- ==========================================================
SELECT 'elara_projects' AS table_name, COUNT(*) AS total_rows FROM public.elara_projects
UNION ALL
SELECT 'elara_users'    AS table_name, COUNT(*) AS total_rows FROM public.elara_users
UNION ALL
SELECT 'elara_tasks'    AS table_name, COUNT(*) AS total_rows FROM public.elara_tasks;
