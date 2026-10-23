import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CHAVE_PERFIL,
  lerPerfilLocal,
  salvarPerfilLocal,
  validarArquivoDeFoto,
} from './perfilLocal';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('perfil salvo neste computador', () => {
  it('sem nada salvo, começa sem nome e sem foto', () => {
    expect(lerPerfilLocal()).toEqual({ nome: '', foto: null });
  });

  it('salva e lê de volta', () => {
    const perfil = { nome: 'Ana Teste', foto: 'data:image/jpeg;base64,AAA' };
    expect(salvarPerfilLocal(perfil)).toBe(true);
    expect(lerPerfilLocal()).toEqual(perfil);
  });

  it('ignora dado corrompido ou de outro formato', () => {
    localStorage.setItem(CHAVE_PERFIL, '{quebrado');
    expect(lerPerfilLocal()).toEqual({ nome: '', foto: null });
    localStorage.setItem(
      CHAVE_PERFIL,
      JSON.stringify({ nome: 42, foto: 'javascript:alert(1)' })
    );
    expect(lerPerfilLocal()).toEqual({ nome: '', foto: null });
  });

  it('não quebra se o armazenamento estiver indisponível', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('cheio');
    });
    expect(salvarPerfilLocal({ nome: 'Ana', foto: null })).toBe(false);
  });
});

describe('validarArquivoDeFoto', () => {
  const arquivo = (tipo: string, tamanho = 10) =>
    new File([new Uint8Array(tamanho)], 'foto', { type: tipo });

  it('aceita JPG, PNG e WebP de até 10 MB', () => {
    expect(validarArquivoDeFoto(arquivo('image/png'))).toBeUndefined();
    expect(validarArquivoDeFoto(arquivo('image/gif'))).toBe(
      'Use uma imagem JPG, PNG ou WebP.'
    );
    expect(
      validarArquivoDeFoto(arquivo('image/jpeg', 10 * 1024 * 1024 + 1))
    ).toBe('A imagem pode ter no máximo 10 MB.');
  });
});
