import { afterEach, describe, expect, it, vi } from 'vitest';

const opener = vi.hoisted(() => ({ openUrl: vi.fn() }));
const tauri = vi.hoisted(() => ({ ativo: false }));
vi.mock('@tauri-apps/plugin-opener', () => opener);
vi.mock('@tauri-apps/api/core', () => ({ isTauri: () => tauri.ativo }));

const { abrirLinkExterno } = await import('./abrirLink');

afterEach(() => {
  vi.restoreAllMocks();
  opener.openUrl.mockReset();
  tauri.ativo = false;
});

describe('abrirLinkExterno', () => {
  it('no app desktop abre no navegador padrão do sistema', async () => {
    tauri.ativo = true;
    await abrirLinkExterno('https://www.fiplan.mt.gov.br/Fiplan.jsp');
    expect(opener.openUrl).toHaveBeenCalledWith(
      'https://www.fiplan.mt.gov.br/Fiplan.jsp'
    );
  });

  it('no navegador abre em nova aba, sem acesso à janela do app', async () => {
    const abrir = vi.spyOn(window, 'open').mockReturnValue(null);
    await abrirLinkExterno('https://eduhub.seduc.mt.gov.br/');
    expect(abrir).toHaveBeenCalledWith(
      'https://eduhub.seduc.mt.gov.br/',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('recusa endereços que não sejam http(s)', async () => {
    await expect(abrirLinkExterno('javascript:alert(1)')).rejects.toThrow(
      'Endereço não permitido'
    );
  });
});
