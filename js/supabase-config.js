import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://jprpzazzqppmepyngssm.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_hkAyq1cJafAFAy_Kv3Fgjw_wiAj5wgW';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
