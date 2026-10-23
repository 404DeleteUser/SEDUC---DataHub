// Acesso simulado (VITE_ACESSO_SIMULADO=true): a Entrada aparece, mas qualquer
// e-mail e senha entram, sem Supabase. Serve só para conferir o fluxo do site.
import type { Conta, EventoDeSessao } from './conta';

const CHAVE = 'datahub-sessao-simulada';
const EMAIL_PADRAO = 'nome@edu.mt.gov.br';

type Ouvinte = (evento: EventoDeSessao, conta: Conta | null) => void;
const ouvintes = new Set<Ouvinte>();

function contaSimulada(email: string): Conta {
  return { id: 'simulacao', email: email.trim().toLowerCase() || EMAIL_PADRAO };
}

function avisar(evento: EventoDeSessao, conta: Conta | null) {
  ouvintes.forEach((ouvir) => ouvir(evento, conta));
}

/** Sessão da aba (some ao fechá-la). Um link de nova senha abre com sessão, como no real. */
export function contaAtualSimulada(comLink: boolean): Conta | null {
  let email: string | null = null;
  try {
    email = sessionStorage.getItem(CHAVE);
  } catch {
    // Sem sessionStorage: começa sem sessão.
  }
  if (email !== null) return contaSimulada(email);
  return comLink ? contaSimulada('') : null;
}

export function aoMudarSessaoSimulada(ouvir: Ouvinte): () => void {
  ouvintes.add(ouvir);
  return () => ouvintes.delete(ouvir);
}

export function entrarSimulado(email: string): Conta {
  const conta = contaSimulada(email);
  try {
    sessionStorage.setItem(CHAVE, conta.email);
  } catch {
    // Sem sessionStorage: a sessão vale só até recarregar.
  }
  avisar('entrou', conta);
  return conta;
}

export function sairSimulado() {
  try {
    sessionStorage.removeItem(CHAVE);
  } catch {
    // Nada a apagar.
  }
  avisar('saiu', null);
}
