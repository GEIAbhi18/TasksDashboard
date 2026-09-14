-- ==========================================================
-- ELARA HOME: TASKS DATES & COMMENTS MIGRATION
-- ==========================================================
-- Run this in your Supabase SQL Editor:
-- 1. Adds actual_completion_date and comments columns to elara_tasks
-- 2. Updates all project names to clean names (removes "Test" and "Elara Home –")
-- 3. Enables comments and dates synchronization

BEGIN;

-- 1. Add columns to elara_tasks if not present
ALTER TABLE public.elara_tasks 
  ADD COLUMN IF NOT EXISTS actual_completion_date timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS comments jsonb DEFAULT '[]'::jsonb;

-- 2. Rename existing projects to clean names
UPDATE public.elara_projects SET name = 'Sales & CRM Project' WHERE id = 'elara-sales-crm';
UPDATE public.elara_projects SET name = 'Construction & Design Project' WHERE id = 'elara-construction-design';
UPDATE public.elara_projects SET name = 'Approvals & Compliance Project' WHERE id = 'elara-approvals-compliance';
UPDATE public.elara_projects SET name = 'Finance & Procurement Project' WHERE id = 'elara-finance-procurement';
UPDATE public.elara_projects SET name = 'Marketing & Customer Experience Project' WHERE id = 'elara-marketing-cx';
UPDATE public.elara_projects SET name = 'Project Administration Project' WHERE id = 'elara-project-admin';

-- 3. Optional: Dedicated elara_comments table (if relational queries are preferred)
CREATE TABLE IF NOT EXISTS public.elara_comments (
    id text PRIMARY KEY DEFAULT ('cmt-' || substr(md5(random()::text), 1, 12)),
    task_id text NOT NULL,
    user_name text NOT NULL,
    user_role text,
    user_avatar text,
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW()
);

GRANT ALL ON TABLE public.elara_comments TO anon, authenticated, service_role;
ALTER TABLE public.elara_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to elara_comments" ON public.elara_comments;
CREATE POLICY "Allow all access to elara_comments" ON public.elara_comments
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

COMMIT;
