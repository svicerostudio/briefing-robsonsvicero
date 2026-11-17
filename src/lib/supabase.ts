import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
  console.warn('⚠️ Supabase URL ou Publishable/Anon Key não configurados no arquivo .env!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
