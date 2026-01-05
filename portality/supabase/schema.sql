-- Portality Multi-Tenant Schema
-- Run this in Supabase SQL Editor

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Update Profiles Table with organization support
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id),
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- 3. Insert Elevat Organization
INSERT INTO public.organizations (name, slug, plan) 
VALUES ('Elevat', 'elevat', 'pro')
ON CONFLICT (slug) DO NOTHING;

-- 4. Create admin profiles for the three founders
-- Note: These users need to sign up first via Supabase Auth, then we link them here
-- Or we can use the admin API to create them

-- 5. RLS Policies for multi-tenant isolation
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can see all profiles in their organization
CREATE POLICY "Admins can view org profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.organization_id = profiles.organization_id
        )
    );

-- Organization members can view their org
CREATE POLICY "Members can view own org" ON public.organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.organization_id = organizations.id
        )
    );

-- 6. Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        CASE 
            WHEN NEW.email IN ('christomoreno6@gmail.com', 'andreachimarasonlinebusiness@gmail.com', 'moshequantum@gmail.com') 
            THEN 'admin'
            ELSE 'member'
        END
    );
    
    -- Auto-assign to Elevat org for founding members
    IF NEW.email IN ('christomoreno6@gmail.com', 'andreachimarasonlinebusiness@gmail.com', 'moshequantum@gmail.com') THEN
        UPDATE public.profiles 
        SET organization_id = (SELECT id FROM public.organizations WHERE slug = 'elevat')
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
