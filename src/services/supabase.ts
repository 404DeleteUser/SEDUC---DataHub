// Cliente do Supabase. Sem as variáveis de ambiente, fica null e o app roda no
// modo local (sem login), como nos testes e no desenvolvimento sem conta.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { lerLinkDeAcesso, type LinkDeAcesso } from '../domain/entrada';
import { armazenamentoSessao } from './armazenamentoSessao';

const url = import.meta.env.VITE_SUPABASE_URL;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Temporário: a Entrada aparece, mas sem autenticação (ver `.env.production`). */
export const acessoSimulado = import.meta.env.VITE_ACESSO_SIMULADO === 'true';

/** Lido antes de criar o cliente, que limpa o "#access_token…&type=…" da barra. */
export const linkDeAcesso: LinkDeAcesso = lerLinkDeAcesso(
  window.location.pathname,
  window.location.hash
);

export const supabase: SupabaseClient | null =
  url && chave && !acessoSimulado
    ? createClient(url, chave, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          // Implícito: os convites do painel do Supabase chegam nesse formato, e o
          // link de nova senha funciona mesmo aberto em outro navegador.
          flowType: 'implicit',
          storage: armazenamentoSessao,
        },
      })
    : null;
