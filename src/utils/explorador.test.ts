import { afterEach, describe, expect, it, vi } from 'vitest';

const dialogo = vi.hoisted(() => ({ open: vi.fn(), save: vi.fn() }));
const tauri = vi.hoisted(() => ({ ativo: false }));
vi.mock('@tauri-apps/plugin-dialog', () => dialogo);
vi.mock('@tauri-apps/api/core', () => ({ isTauri: () => tauri.ativo }));

const { escolherArquivo, escolherDestino, escolherPasta } =
  await import('./explorador');

/** Simula o usuário escolhendo arquivos no explorador do navegador. */
function navegadorEscolhe(arquivos: File[] | null) {
  vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (
    this: HTMLInputElement
  ) {
    if (!arquivos) {
      this.dispatchEvent(new Event('cancel'));
      return;
    }
    Object.defineProperty(this, 'files', { value: arquivos });
    this.dispatchEvent(new Event('change'));
  });
}

function naPasta(caminho: string) {
  const arquivo = new File(['x'], caminho.split('/').pop()!);
  Object.defineProperty(arquivo, 'webkitRelativePath', { value: caminho });
  return arquivo;
}

afterEach(() => {
  vi.restoreAllMocks();
  dialogo.open.mockReset();
  dialogo.save.mockReset();
  tauri.ativo = false;
});

describe('no navegador', () => {
  it('escolherArquivo devolve o nome (sem caminho real)', async () => {
    navegadorEscolhe([new File(['x'], 'base.xlsx')]);
    expect(
      await escolherArquivo({ titulo: 'Planilha', extensoes: ['xlsx'] })
    ).toEqual({ nome: 'base.xlsx', rotulo: 'base.xlsx' });
  });

  it('cancelar devolve null', async () => {
    navegadorEscolhe(null);
    expect(
      await escolherArquivo({ titulo: 'Planilha', extensoes: ['xlsx'] })
    ).toBeNull();
  });

  it('escolherPasta lista só os arquivos com a extensão pedida', async () => {
    navegadorEscolhe([
      naPasta('scripts/main.py'),
      naPasta('scripts/util/apoio.py'),
      naPasta('scripts/leia-me.txt'),
    ]);
    expect(
      await escolherPasta({ titulo: 'Pasta', listarExtensoes: ['py'] })
    ).toEqual({
      nome: 'scripts',
      rotulo: 'scripts',
      arquivos: ['main.py', 'util/apoio.py'],
    });
  });

  it('escolherDestino usa a pasta escolhida e o nome sugerido', async () => {
    navegadorEscolhe([naPasta('Relatorios/antigo.xlsx')]);
    expect(
      await escolherDestino({
        titulo: 'Salvar',
        nomeSugerido: 'saida.xlsx',
        extensoes: ['xlsx'],
      })
    ).toEqual({ nome: 'saida.xlsx', rotulo: 'Relatorios\\saida.xlsx' });
  });
});

describe('no app desktop (diálogo nativo)', () => {
  it('escolherArquivo devolve o caminho real', async () => {
    tauri.ativo = true;
    dialogo.open.mockResolvedValue('C:\\Dados\\base.xlsx');
    expect(
      await escolherArquivo({ titulo: 'Planilha', extensoes: ['xlsx'] })
    ).toEqual({
      nome: 'base.xlsx',
      caminho: 'C:\\Dados\\base.xlsx',
      rotulo: 'C:\\Dados\\base.xlsx',
    });
    expect(dialogo.open).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: [{ name: 'Planilha', extensions: ['xlsx'] }],
      })
    );
  });

  it('escolherPasta abre o seletor de diretório', async () => {
    tauri.ativo = true;
    dialogo.open.mockResolvedValue('C:\\Relatorios');
    expect(await escolherPasta({ titulo: 'Pasta' })).toEqual({
      nome: 'Relatorios',
      caminho: 'C:\\Relatorios',
      rotulo: 'C:\\Relatorios',
    });
    expect(dialogo.open).toHaveBeenCalledWith(
      expect.objectContaining({ directory: true })
    );
  });

  it('escolherDestino usa o "Salvar como" nativo', async () => {
    tauri.ativo = true;
    dialogo.save.mockResolvedValue('C:\\Relatorios\\final.xlsx');
    expect(
      await escolherDestino({
        titulo: 'Salvar',
        nomeSugerido: 'saida.xlsx',
        extensoes: ['xlsx'],
      })
    ).toEqual({
      nome: 'final.xlsx',
      caminho: 'C:\\Relatorios\\final.xlsx',
      rotulo: 'C:\\Relatorios\\final.xlsx',
    });
    expect(dialogo.save).toHaveBeenCalledWith(
      expect.objectContaining({ defaultPath: 'saida.xlsx' })
    );
  });

  it('cancelar no diálogo nativo devolve null', async () => {
    tauri.ativo = true;
    dialogo.open.mockResolvedValue(null);
    expect(await escolherPasta({ titulo: 'Pasta' })).toBeNull();
  });
});
