-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Add organization_id to knowledge_sources if not exists (for RLS/Filtering)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'knowledge_sources' and column_name = 'organization_id') then
        alter table public.knowledge_sources add column organization_id uuid references public.organizations(id);
    end if;
end $$;

-- Create a table for storing document chunks and their embeddings
create table if not exists public.document_chunks (
    id uuid default gen_random_uuid() primary key,
    source_id text references public.knowledge_sources(id) on delete cascade,
    organization_id uuid references public.organizations(id), -- Denormalized for faster filtering
    content text,
    embedding vector(768), -- Gemini Embedding Dimensions
    metadata jsonb,
    created_at timestamptz default now()
);

-- Enable RLS on chunks
alter table public.document_chunks enable row level security;

-- Create a policy that allows users to query chunks belonging to their organizations
-- (Assuming auth.uid() checks organization_members, but for now we'll allow authenticated read if they have access to the org)
-- For simplicity in this step: Allow authenticated to read (Filtering handled by app logic + future strict RLS)
create policy "Allow authenticated read" on public.document_chunks for select using (auth.role() = 'authenticated');

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_organization_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float,
  source_id text,
  metadata jsonb
)
language plpgsql
as $$
begin
  return query
  select
    document_chunks.id,
    document_chunks.content,
    1 - (document_chunks.embedding <=> query_embedding) as similarity,
    document_chunks.source_id,
    document_chunks.metadata
  from document_chunks
  where 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  and document_chunks.organization_id = filter_organization_id
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;
