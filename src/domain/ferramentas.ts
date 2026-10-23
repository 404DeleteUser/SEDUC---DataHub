// Regras das ferramentas, sem React: padrões, validação e prévias calculadas
// a partir dos dados lidos das planilhas.
import type {
  CabecalhoArquivo,
  ErroParametro,
  FerramentaId,
  ModoDicionario,
  ParametrosFerramenta,
} from '../types/ferramenta';

const IDS_FERRAMENTA: readonly FerramentaId[] = [
  'zebrar-planilha',
  'eliminar-duplicatas',
  'dicionario',
  'mesclar-planilhas',
  'dividir-por',
];

export function ehFerramentaComParametros(id: string): id is FerramentaId {
  return (IDS_FERRAMENTA as readonly string[]).includes(id);
}

export function parametrosPadrao(id: FerramentaId): ParametrosFerramenta {
  switch (id) {
    case 'zebrar-planilha':
      return {
        ferramentaId: id,
        corCabecalho: '#1f4e79',
        corLinhaA: '#ffffff',
        corLinhaB: '#e8effc',
      };
    case 'eliminar-duplicatas':
      return { ferramentaId: id, colunasChave: [] };
    case 'dicionario':
      return { ferramentaId: id, coluna: '', modo: 'contem', valores: [''] };
    case 'mesclar-planilhas':
      return { ferramentaId: id, modo: 'vertical' };
    case 'dividir-por':
      return { ferramentaId: id, coluna: '' };
  }
}

/** Parâmetros da etapa, ou o padrão quando faltam ou são de outra ferramenta. */
export function normalizarParametros(
  ferramentaId: string,
  parametros: ParametrosFerramenta | undefined
): ParametrosFerramenta | undefined {
  if (!ehFerramentaComParametros(ferramentaId)) return undefined;
  return parametros?.ferramentaId === ferramentaId
    ? parametros
    : parametrosPadrao(ferramentaId);
}

/** Comparação de texto do app: sem diferenciar caixa, acentos e espaços nas pontas. */
export function textoNormalizado(valor: unknown): string {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function correspondeAoDicionario(
  valorCelula: unknown,
  valores: string[],
  modo: ModoDicionario
): boolean {
  const celula = textoNormalizado(valorCelula);
  return valores
    .map(textoNormalizado)
    .filter(Boolean)
    .some((valor) =>
      modo === 'exato' ? celula === valor : celula.includes(valor)
    );
}

export type DivergenciaCabecalho = {
  arquivo: string;
  faltando: string[];
  sobrando: string[];
};

/** Compara cada arquivo com o primeiro; ordem e caixa das colunas não importam. */
export function cabecalhosDivergentes(
  cabecalhos: CabecalhoArquivo[]
): DivergenciaCabecalho[] {
  const [referencia, ...demais] = cabecalhos;
  if (!referencia) return [];
  const chavesReferencia = new Set(referencia.colunas.map(textoNormalizado));
  return demais.flatMap((cabecalho) => {
    const chaves = new Set(cabecalho.colunas.map(textoNormalizado));
    const faltando = referencia.colunas.filter(
      (coluna) => !chaves.has(textoNormalizado(coluna))
    );
    const sobrando = cabecalho.colunas.filter(
      (coluna) => !chavesReferencia.has(textoNormalizado(coluna))
    );
    return faltando.length || sobrando.length
      ? [{ arquivo: cabecalho.arquivo, faltando, sobrando }]
      : [];
  });
}

const LIMITE_NOME_ABA = 31;

/** Nome de aba aceito pelo Excel: sem []:*?/\ e com no máximo 31 caracteres. */
export function nomeDeAba(texto: string): string {
  const limpo = texto
    .replace(/[[\]:*?/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, LIMITE_NOME_ABA)
    .trim();
  return limpo || 'Sem nome';
}

export type AbaPrevista = { nome: string; linhas: number };

const ABA_OUTROS = 'Outros';
/**
 * "Eliminar Duplicatas": linhas são duplicadas quando o valor é exatamente igual
 * (espaço, caixa e acento contam) em todas as colunas-chave. De cada grupo fica
 * uma linha sorteada, na posição em que estava.
 */
export function eliminarDuplicatas<Linha extends readonly unknown[]>(
  linhas: readonly Linha[],
  indicesChave: readonly number[],
  sortear: () => number = Math.random
): { linhas: Linha[]; removidas: number } {
  const grupos = new Map<string, number[]>();
  linhas.forEach((linha, posicao) => {
    const chave = JSON.stringify(
      indicesChave.map((indice) => String(linha[indice] ?? ''))
    );
    grupos.set(chave, [...(grupos.get(chave) ?? []), posicao]);
  });
  const mantidas = new Set<number>();
  for (const posicoes of grupos.values()) {
    const sorteada = Math.floor(sortear() * posicoes.length);
    mantidas.add(posicoes[Math.min(sorteada, posicoes.length - 1)]);
  }
  return {
    linhas: linhas.filter((_, posicao) => mantidas.has(posicao)),
    removidas: linhas.length - mantidas.size,
  };
}

export const ABA_CONSOLIDADA = 'Consolidada';

/**
 * Prévia de "Dividir por": uma aba por valor distinto da coluna (na ordem em que
 * aparece, agrupando caixa e acento) e "Outros" para as células vazias.
 */
export function abasDividirPor(valoresDaColuna: unknown[]): AbaPrevista[] {
  const grupos = new Map<string, AbaPrevista>();
  let vazios = 0;
  for (const valor of valoresDaColuna) {
    const chave = textoNormalizado(valor);
    if (!chave) {
      vazios += 1;
      continue;
    }
    const grupo = grupos.get(chave);
    if (grupo) grupo.linhas += 1;
    else grupos.set(chave, { nome: String(valor).trim(), linhas: 1 });
  }

  // "Consolidada" é a aba com todas as linhas: nenhum valor pode usar esse nome.
  const usados = new Set<string>([textoNormalizado(ABA_CONSOLIDADA)]);
  const unico = (nome: string) => {
    const base = nomeDeAba(nome);
    let candidato = base;
    for (let n = 2; usados.has(textoNormalizado(candidato)); n += 1) {
      const sufixo = ` (${n})`;
      candidato = `${base.slice(0, LIMITE_NOME_ABA - sufixo.length)}${sufixo}`;
    }
    usados.add(textoNormalizado(candidato));
    return candidato;
  };

  const abas = [...grupos.values()].map((grupo) => ({
    nome: unico(grupo.nome),
    linhas: grupo.linhas,
  }));
  if (vazios) {
    const nomeOutros = usados.has(textoNormalizado(ABA_OUTROS))
      ? unico(`${ABA_OUTROS} (vazios)`)
      : unico(ABA_OUTROS);
    abas.push({ nome: nomeOutros, linhas: vazios });
  }
  return abas;
}

const COR_HEX = /^#[0-9a-f]{6}$/i;

export type ContextoValidacao = {
  arquivos: number;
  cabecalhos?: CabecalhoArquivo[];
};

export function validarParametros(
  parametros: ParametrosFerramenta,
  contexto: ContextoValidacao
): ErroParametro[] {
  const erros: ErroParametro[] = [];
  switch (parametros.ferramentaId) {
    case 'zebrar-planilha': {
      const cores = [
        ['corCabecalho', parametros.corCabecalho, 'o cabeçalho'],
        ['corLinhaA', parametros.corLinhaA, 'as linhas ímpares'],
        ['corLinhaB', parametros.corLinhaB, 'as linhas pares'],
      ] as const;
      for (const [campo, cor, alvo] of cores) {
        if (!COR_HEX.test(cor))
          erros.push({
            campo,
            mensagem: `Escolha uma cor válida para ${alvo}.`,
          });
      }
      break;
    }
    case 'eliminar-duplicatas':
      if (!parametros.colunasChave.length)
        erros.push({
          campo: 'colunasChave',
          mensagem: 'Escolha ao menos uma coluna para identificar duplicatas.',
        });
      break;
    case 'dicionario':
      if (!parametros.coluna)
        erros.push({
          campo: 'coluna',
          mensagem: 'Escolha a coluna em que o dicionário será aplicado.',
        });
      if (!parametros.valores.some((valor) => valor.trim()))
        erros.push({
          campo: 'valores',
          mensagem: 'Informe ao menos um valor para manter.',
        });
      break;
    case 'mesclar-planilhas': {
      if (contexto.arquivos < 2) {
        erros.push({
          campo: 'arquivos',
          mensagem: 'Selecione ao menos dois arquivos para mesclar.',
        });
        break;
      }
      if (parametros.modo !== 'vertical' || !contexto.cabecalhos) break;
      const divergencias = cabecalhosDivergentes(contexto.cabecalhos);
      if (divergencias.length)
        erros.push({
          campo: 'arquivos',
          mensagem: `Os cabeçalhos não coincidem. ${divergencias
            .map(descreverDivergencia)
            .join(' ')} Ajuste as planilhas ou mescle como abas.`,
        });
      break;
    }
    case 'dividir-por':
      if (!parametros.coluna)
        erros.push({
          campo: 'coluna',
          mensagem: 'Escolha a coluna usada para criar as abas.',
        });
      break;
  }
  return erros;
}

function descreverDivergencia({
  arquivo,
  faltando,
  sobrando,
}: DivergenciaCabecalho) {
  const partes = [
    faltando.length ? `falta ${faltando.join(', ')}` : '',
    sobrando.length ? `sobra ${sobrando.join(', ')}` : '',
  ].filter(Boolean);
  return `${arquivo}: ${partes.join('; ')}.`;
}
