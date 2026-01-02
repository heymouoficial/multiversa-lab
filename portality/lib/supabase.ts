import { createClient } from '@supabase/supabase-js';

// Configuration for "Elevat Boutique" (Project: rbpgcwmklmyaxnekxxvb)
// Powered by Multiversa Labs
const SUPABASE_URL = 'https://rbpgcwmklmyaxnekxxvb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_u9tosn3J-fdyOXtlKg_mVA_Z3EjNj7T';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});