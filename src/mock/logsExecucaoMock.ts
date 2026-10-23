// Registro de logs fictício (Simulação): execuções no formato dos eventos do motor
// (contrato v1), para a página Logs de Execução até o app ler os .jsonl reais.
// Nomes de pessoas, arquivos e contagens são inventados; nenhum valor de célula aparece.
import type { EventoDeExecucao } from '../domain/eventosExecucao';
import type { ExecucaoRegistrada } from '../types/logExecucao';

type EventoSemComum = EventoDeExecucao extends infer E
  ? E extends EventoDeExecucao
    ? Omit<E, 'v' | 'execucao' | 'seq' | 'ts'>
    : never
  : never;

type LogFicticio = { nivel: 'info' | 'aviso'; mensagem: string };

type EtapaFicticia = {
  ferramenta: string;
  nome: string;
  parametros: Record<string, unknown>;
  linhasDepois?: number;
  resumo?: Record<string, number>;
  duracaoMs?: number;
  abasDepois?: number;
  logs?: LogFicticio[];
};

type Desfecho =
  | { tipo: 'concluido' }
  | { tipo: 'erro'; mensagem: string; naEtapa?: number }
  | { tipo: 'erro_na_leitura'; mensagem: string }
  | { tipo: 'cancelado'; naEtapa: number }
  | { tipo: 'sem_fim'; naEtapa: number };

type ExecucaoFicticia = {
  id: string;
  nome: string;
  origem: 'processo' | 'ferramenta';
  usuario: string;
  inicio: string;
  entradas: {
    caminho: string;
    linhas: number;
    colunas: number;
    abas?: number;
  }[];
  saida: string;
  etapas: EtapaFicticia[];
  desfecho: Desfecho;
  emAndamento?: boolean;
};

const PASTA_DE_LOGS = 'C:\\Users\\servidor\\AppData\\Roaming\\DataHub\\logs';
const MAQUINA = 'SEDUC-CPD-014';

function nomeDoArquivo(caminho: string) {
  return caminho.split('\\').pop() ?? caminho;
}

function gravador(execucao: string, inicio: string) {
  const eventos: EventoDeExecucao[] = [];
  let seq = 0;
  let instante = Date.parse(inicio);
  function emitir(campos: EventoSemComum, depoisDeMs = 0) {
    instante += depoisDeMs;
    seq += 1;
    eventos.push({
      v: 1,
      execucao,
      seq,
      ts: new Date(instante).toISOString(),
      ...campos,
    } as EventoDeExecucao);
  }
  return { eventos, emitir, decorrido: () => instante - Date.parse(inicio) };
}

function lerEntradas(
  ficticia: ExecucaoFicticia,
  emitir: ReturnType<typeof gravador>['emitir']
) {
  for (const entrada of ficticia.entradas) {
    const abas = entrada.abas ?? 1;
    const arquivo = nomeDoArquivo(entrada.caminho);
    emitir(
      {
        tipo: 'entrada.lida',
        arquivo,
        abas,
        linhas: entrada.linhas,
        colunas: entrada.colunas,
      },
      180
    );
    if (abas > 1) {
      emitir({
        tipo: 'log',
        nivel: 'aviso',
        mensagem: `Só a primeira aba de ${arquivo} foi lida (o arquivo tem ${abas}).`,
      });
    }
  }
}

/** Roda as etapas até `ate` (exclusivo); devolve as linhas e abas finais. */
function executarEtapas(
  ficticia: ExecucaoFicticia,
  emitir: ReturnType<typeof gravador>['emitir'],
  ate: number
) {
  let linhas = ficticia.entradas[0].linhas;
  let abas = 1;
  ficticia.etapas.slice(0, ate).forEach((etapa, indice) => {
    emitir(
      {
        tipo: 'etapa.inicio',
        indice,
        ferramenta: etapa.ferramenta,
        nome: etapa.nome,
      },
      20
    );
    emitir({
      tipo: 'progresso',
      percentual: Math.round(
        ((indice + 1) / (ficticia.etapas.length + 2)) * 100
      ),
      mensagem: etapa.nome,
    });
    for (const log of etapa.logs ?? [])
      emitir({ tipo: 'log', ...log, etapa: indice }, 40);
    const depois = etapa.linhasDepois ?? linhas;
    emitir(
      {
        tipo: 'etapa.fim',
        indice,
        ferramenta: etapa.ferramenta,
        linhas_antes: linhas,
        linhas_depois: depois,
        resumo: etapa.resumo ?? {},
        duracao_ms: etapa.duracaoMs ?? 300,
      },
      etapa.duracaoMs ?? 300
    );
    linhas = depois;
    abas = etapa.abasDepois ?? abas;
  });
  return { linhas, abas };
}

function iniciarEtapaSemFim(
  ficticia: ExecucaoFicticia,
  emitir: ReturnType<typeof gravador>['emitir'],
  indice: number
) {
  const etapa = ficticia.etapas[indice];
  emitir(
    {
      tipo: 'etapa.inicio',
      indice,
      ferramenta: etapa.ferramenta,
      nome: etapa.nome,
    },
    20
  );
}

function montar(ficticia: ExecucaoFicticia): ExecucaoRegistrada {
  const { eventos, emitir, decorrido } = gravador(ficticia.id, ficticia.inicio);
  const { desfecho } = ficticia;
  emitir({
    tipo: 'execucao.inicio',
    nome: ficticia.nome,
    origem: ficticia.origem,
    usuario: ficticia.usuario,
    maquina: MAQUINA,
    entradas: ficticia.entradas.map(({ caminho }) => ({
      nome: nomeDoArquivo(caminho),
      caminho,
    })),
    saida: { nome: nomeDoArquivo(ficticia.saida), caminho: ficticia.saida },
    etapas: ficticia.etapas.map(({ ferramenta, parametros }, indice) => ({
      indice,
      ferramenta,
      parametros,
    })),
  });

  if (desfecho.tipo !== 'erro_na_leitura') lerEntradas(ficticia, emitir);
  const ate =
    desfecho.tipo === 'concluido'
      ? ficticia.etapas.length
      : desfecho.tipo === 'erro_na_leitura'
        ? 0
        : (desfecho.naEtapa ?? 0);
  const final = executarEtapas(ficticia, emitir, ate);
  if (
    (desfecho.tipo === 'erro' && desfecho.naEtapa !== undefined) ||
    desfecho.tipo === 'sem_fim'
  ) {
    iniciarEtapaSemFim(ficticia, emitir, ate);
  }
  if (desfecho.tipo === 'concluido') {
    emitir(
      {
        tipo: 'saida.gravada',
        caminho: ficticia.saida,
        abas: final.abas,
        linhas: final.linhas,
      },
      420
    );
    emitir({ tipo: 'progresso', percentual: 100, mensagem: 'Concluído' });
  }
  if (desfecho.tipo !== 'sem_fim') {
    const avisos = eventos.filter(
      (e) => e.tipo === 'log' && e.nivel === 'aviso'
    ).length;
    const erro =
      desfecho.tipo === 'erro' || desfecho.tipo === 'erro_na_leitura'
        ? {
            mensagem: desfecho.mensagem,
            ...(desfecho.tipo === 'erro' && desfecho.naEtapa !== undefined
              ? { etapa: desfecho.naEtapa }
              : {}),
          }
        : undefined;
    const status =
      desfecho.tipo === 'concluido'
        ? avisos
          ? 'concluido_com_avisos'
          : 'concluido'
        : desfecho.tipo === 'cancelado'
          ? 'cancelado'
          : 'erro';
    emitir(
      {
        tipo: 'execucao.fim',
        status,
        duracao_ms: decorrido() + 30,
        avisos,
        ...(erro ? { erro } : {}),
      },
      30
    );
  }

  const data = ficticia.inicio.slice(0, 10);
  const hora = ficticia.inicio.slice(11, 19).replace(/:/g, '');
  return {
    arquivo: `${PASTA_DE_LOGS}\\${data}_${hora}_${ficticia.id}.jsonl`,
    eventos,
    emAndamento: ficticia.emAndamento,
  };
}

const ZEBRA = {
  corCabecalho: '#1f4e79',
  corLinhaA: '#ffffff',
  corLinhaB: '#e8effc',
};
const DADOS = 'C:\\Users\\servidor\\Documents\\DataHub';

const execucoesFicticias: ExecucaoFicticia[] = [
  {
    id: 'a1f3c09e2b71',
    nome: 'Cruzamento SEAP x Folha',
    origem: 'processo',
    usuario: 'ana.souza',
    inicio: '2026-10-22T14:05:12.000Z',
    entradas: [
      {
        caminho: `${DADOS}\\entrada\\seap_outubro.xlsx`,
        linhas: 14532,
        colunas: 18,
      },
      {
        caminho: `${DADOS}\\entrada\\folha_outubro.xlsx`,
        linhas: 14610,
        colunas: 18,
      },
    ],
    saida: `${DADOS}\\saida\\cruzamento_seap_folha.xlsx`,
    etapas: [
      {
        ferramenta: 'mesclar-planilhas',
        nome: 'Mesclar Planilhas',
        parametros: { modo: 'vertical' },
        linhasDepois: 29142,
        resumo: { arquivos_mesclados: 2, linhas: 29142 },
        duracaoMs: 2100,
      },
      {
        ferramenta: 'eliminar-duplicatas',
        nome: 'Eliminar Duplicatas',
        parametros: { colunasChave: ['Matrícula', 'CPF'] },
      },
    ],
    desfecho: { tipo: 'sem_fim', naEtapa: 1 },
    emAndamento: true,
  },
  {
    id: '7c2e91d04f5a',
    nome: 'Cruzamento SEAP x Folha',
    origem: 'processo',
    usuario: 'ana.souza',
    inicio: '2026-10-22T13:42:03.000Z',
    entradas: [
      {
        caminho: `${DADOS}\\entrada\\seap_setembro.xlsx`,
        linhas: 14498,
        colunas: 18,
      },
      {
        caminho: `${DADOS}\\entrada\\folha_setembro.xlsx`,
        linhas: 14533,
        colunas: 18,
      },
    ],
    saida: `${DADOS}\\saida\\cruzamento_setembro.xlsx`,
    etapas: [
      {
        ferramenta: 'mesclar-planilhas',
        nome: 'Mesclar Planilhas',
        parametros: { ferramentaId: 'mesclar-planilhas', modo: 'vertical' },
        linhasDepois: 29031,
        resumo: { arquivos_mesclados: 2, linhas: 29031 },
        duracaoMs: 2040,
      },
      {
        ferramenta: 'eliminar-duplicatas',
        nome: 'Eliminar Duplicatas',
        parametros: { colunasChave: ['Matrícula', 'CPF'] },
        linhasDepois: 14532,
        resumo: { duplicadas_removidas: 14499, grupos_com_duplicatas: 14466 },
        duracaoMs: 5310,
      },
      {
        ferramenta: 'dicionario',
        nome: 'Dicionário',
        parametros: {
          coluna: 'Cargo',
          modo: 'contem',
          valores: ['professor', 'técnico', 'apoio'],
        },
        linhasDepois: 12877,
        resumo: { linhas_mantidas: 12877, linhas_removidas: 1655 },
        duracaoMs: 1280,
      },
      {
        ferramenta: 'zebrar-planilha',
        nome: 'Zebrar Planilha',
        parametros: ZEBRA,
        resumo: { abas_formatadas: 1 },
        duracaoMs: 90,
      },
    ],
    desfecho: { tipo: 'concluido' },
  },
  {
    id: '3b8d0e6a91c4',
    nome: 'Verificação de Vigência',
    origem: 'processo',
    usuario: 'carlos.lima',
    inicio: '2026-10-22T11:51:40.000Z',
    entradas: [
      {
        caminho: `${DADOS}\\entrada\\contratos_vigentes.xlsx`,
        linhas: 3210,
        colunas: 12,
        abas: 3,
      },
    ],
    saida: `${DADOS}\\saida\\vigencia_outubro.xlsx`,
    etapas: [
      {
        ferramenta: 'dicionario',
        nome: 'Dicionário',
        parametros: { coluna: 'Situação', modo: 'exato', valores: ['ativo'] },
        linhasDepois: 2984,
        resumo: { linhas_mantidas: 2984, linhas_removidas: 226 },
        duracaoMs: 410,
      },
      {
        ferramenta: 'script-python',
        nome: 'Script Python conectado',
        parametros: {
          script: `${DADOS}\\scripts\\vigencia\\verificar_datas.py`,
          pasta: `${DADOS}\\scripts\\vigencia`,
        },
        resumo: { abas: 1 },
        duracaoMs: 3870,
        logs: [
          {
            nivel: 'info',
            mensagem: 'Conferindo as datas de término dos contratos',
          },
          { nivel: 'aviso', mensagem: '27 contratos sem data de término' },
        ],
      },
      {
        ferramenta: 'dividir-por',
        nome: 'Dividir Por',
        parametros: { coluna: 'DRE' },
        linhasDepois: 5968,
        abasDepois: 15,
        resumo: { abas_criadas: 14, linhas_sem_valor: 12 },
        duracaoMs: 960,
      },
    ],
    desfecho: { tipo: 'concluido' },
  },
  {
    id: 'e45f7a20c8d3',
    nome: 'Eliminar Duplicatas',
    origem: 'ferramenta',
    usuario: 'carlos.lima',
    inicio: '2026-10-22T10:18:27.000Z',
    entradas: [
      {
        caminho: `${DADOS}\\entrada\\inscricoes_seletivo.csv`,
        linhas: 8240,
        colunas: 9,
      },
    ],
    saida: `${DADOS}\\saida\\inscricoes_sem_duplicatas.xlsx`,
    etapas: [
      {
        ferramenta: 'eliminar-duplicatas',
        nome: 'Eliminar Duplicatas',
        parametros: { colunasChave: ['CPF'] },
        linhasDepois: 7828,
        resumo: { duplicadas_removidas: 412, grupos_com_duplicatas: 388 },
        duracaoMs: 1730,
      },
    ],
    desfecho: { tipo: 'concluido' },
  },
  {
    id: '9d1c4b7e0a62',
    nome: 'Lotação por DRE',
    origem: 'processo',
    usuario: 'ana.souza',
    inicio: '2026-10-21T19:33:08.000Z',
    entradas: [
      {
        caminho: `${DADOS}\\entrada\\lotacao_geral.xlsx`,
        linhas: 22916,
        colunas: 14,
      },
    ],
    saida: `${DADOS}\\saida\\lotacao_por_dre.xlsx`,
    etapas: [
      {
        ferramenta: 'eliminar-duplicatas',
        nome: 'Eliminar Duplicatas',
        parametros: { colunasChave: ['Matrícula'] },
        linhasDepois: 22874,
        resumo: { duplicadas_removidas: 42, grupos_com_duplicatas: 40 },
        duracaoMs: 4120,
      },
      {
        ferramenta: 'dividir-por',
        nome: 'Dividir Por',
        parametros: { coluna: 'DRE' },
      },
    ],
    desfecho: {
      tipo: 'erro',
      mensagem: 'A coluna DRE não existe na aba Lotação.',
      naEtapa: 1,
    },
  },
  {
    id: '58a0e3f1d79b',
    nome: 'Mesclar Planilhas',
    origem: 'ferramenta',
    usuario: 'marina.alves',
    inicio: '2026-10-21T16:02:55.000Z',
    entradas: [
      {
        caminho: `${DADOS}\\entrada\\escolas_norte.xlsx`,
        linhas: 1204,
        colunas: 7,
      },
      {
        caminho: `${DADOS}\\entrada\\escolas_sul.xlsx`,
        linhas: 1388,
        colunas: 7,
      },
    ],
    saida: `${DADOS}\\saida\\escolas_mt.xlsx`,
    etapas: [
      {
        ferramenta: 'mesclar-planilhas',
        nome: 'Mesclar Planilhas',
        parametros: { modo: 'abas' },
      },
    ],
    desfecho: { tipo: 'cancelado', naEtapa: 0 },
  },
  {
    id: 'c6e29b8a4f10',
    nome: 'Consolidação de Matrículas',
    origem: 'processo',
    usuario: 'marina.alves',
    inicio: '2026-10-20T12:47:19.000Z',
    entradas: [
      {
        caminho: `${DADOS}\\entrada\\matriculas_2026.xlsx`,
        linhas: 61230,
        colunas: 21,
      },
    ],
    saida: `${DADOS}\\saida\\matriculas_consolidadas.xlsx`,
    etapas: [
      {
        ferramenta: 'dicionario',
        nome: 'Dicionário',
        parametros: {
          coluna: 'Etapa de ensino',
          modo: 'contem',
          valores: ['fundamental', 'médio'],
        },
        linhasDepois: 54012,
        resumo: { linhas_mantidas: 54012, linhas_removidas: 7218 },
        duracaoMs: 6650,
      },
      {
        ferramenta: 'dividir-por',
        nome: 'Dividir Por',
        parametros: { coluna: 'Município' },
      },
    ],
    desfecho: { tipo: 'sem_fim', naEtapa: 1 },
  },
  {
    id: '1f7b3d95e2a8',
    nome: 'Verificação de Vigência',
    origem: 'processo',
    usuario: 'carlos.lima',
    inicio: '2026-10-17T13:10:44.000Z',
    entradas: [
      {
        caminho: `${DADOS}\\entrada\\contratos_setembro.xlsx`,
        linhas: 0,
        colunas: 0,
      },
    ],
    saida: `${DADOS}\\saida\\vigencia_setembro.xlsx`,
    etapas: [
      {
        ferramenta: 'dicionario',
        nome: 'Dicionário',
        parametros: { coluna: 'Situação', modo: 'exato', valores: ['ativo'] },
      },
    ],
    desfecho: {
      tipo: 'erro_na_leitura',
      mensagem: `Arquivo não encontrado: ${DADOS}\\entrada\\contratos_setembro.xlsx`,
    },
  },
  {
    id: '6a4c8e1b03d7',
    nome: 'Dividir Por',
    origem: 'ferramenta',
    usuario: 'ana.souza',
    inicio: '2026-10-15T17:25:31.000Z',
    entradas: [
      {
        caminho: `${DADOS}\\entrada\\servidores_ativos.xlsx`,
        linhas: 18453,
        colunas: 11,
      },
    ],
    saida: `${DADOS}\\saida\\servidores_por_municipio.xlsx`,
    etapas: [
      {
        ferramenta: 'dividir-por',
        nome: 'Dividir Por',
        parametros: { coluna: 'Município' },
        linhasDepois: 36906,
        abasDepois: 142,
        resumo: { abas_criadas: 141, linhas_sem_valor: 0 },
        duracaoMs: 71200,
      },
      {
        ferramenta: 'zebrar-planilha',
        nome: 'Zebrar Planilha',
        parametros: ZEBRA,
        resumo: { abas_formatadas: 142 },
        duracaoMs: 15400,
      },
    ],
    desfecho: { tipo: 'concluido' },
  },
];

/** Os .jsonl fictícios do registro, na ordem em que estariam na pasta (não ordenados). */
export const logsExecucaoMock: ExecucaoRegistrada[] =
  execucoesFicticias.map(montar);
