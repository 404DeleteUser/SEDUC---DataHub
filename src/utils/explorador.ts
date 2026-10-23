// Abre o explorador de arquivos. No app desktop usa o diálogo nativo (caminho
// real); no navegador, o seletor do navegador, que só informa nomes.
import { isTauri } from '@tauri-apps/api/core';

export type ItemEscolhido = {
  nome: string;
  /** Caminho completo: só existe no app desktop. */
  caminho?: string;
  /** O que mostrar no campo: o caminho, ou o melhor que o navegador informa. */
  rotulo: string;
};

export type PastaEscolhida = ItemEscolhido & {
  /** Arquivos encontrados (caminho relativo à pasta); só no navegador. */
  arquivos?: string[];
};

type OpcoesArquivo = {
  titulo: string;
  extensoes: string[];
  /** Pasta onde o diálogo nativo abre. */
  pastaInicial?: string;
};
type OpcoesPasta = { titulo: string; listarExtensoes?: string[] };
type OpcoesDestino = OpcoesArquivo & { nomeSugerido: string };

function nomeDoCaminho(caminho: string): string {
  return caminho.split(/[\\/]/).filter(Boolean).pop() ?? caminho;
}

function doCaminho(caminho: string): ItemEscolhido {
  return { nome: nomeDoCaminho(caminho), caminho, rotulo: caminho };
}

function temExtensao(nome: string, extensoes: string[]) {
  const extensao = nome.split('.').pop()?.toLowerCase() ?? '';
  return extensoes.includes(extensao);
}

/** Seletor do navegador; resolve null se o usuário cancelar. */
function abrirSeletorDoNavegador(
  configurar: (input: HTMLInputElement) => void
): Promise<FileList | File[] | null> {
  return new Promise((resolver) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.hidden = true;
    configurar(input);
    const terminar = (arquivos: FileList | File[] | null) => {
      input.remove();
      resolver(arquivos?.length ? arquivos : null);
    };
    input.addEventListener('change', () => terminar(input.files), {
      once: true,
    });
    input.addEventListener('cancel', () => terminar(null), { once: true });
    document.body.append(input);
    input.click();
  });
}

async function pastaDoNavegador(
  listarExtensoes?: string[]
): Promise<PastaEscolhida | null> {
  const arquivos = await abrirSeletorDoNavegador((input) => {
    input.setAttribute('webkitdirectory', '');
    input.setAttribute('directory', '');
  });
  if (!arquivos) return null;
  const caminhos = Array.from(
    arquivos,
    (arquivo) => arquivo.webkitRelativePath
  );
  const nome = caminhos[0]?.split('/')[0] ?? '';
  const pasta: PastaEscolhida = { nome, rotulo: nome };
  if (listarExtensoes) {
    pasta.arquivos = caminhos
      .map((caminho) => caminho.split('/').slice(1).join('/'))
      .filter((relativo) => relativo && temExtensao(relativo, listarExtensoes));
  }
  return pasta;
}

export async function escolherArquivo({
  titulo,
  extensoes,
  pastaInicial,
}: OpcoesArquivo): Promise<ItemEscolhido | null> {
  if (isTauri()) {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const caminho = await open({
      title: titulo,
      multiple: false,
      directory: false,
      defaultPath: pastaInicial,
      filters: [{ name: titulo, extensions: extensoes }],
    });
    return typeof caminho === 'string' ? doCaminho(caminho) : null;
  }
  const arquivos = await abrirSeletorDoNavegador((input) => {
    input.accept = extensoes.map((extensao) => `.${extensao}`).join(',');
  });
  const arquivo = arquivos?.[0];
  return arquivo ? { nome: arquivo.name, rotulo: arquivo.name } : null;
}

export async function escolherPasta({
  titulo,
  listarExtensoes,
}: OpcoesPasta): Promise<PastaEscolhida | null> {
  if (isTauri()) {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const caminho = await open({
      title: titulo,
      directory: true,
      multiple: false,
    });
    return typeof caminho === 'string' ? doCaminho(caminho) : null;
  }
  return pastaDoNavegador(listarExtensoes);
}

/** "Salvar como": no navegador, escolhe a pasta e mantém o nome sugerido. */
export async function escolherDestino({
  titulo,
  extensoes,
  nomeSugerido,
}: OpcoesDestino): Promise<ItemEscolhido | null> {
  if (isTauri()) {
    const { save } = await import('@tauri-apps/plugin-dialog');
    const caminho = await save({
      title: titulo,
      defaultPath: nomeSugerido,
      filters: [{ name: titulo, extensions: extensoes }],
    });
    return caminho ? doCaminho(caminho) : null;
  }
  const pasta = await pastaDoNavegador();
  return pasta
    ? { nome: nomeSugerido, rotulo: `${pasta.nome}\\${nomeSugerido}` }
    : null;
}
