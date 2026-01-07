-- MIGRATION: ELEVAT OS v1.0 (The Enlightenment)
-- DATE: 2026-01-07
-- AUTHOR: Aureon Architect Core

-- 0. Enable Vector Extension (Critical for RAG)
create extension if not exists vector;

-- 1. Organizations (Multi-tenant Root)
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  plan text DEFAULT 'free'::text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

-- 2. Profiles (Users extended)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  organization_id uuid,
  role text DEFAULT 'member'::text CHECK (role = ANY (ARRAY['admin'::text, 'member'::text, 'viewer'::text])),
  settings jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);

-- 3. Clients (Synced with Notion)
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  notion_id text UNIQUE,
  name text NOT NULL,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'paused'::text, 'risk'::text])),
  type text DEFAULT 'project'::text CHECK (type = ANY (ARRAY['fixed'::text, 'project'::text])),
  drive_link text,
  crm_link text,
  responsible_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_responsible_id_fkey FOREIGN KEY (responsible_id) REFERENCES auth.users(id)
);

-- 4. Knowledge Base (RAG Core)
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  file_type text NOT NULL,
  content text,
  chunk_count integer DEFAULT 0,
  namespace text DEFAULT 'default'::text,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT documents_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.document_chunks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  source_id uuid, -- Changed from text to uuid to match documents.id if needed, or keep generic
  organization_id uuid,
  content text,
  embedding vector(768), -- Gemini Embedding Dimension
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT document_chunks_pkey PRIMARY KEY (id),
  CONSTRAINT document_chunks_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);

-- 5. Tasks & Services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_id uuid,
  responsible_id uuid,
  frequency text DEFAULT 'monthly'::text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT services_pkey PRIMARY KEY (id),
  CONSTRAINT services_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT services_responsible_id_fkey FOREIGN KEY (responsible_id) REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  title text NOT NULL,
  priority text DEFAULT 'medium'::text CHECK (priority = ANY (ARRAY['high'::text, 'medium'::text, 'low'::text])),
  status text DEFAULT 'todo'::text CHECK (status = ANY (ARRAY['todo'::text, 'in-progress'::text, 'review'::text, 'done'::text])),
  completed boolean DEFAULT false,
  assigned_to text,
  tags text[], -- Fixed ARRAY syntax
  user_id uuid,
  client_id uuid,
  service_id uuid,
  deadline timestamp with time zone,
  type text DEFAULT 'daily'::text,
  organization_id uuid, -- Added for multi-tenancy context
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT tasks_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT tasks_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);

-- 6. Chat & Memory (Aureon Brain)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text DEFAULT 'New Conversation'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT chat_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT chat_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  tokens integer,
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id)
);

CREATE TABLE IF NOT EXISTS public.agent_memory (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  agent_name text NOT NULL,
  memory_type text NOT NULL,
  content text NOT NULL,
  embedding vector(768),
  relevance_score double precision DEFAULT 1.0,
  access_count integer DEFAULT 0,
  last_accessed timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT agent_memory_pkey PRIMARY KEY (id)
);

-- 7. Integrations & Events
CREATE TABLE IF NOT EXISTS public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  type text DEFAULT 'meeting'::text,
  link text,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Enable RLS (Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
