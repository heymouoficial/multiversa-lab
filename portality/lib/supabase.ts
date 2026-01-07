import { createClient } from '@supabase/supabase-js';

// Configuration for "Elevat Boutique" (Project: rbpgcwmklmyaxnekxxvb)
// Powered by Multiversa Labs
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});