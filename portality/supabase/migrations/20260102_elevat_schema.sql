-- 1. Create Clients Table (The "Who")
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  notion_id text unique, -- Vital for n8n/Notion sync
  name text not null,
  status text default 'active' check (status in ('active', 'paused', 'risk')),
  type text default 'project' check (type in ('fixed', 'project')),
  drive_link text,
  crm_link text,
  responsible_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Clients
alter table public.clients enable row level security;
create policy "Allow all authenticated for clients" on public.clients for all to authenticated using (true) with check (true);

-- 2. Create Services Table (The "What")
create table public.services (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- e.g., "Google Ads"
  client_id uuid references public.clients(id) on delete cascade,
  responsible_id uuid references auth.users(id),
  frequency text default 'monthly',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Services
alter table public.services enable row level security;
create policy "Allow all authenticated for services" on public.services for all to authenticated using (true) with check (true);

-- 3. Update Tasks Table to link to Clients and Services (The "How")
-- Safe alter if columns don't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'tasks' and column_name = 'client_id') then
    alter table public.tasks add column client_id uuid references public.clients(id);
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'tasks' and column_name = 'service_id') then
    alter table public.tasks add column service_id uuid references public.services(id);
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'tasks' and column_name = 'deadline') then
    alter table public.tasks add column deadline timestamp with time zone;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'tasks' and column_name = 'type') then
    alter table public.tasks add column type text default 'daily'; -- daily, weekly, monthly, project
  end if;
end $$;
