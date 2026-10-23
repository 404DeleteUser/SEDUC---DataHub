// Regras do perfil, sem React.

const MINIMO_LETRAS = 2;
const MAXIMO_CARACTERES = 80;
const SO_LETRAS = /^[\p{L}][\p{L}\s'’-]*$/u;

/** Mensagem do problema, ou undefined se o nome é válido. */
export function validarNome(nome: string): string | undefined {
  const limpo = nome.trim();
  if (!limpo) return 'Informe seu nome.';
  if (limpo.length > MAXIMO_CARACTERES) {
    return `O nome pode ter no máximo ${MAXIMO_CARACTERES} caracteres.`;
  }
  if (!SO_LETRAS.test(limpo)) {
    return 'Use só letras, espaços, hífen ou apóstrofo.';
  }
  if (limpo.replace(/[^\p{L}]/gu, '').length < MINIMO_LETRAS) {
    return `O nome precisa ter pelo menos ${MINIMO_LETRAS} letras.`;
  }
  return undefined;
}

/** Iniciais para o círculo quando não há foto. */
export function iniciaisDoNome(nome: string): string {
  const palavras = nome.trim().split(/\s+/).filter(Boolean);
  if (!palavras.length) return '';
  const primeira = palavras[0];
  const ultima = palavras.length > 1 ? palavras[palavras.length - 1] : '';
  return `${primeira[0]}${ultima[0] ?? ''}`.toUpperCase();
}
