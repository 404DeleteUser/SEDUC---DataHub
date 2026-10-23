// Perfil salvo neste computador (app individual): nome e foto reduzida.
import type { PerfilLocal } from '../types/perfil';

export const CHAVE_PERFIL = 'datahub-perfil';
const TIPOS_DE_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANHO_MAXIMO_MB = 10;
/** Lado da foto salva: o círculo da tela usa no máximo 120px (2x para telas densas). */
const LADO_DA_FOTO_PX = 256;
const QUALIDADE_JPEG = 0.85;

const PERFIL_VAZIO: PerfilLocal = { nome: '', foto: null };

export function lerPerfilLocal(): PerfilLocal {
  try {
    const salvo: unknown = JSON.parse(
      localStorage.getItem(CHAVE_PERFIL) ?? 'null'
    );
    if (typeof salvo !== 'object' || salvo === null) return PERFIL_VAZIO;
    const { nome, foto } = salvo as Record<string, unknown>;
    return {
      nome: typeof nome === 'string' ? nome : '',
      foto:
        typeof foto === 'string' && foto.startsWith('data:image/jpeg;base64,')
          ? foto
          : null,
    };
  } catch {
    return PERFIL_VAZIO;
  }
}

/** Devolve false se não deu para salvar (armazenamento cheio ou bloqueado). */
export function salvarPerfilLocal(perfil: PerfilLocal): boolean {
  try {
    localStorage.setItem(CHAVE_PERFIL, JSON.stringify(perfil));
    return true;
  } catch {
    return false;
  }
}

export function validarArquivoDeFoto(arquivo: File): string | undefined {
  if (!TIPOS_DE_FOTO.includes(arquivo.type)) {
    return 'Use uma imagem JPG, PNG ou WebP.';
  }
  if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
    return `A imagem pode ter no máximo ${TAMANHO_MAXIMO_MB} MB.`;
  }
  return undefined;
}

/** Recorta o centro em quadrado e reduz, para a foto caber no armazenamento local. */
export async function reduzirFoto(arquivo: File): Promise<string> {
  const imagem = await createImageBitmap(arquivo);
  const lado = Math.min(imagem.width, imagem.height);
  const canvas = document.createElement('canvas');
  canvas.width = LADO_DA_FOTO_PX;
  canvas.height = LADO_DA_FOTO_PX;
  const contexto = canvas.getContext('2d');
  if (!contexto) throw new Error('Não foi possível processar a imagem.');
  contexto.drawImage(
    imagem,
    (imagem.width - lado) / 2,
    (imagem.height - lado) / 2,
    lado,
    lado,
    0,
    0,
    LADO_DA_FOTO_PX,
    LADO_DA_FOTO_PX
  );
  imagem.close();
  return canvas.toDataURL('image/jpeg', QUALIDADE_JPEG);
}
