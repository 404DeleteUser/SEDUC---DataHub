// Logs de execução: resumo, detalhe e filtros a partir dos eventos do motor
// (contrato v1). Espelha engine/datahub_engine/registro.py (resumo da listagem) e
// engine/datahub_engine/relatorio.py (log legível). Nunca exibe valores de células:
// do Dicionário mostra só a quantidade de valores; o traceback (`erro.detalhe`) fica de fora.
import catalogo from '../generated/catalogo.json';
import type { EventoDeExecucao } from './eventosExecucao';
import { textoNormalizado } from './ferramentas';
import type {
  DetalheDaExecucao,
  EtapaDoDetalhe,
  ExecucaoRegistrada,
  FiltroDeExecucoes,
  ItemRotulado,
  ResumoDaExecucao,
  SituacaoDaEtapa,
  StatusDaExecucao,
} from '../types/logExecucao';

type Evento<T extends EventoDeExecucao['tipo']> = Extract<
  EventoDeExecucao,
  { tipo: T }
>;
type ParametroDoCatalogo = (typeof catalogo.ferramentas)[number]['parametros'][number];

const SCRIPT_PYTHON = 'script-python';

export const ROTULOS_DE_STATUS: Record<StatusDaExecucao, string> = {
  concluido: 'Concluído',
  concluido_com_avisos: 'Concluído com avisos',
  erro: 'Erro',
  cancelado: 'Cancelado',
  em_andamento: 'Em andamento',
  interrompido: 'Interrompido',
};

/** Mesmos rótulos do log legível (relatorio.py › ROTULOS_DO_RESUMO). */
const ROTULOS_DO_RESUMO: Record<string, string> = {
  duplicadas_removidas: 'Duplicadas removidas',
  grupos_com_duplicatas: 'Grupos com duplicatas',
  linhas_mantidas: 'Linhas mantidas',
  linhas_removidas: 'Linhas removidas',
  abas_criadas: 'Abas criadas',
  linhas_sem_valor: 'Linhas sem valor (em Outros)',
  arquivos_mesclados: 'Arquivos mesclados',
  abas: 'Total de abas',
  linhas: 'Total de linhas',
  abas_formatadas: 'Abas formatadas',
};

function doTipo<T extends EventoDeExecucao['tipo']>(
  eventos: EventoDeExecucao[],
  tipo: T
): Evento<T>[] {
  return eventos.filter((evento): evento is Evento<T> => evento.tipo === tipo);
}

function ultimo<T>(itens: T[]): T | undefined {
  return itens[itens.length - 1];
}

export function nomeDoArquivo(caminho: string): string {
  return caminho.split(/[\\/]/).pop() ?? caminho;
}

/** Igual a `registro.resumo_do_arquivo`; `null` se o arquivo não tem `execucao.inicio`. */
export function resumoDaExecucao({
  arquivo,
  eventos,
  emAndamento = false,
}: ExecucaoRegistrada): ResumoDaExecucao | null {
  const inicio = doTipo(eventos, 'execucao.inicio')[0];
  if (!inicio) return null;
  const fim = ultimo(doTipo(eventos, 'execucao.fim'));
  const semFim: StatusDaExecucao = emAndamento ? 'em_andamento' : 'interrompido';
  return {
    execucao: inicio.execucao,
    arquivo,
    nome: inicio.nome,
    origem: inicio.origem,
    usuario: inicio.usuario,
    inicio: inicio.ts,
    fim: fim?.ts ?? null,
    status: fim?.status ?? semFim,
    duracao_ms: fim?.duracao_ms ?? null,
    avisos: doTipo(eventos, 'log').filter((log) => log.nivel === 'aviso').length,
    etapas: inicio.etapas.length,
    saida: inicio.saida.caminho,
    erro: fim?.erro?.mensagem ?? null,
  };
}

/** Da mais recente para a mais antiga, como `registro.listar`. */
export function listarExecucoes(
  registros: ExecucaoRegistrada[]
): ResumoDaExecucao[] {
  return registros
    .map(resumoDaExecucao)
    .filter((resumo): resumo is ResumoDaExecucao => resumo !== null)
    .sort((a, b) => b.inicio.localeCompare(a.inicio));
}

export function filtrarExecucoes(
  resumos: ResumoDaExecucao[],
  { busca, status, origem }: FiltroDeExecucoes
): ResumoDaExecucao[] {
  const termo = textoNormalizado(busca);
  return resumos.filter(
    (resumo) =>
      (status === 'todos' || resumo.status === status) &&
      (origem === 'todas' || resumo.origem === origem) &&
      (!termo ||
        textoNormalizado(
          `${resumo.nome} ${resumo.usuario} ${nomeDoArquivo(resumo.saida)}`
        ).includes(termo))
  );
}

function valorDoParametro(parametro: ParametroDoCatalogo, valor: unknown): string {
  switch (parametro.tipo) {
    case 'lista_texto': {
      const itens = Array.isArray(valor) ? valor : [];
      const quantidade = itens.filter(
        (item) => typeof item === 'string' && item.trim()
      ).length;
      return quantidade === 1 ? '1 valor' : `${quantidade} valores`;
    }
    case 'colunas':
      return Array.isArray(valor) ? valor.join(', ') : '';
    case 'escolha':
      return (
        parametro.opcoes.find((opcao) => opcao.valor === valor)?.rotulo ??
        String(valor)
      );
    case 'cor':
      return String(valor).toUpperCase();
    default:
      return String(valor);
  }
}

/** Parâmetros pelos rótulos do catálogo; campos fora da declaração (ex.: ferramentaId) ficam de fora. */
export function parametrosLegiveis(
  ferramenta: string,
  parametros: Record<string, unknown>
): ItemRotulado[] {
  if (ferramenta === SCRIPT_PYTHON) {
    const script = parametros.script;
    return typeof script === 'string' && script
      ? [{ rotulo: 'Script', valor: nomeDoArquivo(script) }]
      : [];
  }
  const declarada = catalogo.ferramentas.find((item) => item.id === ferramenta);
  if (!declarada) return [];
  return declarada.parametros
    .filter((parametro) => parametro.nome in parametros)
    .map((parametro) => ({
      rotulo: parametro.rotulo,
      valor: valorDoParametro(parametro, parametros[parametro.nome]),
    }));
}

export function nomeDaFerramenta(ferramenta: string): string {
  return (
    catalogo.ferramentas.find((item) => item.id === ferramenta)?.nome ??
    ferramenta
  );
}

function rotuloDoResumo(chave: string): string {
  const texto = chave.replace(/_/g, ' ');
  return ROTULOS_DO_RESUMO[chave] ?? texto.charAt(0).toUpperCase() + texto.slice(1);
}

function situacaoDaEtapa(
  indice: number,
  iniciadas: Set<number>,
  finalizadas: Set<number>,
  etapaComErro: number | null
): SituacaoDaEtapa {
  if (finalizadas.has(indice)) return 'concluida';
  if (etapaComErro === indice) return 'falhou';
  return iniciadas.has(indice) ? 'em_andamento' : 'nao_executada';
}

function etapasDoDetalhe(
  eventos: EventoDeExecucao[],
  etapaComErro: number | null
): EtapaDoDetalhe[] {
  const planejadas = doTipo(eventos, 'execucao.inicio')[0]?.etapas ?? [];
  const iniciadas = doTipo(eventos, 'etapa.inicio');
  const finais = doTipo(eventos, 'etapa.fim');
  const indicesIniciados = new Set(iniciadas.map((etapa) => etapa.indice));
  const indicesFinalizados = new Set(finais.map((etapa) => etapa.indice));
  const logs = doTipo(eventos, 'log');
  return planejadas.map(({ indice, ferramenta, parametros }) => {
    const fim = finais.find((etapa) => etapa.indice === indice);
    return {
      indice,
      nome:
        iniciadas.find((etapa) => etapa.indice === indice)?.nome ??
        nomeDaFerramenta(ferramenta),
      situacao: situacaoDaEtapa(indice, indicesIniciados, indicesFinalizados, etapaComErro),
      parametros: parametrosLegiveis(ferramenta, parametros),
      linhasAntes: fim?.linhas_antes ?? null,
      linhasDepois: fim?.linhas_depois ?? null,
      resumo: Object.entries(fim?.resumo ?? {}).map(([chave, valor]) => ({
        rotulo: rotuloDoResumo(chave),
        valor: valor.toLocaleString('pt-BR'),
      })),
      duracaoMs: fim?.duracao_ms ?? null,
      logs: logs
        .filter((log) => log.etapa === indice)
        .map(({ nivel, mensagem }) => ({ nivel, mensagem })),
    };
  });
}

export function detalheDaExecucao(
  registro: ExecucaoRegistrada
): DetalheDaExecucao | null {
  const resumo = resumoDaExecucao(registro);
  if (!resumo) return null;
  const { eventos } = registro;
  const fim = ultimo(doTipo(eventos, 'execucao.fim'));
  const erro = fim?.erro
    ? { mensagem: fim.erro.mensagem, etapa: fim.erro.etapa ?? null }
    : null;
  const saida = doTipo(eventos, 'saida.gravada')[0];
  return {
    resumo,
    maquina: doTipo(eventos, 'execucao.inicio')[0].maquina,
    entradas: doTipo(eventos, 'entrada.lida').map(
      ({ arquivo, linhas, colunas, abas }) => ({ arquivo, linhas, colunas, abas })
    ),
    etapas: etapasDoDetalhe(eventos, erro?.etapa ?? null),
    avisosGerais: doTipo(eventos, 'log')
      .filter((log) => log.etapa === undefined)
      .map((log) => log.mensagem),
    saidaGravada: saida
      ? { nome: nomeDoArquivo(saida.caminho), abas: saida.abas, linhas: saida.linhas }
      : null,
    erro,
  };
}

/** Igual ao log legível: "0,4 s", "12 s", "2 min 05 s". */
export function formatarDuracao(ms: number | null): string {
  if (ms === null) return '—';
  if (ms < 10_000) return `${(ms / 1000).toFixed(1).replace('.', ',')} s`;
  const segundos = Math.round(ms / 1000);
  if (segundos < 60) return `${segundos} s`;
  const minutos = Math.floor(segundos / 60);
  return `${minutos} min ${String(segundos % 60).padStart(2, '0')} s`;
}

/** Data e hora locais (dd/mm/aaaa hh:mm) de um `ts` UTC do contrato. */
export function formatarDataHora(ts: string): string {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
