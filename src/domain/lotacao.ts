// Planilha de lotação × organograma, sem React. Os dados das pessoas são
// pessoais: ficam só em memória e nunca são gravados nem registrados em log.
import { textoNormalizado } from './ferramentas';
import type { Pessoa } from '../types/lotacao';
import type { Setor } from '../types/organograma';
import type { PlanilhaLida } from '../utils/planilhas';

/** Colunas usadas da planilha (o cabeçalho é comparado sem caixa e acento). */
const COLUNAS = {
  lotacao: 'Lotacao',
  nome: 'Nome',
  email: 'EmailCompleto',
  funcao: 'Funcao',
  matricula: 'NumFunc',
} as const satisfies Record<keyof Pessoa, string>;

/**
 * Lotações escritas de outro jeito na planilha → nome no decreto.
 * Setores que não existem no decreto não entram aqui: ficam "fora do organograma".
 */
const EQUIVALENCIAS: Record<string, string> = {
  'SUPERINTENDÊNCIA DE ADMINISTRATIVA': 'Superintendência Administrativa',
  'UNIDADE SETORIAL DA PGE': 'Unidade Setorial PGE',
  'NÚCLEO DE INTELIGÊNCIA DE NEGÓCIO': 'Núcleo de Inteligência de Negócios',
  'COORDENADORIA DE EDUCAÇÃO PROFISSIONAL E TECNOLÓGICA':
    'Coordenadoria de Educação Profissional Tecnológica',
  'COORDENADORIA DE MONITORAMENTO DE PESSOAL':
    'Coordenadoria Monitoramento de Pessoal',
  'UNIDADE DE POLÍTICAS DE FORMAÇÃO CONTINUADA':
    'Unidade Políticas de Formação Continuada',
  'SUPERINTENDÊNCIA DE AVALIAÇÃO DA EDUCAÇÃO BÁSICA':
    'Superintendência de Avaliação de Educação Básica',
  'SUPERINTENDÊNCIA DE DESENVOLVIMENTO, APLICAÇÃO E SAÚDE E SEGURANÇA':
    'Superintendência de Desenvolvimento, Aplicação, Saúde e Segurança',
};

/** Chave de comparação: sem caixa, acento, pontuação, espaços e a sigla final ("- NGER"). */
function chaveDeSetor(nome: string): string {
  return textoNormalizado(nome.trim().replace(/\s+-\s+[A-Za-z]+$/, '')).replace(
    /[^a-z0-9]/g,
    ''
  );
}

function texto(valor: unknown): string {
  return String(valor ?? '').trim();
}

/** Converte as linhas da planilha em pessoas; acusa as colunas que faltam. */
export function lerPessoas(planilha: PlanilhaLida): Pessoa[] {
  const indicePorChave = new Map(
    planilha.colunas.map((coluna) => [
      textoNormalizado(coluna),
      planilha.indicePorColuna[coluna],
    ])
  );
  const faltando = Object.values(COLUNAS).filter(
    (coluna) => !indicePorChave.has(textoNormalizado(coluna))
  );
  if (faltando.length) {
    throw new Error(`A planilha não tem as colunas: ${faltando.join(', ')}.`);
  }
  const indice = (campo: keyof Pessoa) =>
    indicePorChave.get(textoNormalizado(COLUNAS[campo]))!;

  return planilha.linhas.flatMap((linha) => {
    const pessoa: Pessoa = {
      nome: texto(linha[indice('nome')]),
      lotacao: texto(linha[indice('lotacao')]),
      email: texto(linha[indice('email')]),
      funcao: texto(linha[indice('funcao')]),
      matricula: texto(linha[indice('matricula')]),
    };
    return pessoa.nome || pessoa.lotacao ? [pessoa] : [];
  });
}

/** Distância até a raiz e se o setor está dentro de uma diretoria regional. */
function posicaoNaArvore(setor: Setor, porId: ReadonlyMap<string, Setor>) {
  let profundidade = 0;
  let emDiretoria = false;
  for (
    let pai = setor.paiId ? porId.get(setor.paiId) : undefined;
    pai && profundidade < porId.size;
    pai = pai.paiId ? porId.get(pai.paiId) : undefined
  ) {
    profundidade += 1;
    if (pai.tipo === 'diretoria') emDiretoria = true;
  }
  return { profundidade, emDiretoria };
}

/**
 * Função que acha o setor do organograma para uma lotação da planilha.
 * Nome repetido (ex.: "Unidade de Assessoria"): vale o da sede, mais perto da raiz.
 */
export function criarLocalizadorDeSetor(
  setores: readonly Setor[]
): (lotacao: string) => string | undefined {
  const porId = new Map(setores.map((setor) => [setor.id, setor]));
  const candidatos = new Map<string, Setor[]>();
  for (const setor of setores) {
    const chave = chaveDeSetor(setor.nome);
    candidatos.set(chave, [...(candidatos.get(chave) ?? []), setor]);
  }
  const equivalencias = new Map(
    Object.entries(EQUIVALENCIAS).map(([planilha, decreto]) => [
      chaveDeSetor(planilha),
      chaveDeSetor(decreto),
    ])
  );

  return (lotacao) => {
    const chave = chaveDeSetor(lotacao);
    const lista = candidatos.get(equivalencias.get(chave) ?? chave);
    if (!lista?.length) return undefined;
    const ordenados = lista
      .map((setor) => ({ setor, ...posicaoNaArvore(setor, porId) }))
      .sort(
        (a, b) =>
          Number(a.emDiretoria) - Number(b.emDiretoria) ||
          a.profundidade - b.profundidade
      );
    return ordenados[0].setor.id;
  };
}

export type LotacaoAgrupada = {
  porSetor: Map<string, Pessoa[]>;
  /** Lotações sem setor no organograma, da mais frequente para a menos. */
  foraDoOrganograma: { lotacao: string; quantidade: number }[];
};

export function agruparPorSetor(
  pessoas: readonly Pessoa[],
  setores: readonly Setor[]
): LotacaoAgrupada {
  const localizar = criarLocalizadorDeSetor(setores);
  const porSetor = new Map<string, Pessoa[]>();
  const fora = new Map<string, number>();
  for (const pessoa of pessoas) {
    const id = localizar(pessoa.lotacao);
    if (id) porSetor.set(id, [...(porSetor.get(id) ?? []), pessoa]);
    else fora.set(pessoa.lotacao, (fora.get(pessoa.lotacao) ?? 0) + 1);
  }
  for (const [id, lista] of porSetor) {
    porSetor.set(
      id,
      [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    );
  }
  return {
    porSetor,
    foraDoOrganograma: [...fora]
      .map(([lotacao, quantidade]) => ({ lotacao, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade),
  };
}
