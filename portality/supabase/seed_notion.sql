-- Create notion_cache table for RAG service
CREATE TABLE IF NOT EXISTS public.notion_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notion_id TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    tag TEXT DEFAULT 'General',
    role TEXT DEFAULT 'admin',
    last_synced TIMESTAMPTZ DEFAULT now(),
    icon TEXT,
    content TEXT,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notion_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
DROP POLICY IF EXISTS "Allow read access" ON public.notion_cache;
CREATE POLICY "Allow read access" ON public.notion_cache FOR SELECT USING (true);

-- Insert Initial Data (Mocking Sync from "Clientes - Agencia 2026")
INSERT INTO public.notion_cache (notion_id, title, summary, tag, icon, url, role)
VALUES 
    ('client-001', 'Clínica Pro Salud', 'Cliente Activo - Servicios: Google Ads, Instagram. Responsable: Mou/Nae.', 'Cliente', '🏥', 'https://notion.so/client-001', 'admin'),
    ('client-002', 'Your Sign World', 'Cliente Activo - Servicios: Facebook Ads. Responsable: Mou + Andrea.', 'Cliente', '🪧', 'https://notion.so/client-002', 'admin'),
    ('client-003', 'D Mart Parts', 'Cliente Activo - Servicios: Google Ads, Ecommerce. Responsable: Mou/Christian.', 'Cliente', '🚗', 'https://notion.so/client-003', 'admin'),
    ('client-004', 'Torres Cabrera Law Firm', 'Cliente Activo - Servicios: CRM GHL. Responsable: Zabdiel.', 'Cliente', '⚖️', 'https://notion.so/client-004', 'admin'),
    -- Add the Notion structure docs as visible items too
    ('db-001', 'Clientes – Agencia 2026', 'Base de datos principal de clientes activos y prospectos.', 'Database', '👥', 'https://notion.so/db-customers', 'admin'),
    ('db-002', 'Servicios Activos', 'Contratos y servicios operativos por cliente.', 'Database', '🔌', 'https://notion.so/db-services', 'admin'),
    ('db-003', 'Tareas Operativas', 'Tablero central de operaciones diarias y entregables.', 'Database', '✅', 'https://notion.so/db-tasks', 'admin')
ON CONFLICT DO NOTHING;
