ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notion_id text;
