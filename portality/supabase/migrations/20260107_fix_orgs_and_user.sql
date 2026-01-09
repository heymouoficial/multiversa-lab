-- Fix Organization Names
UPDATE public.organizations SET name = 'Runa Scrypt' WHERE name = 'Runa Script';
UPDATE public.organizations SET name = 'Ágora' WHERE name = 'Elevat / ÁGORA';

-- Fix Moshe Profile (Backfill ID 0aec6d3f-c383-45b7-b45c-ab8614c4dda4)
UPDATE public.profiles
SET 
    email = 'moshequantum@gmail.com',
    full_name = 'Moshe Quantum',
    organization_id = (SELECT id FROM public.organizations WHERE name = 'Elevat' LIMIT 1)
WHERE id = '0aec6d3f-c383-45b7-b45c-ab8614c4dda4';
