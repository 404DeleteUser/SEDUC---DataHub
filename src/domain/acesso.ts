// Regras de acesso, sem React e sem Supabase: validação e mensagens de erro.

export const DOMINIO_INSTITUCIONAL = '@edu.mt.gov.br';
const SENHA_MINIMA = 8;
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MENSAGEM_DOMINIO = `Use seu e-mail institucional (${DOMINIO_INSTITUCIONAL}).`;

export function validarEmailInstitucional(email: string): string | undefined {
  const limpo = email.trim().toLowerCase();
  if (!limpo) return 'Informe seu e-mail.';
  if (!EMAIL_VALIDO.test(limpo)) return 'Informe um e-mail válido.';
  if (!limpo.endsWith(DOMINIO_INSTITUCIONAL)) return MENSAGEM_DOMINIO;
  return undefined;
}

export function validarSenha(senha: string): string | undefined {
  if (!senha) return 'Informe a senha.';
  if (senha.length < SENHA_MINIMA) {
    return `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  }
  return undefined;
}

const POR_CODIGO: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_not_confirmed:
    'Confirme seu e-mail antes de entrar: abra o link que enviamos para a sua caixa de entrada.',
  user_already_exists:
    'Já existe uma conta com este e-mail. Entre ou recupere a senha.',
  email_exists:
    'Já existe uma conta com este e-mail. Entre ou recupere a senha.',
  over_email_send_rate_limit:
    'Muitos e-mails enviados agora. Tente de novo em alguns minutos.',
  over_request_rate_limit:
    'Muitas tentativas seguidas. Aguarde um pouco e tente de novo.',
  weak_password: `A senha é fraca. Use pelo menos ${SENHA_MINIMA} caracteres, misturando letras e números.`,
  same_password: 'A nova senha precisa ser diferente da atual.',
};

/** Mensagem em português para um erro do Supabase Auth (ou de rede). */
export function mensagemDoErroDeAcesso(erro: unknown): string {
  const { code, message } = (erro ?? {}) as { code?: string; message?: string };
  if (code && POR_CODIGO[code]) return POR_CODIGO[code];
  const texto = message ?? '';
  // O gatilho do banco recusa domínios fora do institucional.
  if (/institucional|Database error saving new user/i.test(texto)) {
    return MENSAGEM_DOMINIO;
  }
  if (/fetch|network/i.test(texto)) {
    return 'Sem conexão com o servidor. Verifique a internet e tente de novo.';
  }
  return 'Não foi possível concluir agora. Tente de novo.';
}
