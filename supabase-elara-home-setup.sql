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
    actual_completion_date timestamptz DEFAULT NULL,
    comments jsonb DEFAULT '[]'::jsonb,
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
        'Sales & CRM Project',
        'Sales & CRM',
        'Leads, follow-ups, site visits, bookings, payment milestones, documentation.',
        '#3b82f6',
        'Active',
        'Elara Home'
    ),
    (
        'elara-construction-design',
        'Construction & Design Project',
        'Construction & Design',
        'Site execution, drawings, consultant decisions, contractor actions, quality and safety issues.',
        '#10b981',
        'Active',
        'Elara Home'
    ),
    (
        'elara-approvals-compliance',
        'Approvals & Compliance Project',
        'Approvals & Compliance',
        'TCP/RERA matters, government approvals, licences, statutory submissions and renewals.',
        '#8b5cf6',
        'Active',
        'Elara Home'
    ),
    (
        'elara-finance-procurement',
        'Finance & Procurement Project',
        'Finance & Procurement',
        'Budgets, purchase orders, vendor payments, quotations, billing and cost approvals.',
        '#f59e0b',
        'Active',
        'Elara Home'
    ),
    (
        'elara-marketing-cx',
        'Marketing & Customer Experience Project',
        'Marketing & Customer Experience',
        'Campaigns, brochures, events, website updates, buyer communication and handover preparation.',
        '#ec4899',
        'Active',
        'Elara Home'
    ),
    (
        'elara-project-admin',
        'Project Administration Project',
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
-- -- ==========================================================
-- 7. CLEAN SLATE FOR TASKS (READY FOR REAL DATA)
-- ==========================================================
-- Tasks will be created directly by users from the dashboard.

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
