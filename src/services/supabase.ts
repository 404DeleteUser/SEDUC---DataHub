// Cliente do Supabase. Sem as variáveis de ambiente, fica null e o app roda no
// modo local (sem login), como nos testes e no desenvolvimento sem conta.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && chave
    ? createClient(url, chave, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
      })
    : null;
