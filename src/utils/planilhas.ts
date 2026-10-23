// Leitura de planilhas no navegador (xlsx, xls, csv) via SheetJS, carregada sob demanda.

const EXTENSOES_SUPORTADAS = ['xlsx', 'xls', 'csv'];

export type PlanilhaLida = {
  colunas: string[];
  /** Linhas de dados (sem o cabeçalho), na ordem das colunas originais. */
  linhas: unknown[][];
  /** Posição de cada coluna do cabeçalho original. */
  indicePorColuna: Record<string, number>;
};

/** CSV em UTF-8 ou, se não for UTF-8 válido, no Windows-1252 do Excel. */
function textoDoCsv(bytes: ArrayBuffer): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('windows-1252').decode(bytes);
  }
}

export async function lerPlanilha(arquivo: File): Promise<PlanilhaLida> {
  const extensao = arquivo.name.split('.').pop()?.toLowerCase() ?? '';
  if (!EXTENSOES_SUPORTADAS.includes(extensao)) {
    throw new Error(`Formato não suportado: ${arquivo.name}`);
  }
  const XLSX = await import('xlsx');
  const bytes = await arquivo.arrayBuffer();
  const workbook =
    extensao === 'csv'
      ? XLSX.read(textoDoCsv(bytes), { type: 'string' })
      : XLSX.read(bytes, { type: 'array' });
  const aba = workbook.SheetNames[0];
  const worksheet = aba ? workbook.Sheets[aba] : undefined;
  const linhas = worksheet
    ? XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
        header: 1,
        defval: '',
        blankrows: false,
      })
    : [];
  const [cabecalho, ...dados] = linhas;
  if (!Array.isArray(cabecalho)) {
    throw new Error(`Planilha sem cabeçalho: ${arquivo.name}`);
  }

  const indicePorColuna: Record<string, number> = {};
  cabecalho.forEach((celula, indice) => {
    const coluna = String(celula ?? '').trim();
    if (coluna && !(coluna in indicePorColuna))
      indicePorColuna[coluna] = indice;
  });
  const colunas = Object.keys(indicePorColuna);
  if (!colunas.length) {
    throw new Error(`Planilha sem cabeçalho: ${arquivo.name}`);
  }
  return { colunas, linhas: dados, indicePorColuna };
}

export async function lerColunas(arquivo: File): Promise<string[]> {
  return (await lerPlanilha(arquivo)).colunas;
}

export async function valoresDaColuna(
  arquivo: File,
  coluna: string
): Promise<unknown[]> {
  const { linhas, indicePorColuna } = await lerPlanilha(arquivo);
  const indice = indicePorColuna[coluna];
  if (indice === undefined) return [];
  return linhas.map((linha) => linha[indice] ?? '');
}
