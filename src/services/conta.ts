// Conta e perfil no Supabase. As telas usam só estas funções; sem Supabase
// configurado (modo local), contaConfigurada() é false e o app não pede login.
// Com o acesso simulado, a Entrada aparece, mas nada vai ao Supabase.
import {
  CAMINHO_REDEFINIR_SENHA,
  normalizarEmail,
  type LinkDeAcesso,
} from '../domain/entrada';
import {
  aoMudarSessaoSimulada,
  contaAtualSimulada,
  entrarSimulado,
  sairSimulado,
} from './acessoSimulado';
import { definirManterConectado } from './armazenamentoSessao';
import { acessoSimulado, linkDeAcesso, supabase } from './supabase';

export type Conta = { id: string; email: string };

export type PerfilRemoto = {
  nome: string;
  /** URL temporária (assinada) da foto, ou null. */
  foto: string | null;
};

export type EventoDeSessao = 'entrou' | 'saiu' | 'recuperando-senha';

const BUCKET_FOTOS = 'fotos-perfil';
/** A URL assinada da foto vale 1 hora; ao reabrir o app, outra é gerada. */
const VALIDADE_URL_FOTO_S = 60 * 60;

function cliente() {
  if (!supabase) throw new Error('Supabase não configurado.');
  return supabase;
}

function paraConta(usuario: { id: string; email?: string } | null | undefined) {
  return usuario ? { id: usuario.id, email: usuario.email ?? '' } : null;
}

export function contaConfigurada(): boolean {
  return supabase !== null || acessoSimulado;
}

/** Acesso simulado: sem validação nem Supabase, só para conferir o fluxo. */
export function emSimulacao(): boolean {
  return acessoSimulado;
}

/** O link (convite, nova senha ou vencido) pelo qual o app foi aberto. */
export function linkDeAcessoInicial(): LinkDeAcesso {
  return linkDeAcesso;
}

export async function contaAtual(): Promise<Conta | null> {
  if (acessoSimulado) return contaAtualSimulada(linkDeAcesso !== null);
  const { data } = await cliente().auth.getSession();
  return paraConta(data.session?.user);
}

export function aoMudarSessao(
  aviso: (evento: EventoDeSessao, conta: Conta | null) => void
): () => void {
  if (acessoSimulado) return aoMudarSessaoSimulada(aviso);
  const { data } = cliente().auth.onAuthStateChange((evento, sessao) => {
    const conta = paraConta(sessao?.user);
    if (evento === 'PASSWORD_RECOVERY') aviso('recuperando-senha', conta);
    else if (evento === 'SIGNED_OUT') aviso('saiu', null);
    else if (conta) aviso('entrou', conta);
  });
  return () => data.subscription.unsubscribe();
}

export async function entrar(
  email: string,
  senha: string,
  manter: boolean
): Promise<Conta> {
  if (acessoSimulado) return entrarSimulado(email);
  // Antes do login: a sessão nova já é gravada no lugar escolhido.
  definirManterConectado(manter);
  const { data, error } = await cliente().auth.signInWithPassword({
    email: normalizarEmail(email),
    password: senha,
  });
  if (error) throw error;
  return paraConta(data.user)!;
}

export async function enviarRecuperacaoDeSenha(email: string): Promise<void> {
  if (acessoSimulado) return;
  const { error } = await cliente().auth.resetPasswordForEmail(
    normalizarEmail(email),
    { redirectTo: `${window.location.origin}${CAMINHO_REDEFINIR_SENHA}` }
  );
  if (error) throw error;
}

export async function definirNovaSenha(senha: string): Promise<void> {
  if (acessoSimulado) return;
  const { error } = await cliente().auth.updateUser({ password: senha });
  if (error) throw error;
}

export async function sair(): Promise<void> {
  if (acessoSimulado) return sairSimulado();
  const { error } = await cliente().auth.signOut();
  if (error) throw error;
}

async function urlDaFoto(caminho: string | null): Promise<string | null> {
  if (!caminho) return null;
  const { data, error } = await cliente()
    .storage.from(BUCKET_FOTOS)
    .createSignedUrl(caminho, VALIDADE_URL_FOTO_S);
  return error ? null : data.signedUrl;
}

export async function carregarPerfil(conta: Conta): Promise<PerfilRemoto> {
  const { data, error } = await cliente()
    .from('perfis')
    .select('nome, foto_caminho')
    .eq('id', conta.id)
    .maybeSingle();
  if (error) throw error;
  return {
    nome: data?.nome ?? '',
    foto: await urlDaFoto(data?.foto_caminho ?? null),
  };
}

export async function salvarNome(conta: Conta, nome: string): Promise<void> {
  const { error } = await cliente()
    .from('perfis')
    .update({ nome, atualizado_em: new Date().toISOString() })
    .eq('id', conta.id);
  if (error) throw error;
}

/** Recebe a foto já reduzida (data URL JPEG) e devolve a URL para exibir. */
export async function salvarFoto(
  conta: Conta,
  dataUrl: string
): Promise<string> {
  const arquivo = await (await fetch(dataUrl)).blob();
  // Nome novo a cada troca: evita que o navegador mostre a foto antiga do cache.
  const caminho = `${conta.id}/foto-${Date.now()}.jpg`;
  const armazenamento = cliente().storage.from(BUCKET_FOTOS);
  const anterior = await cliente()
    .from('perfis')
    .select('foto_caminho')
    .eq('id', conta.id)
    .maybeSingle();
  const envio = await armazenamento.upload(caminho, arquivo, {
    contentType: 'image/jpeg',
  });
  if (envio.error) throw envio.error;
  const { error } = await cliente()
    .from('perfis')
    .update({ foto_caminho: caminho, atualizado_em: new Date().toISOString() })
    .eq('id', conta.id);
  if (error) throw error;
  const caminhoAnterior = anterior.data?.foto_caminho;
  if (caminhoAnterior) await armazenamento.remove([caminhoAnterior]);
  return (await urlDaFoto(caminho)) ?? dataUrl;
}

export async function removerFoto(conta: Conta): Promise<void> {
  const { data } = await cliente()
    .from('perfis')
    .select('foto_caminho')
    .eq('id', conta.id)
    .maybeSingle();
  const { error } = await cliente()
    .from('perfis')
    .update({ foto_caminho: null, atualizado_em: new Date().toISOString() })
    .eq('id', conta.id);
  if (error) throw error;
  if (data?.foto_caminho) {
    await cliente().storage.from(BUCKET_FOTOS).remove([data.foto_caminho]);
  }
}
