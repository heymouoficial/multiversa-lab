
-- Create Tasks Table
create table if not exists public.tasks (
    id uuid default gen_random_uuid() primary key,
    created_at timestamptz default now(),
    title text not null,
    priority text check (priority in ('high', 'medium', 'low')) default 'medium',
    status text check (status in ('todo', 'in-progress', 'review', 'done')) default 'todo',
    completed boolean default false,
    assigned_to text, -- Stores 'andrea', 'christian', 'moises' etc.
    tags text[],
    user_id uuid references auth.users(id) on delete set null
);

-- Enable RLS
alter table public.tasks enable row level security;

-- Policy: Admin Omnipotence (for rapid dev, same as others)
create policy "Enable all access for authenticated users" on public.tasks
    for all using (auth.role() = 'authenticated');

-- Grant access
grant all on public.tasks to postgres, anon, authenticated, service_role;
