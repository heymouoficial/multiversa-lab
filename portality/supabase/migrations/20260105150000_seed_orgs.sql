-- Seed Organizations for moushakquant@gmail.com
-- Creates tables if they don't exist and inserts the 3 requested organizations

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin',
    PRIMARY KEY (organization_id, user_id)
);

-- Enable RLS (Security)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- 2. Insert Data
DO $$
DECLARE
    target_user_id UUID;
    multiversa_id UUID;
    elevat_id UUID;
    runa_id UUID;
BEGIN
    -- Find User
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'multiversagroup@gmail.com';

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User multiversagroup@gmail.com not found! Ensure user has signed up.';
    END IF;

    -- Upsert Multiversa Lab
    INSERT INTO public.organizations (name, slug)
    VALUES ('Multiversa Lab', 'multiversa-lab')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO multiversa_id;

    -- Upsert Elevat / ÁGORA
    INSERT INTO public.organizations (name, slug)
    VALUES ('Elevat / ÁGORA', 'elevat-agora')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO elevat_id;

    -- Upsert Runa Script
    INSERT INTO public.organizations (name, slug)
    VALUES ('Runa Script', 'runa-script')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO runa_id;

    -- Link User to Orgs
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES 
        (multiversa_id, target_user_id, 'owner'),
        (elevat_id, target_user_id, 'owner'),
        (runa_id, target_user_id, 'owner')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Organizations seeded successfully for user %', target_user_id;
END $$;
