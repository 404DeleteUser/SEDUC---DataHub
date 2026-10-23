// Regras da tela de entrada, sem React e sem Supabase: validação e mensagens.

export const DOMINIO_INSTITUCIONAL = '@edu.mt.gov.br';
const SENHA_MINIMA = 8;
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Códigos do Supabase Auth que significam "e-mail ou senha não conferem". */
const CODIGOS_DE_CREDENCIAL = new Set([
  'invalid_credentials',
  'email_not_confirmed',
  'user_not_found',
]);

export const MENSAGEM_CREDENCIAL = 'E-mail ou senha incorretos.';
export const MENSAGEM_SERVICO =
  'Não foi possível entrar agora. Tente de novo em instantes.';

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validarEmail(email: string): string | undefined {
  const limpo = normalizarEmail(email);
  if (!limpo) return 'Informe o e-mail.';
  if (!EMAIL_VALIDO.test(limpo)) return 'Confira o e-mail digitado.';
  // endsWith com o "@": recusa @seduc.mt.gov.br e @edu.mt.gov.br.outro.com.
  if (!limpo.endsWith(DOMINIO_INSTITUCIONAL)) {
    return `Use seu e-mail ${DOMINIO_INSTITUCIONAL}.`;
  }
  return undefined;
}

export function validarSenha(senha: string): string | undefined {
  return senha ? undefined : 'Informe a senha.';
}

export type ErrosNovaSenha = { senha?: string; confirmacao?: string };

export function validarNovaSenha(
  senha: string,
  confirmacao: string
): ErrosNovaSenha {
  if (!senha) return { senha: 'Informe a nova senha.' };
  if (senha.length < SENHA_MINIMA) {
    return {
      senha: `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`,
    };
  }
  if (senha !== confirmacao) {
    return { confirmacao: 'As senhas não são iguais.' };
  }
  return {};
}

/** Mensagem para uma falha ao entrar. Nunca repassa o texto técnico do Supabase. */
export function falhaDeEntrada(erro: unknown): string {
  const { code, status } = (erro ?? {}) as { code?: string; status?: number };
  if (code && CODIGOS_DE_CREDENCIAL.has(code)) return MENSAGEM_CREDENCIAL;
  // Versões antigas do Auth não mandam o código: 400 no login é credencial errada.
  if (!code && status === 400) return MENSAGEM_CREDENCIAL;
  return MENSAGEM_SERVICO;
}

/** Mensagem para uma falha ao salvar a nova senha. */
export function falhaDeNovaSenha(erro: unknown): string {
  const { code } = (erro ?? {}) as { code?: string };
  if (code === 'same_password') {
    return 'A nova senha precisa ser diferente da atual.';
  }
  if (code === 'weak_password') {
    return 'Essa senha é fraca. Use uma senha mais longa, com letras e números.';
  }
  return 'Não foi possível salvar a senha agora. Tente de novo em instantes.';
}

export const CAMINHO_REDEFINIR_SENHA = '/redefinir-senha';

/**
 * O que o endereço de chegada pede: o link de "Esqueci a senha" ou o convite
 * da administração levam à criação de senha; um link vencido também é avisado.
 */
export type LinkDeAcesso = 'recuperacao' | 'convite' | 'invalido' | null;

export function lerLinkDeAcesso(caminho: string, hash: string): LinkDeAcesso {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  if (params.get('error') || params.get('error_code')) return 'invalido';
  const tipo = params.get('type');
  if (tipo === 'invite') return 'convite';
  if (tipo === 'recovery') return 'recuperacao';
  return caminho.replace(/\/+$/, '') === CAMINHO_REDEFINIR_SENHA
    ? 'recuperacao'
    : null;
}
