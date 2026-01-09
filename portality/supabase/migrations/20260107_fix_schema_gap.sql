
-- Fix missing columns in tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS notion_id text UNIQUE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- Fix missing columns in clients table (if any, pending verification)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notion_id text UNIQUE;
