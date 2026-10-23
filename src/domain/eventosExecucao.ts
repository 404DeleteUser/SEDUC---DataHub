// Eventos da execução (contrato v1, engine/contrato/EVENTOS.md), espelho de
// engine/datahub_engine/eventos.py. Os dois lados validam os mesmos exemplos.

type Comum = { v: 1; execucao: string; seq: number; ts: string };
type ArquivoDoEvento = { nome: string; caminho: string };

export type StatusFinal =
  'concluido' | 'concluido_com_avisos' | 'erro' | 'cancelado';

export type EventoDeExecucao = Comum &
  (
    | {
        tipo: 'execucao.inicio';
        nome: string;
        origem: 'processo' | 'ferramenta';
        usuario: string;
        maquina: string;
        entradas: ArquivoDoEvento[];
        saida: ArquivoDoEvento;
        etapas: {
          indice: number;
          ferramenta: string;
          parametros: Record<string, unknown>;
        }[];
      }
    | {
        tipo: 'entrada.lida';
        arquivo: string;
        abas: number;
        linhas: number;
        colunas: number;
      }
    | { tipo: 'etapa.inicio'; indice: number; ferramenta: string; nome: string }
    | { tipo: 'progresso'; percentual: number; mensagem: string }
    | {
        tipo: 'log';
        nivel: 'info' | 'aviso';
        mensagem: string;
        etapa?: number;
      }
    | {
        tipo: 'etapa.fim';
        indice: number;
        ferramenta: string;
        linhas_antes: number;
        linhas_depois: number;
        resumo: Record<string, number>;
        duracao_ms: number;
      }
    | { tipo: 'saida.gravada'; caminho: string; abas: number; linhas: number }
    | {
        tipo: 'execucao.fim';
        status: StatusFinal;
        duracao_ms: number;
        avisos: number;
        erro?: { mensagem: string; etapa?: number; detalhe?: string };
      }
  );

const TS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const STATUS: readonly string[] = [
  'concluido',
  'concluido_com_avisos',
  'erro',
  'cancelado',
];

type Objeto = Record<string, unknown>;
const ehObjeto = (valor: unknown): valor is Objeto =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor);
const inteiro = (valor: unknown, minimo = 0) =>
  Number.isInteger(valor) && (valor as number) >= minimo;
const texto = (valor: unknown) => typeof valor === 'string' && valor !== '';
const arquivo = (valor: unknown) =>
  ehObjeto(valor) && texto(valor.nome) && texto(valor.caminho);

function camposValidos(e: Objeto): boolean {
  switch (e.tipo) {
    case 'execucao.inicio':
      return (
        texto(e.nome) &&
        (e.origem === 'processo' || e.origem === 'ferramenta') &&
        typeof e.usuario === 'string' &&
        typeof e.maquina === 'string' &&
        Array.isArray(e.entradas) &&
        e.entradas.every(arquivo) &&
        arquivo(e.saida) &&
        Array.isArray(e.etapas) &&
        e.etapas.every(
          (etapa) =>
            ehObjeto(etapa) &&
            inteiro(etapa.indice) &&
            texto(etapa.ferramenta) &&
            ehObjeto(etapa.parametros)
        )
      );
    case 'entrada.lida':
      return (
        texto(e.arquivo) &&
        inteiro(e.abas) &&
        inteiro(e.linhas) &&
        inteiro(e.colunas)
      );
    case 'etapa.inicio':
      return inteiro(e.indice) && texto(e.ferramenta) && texto(e.nome);
    case 'progresso':
      return (
        inteiro(e.percentual) &&
        (e.percentual as number) <= 100 &&
        typeof e.mensagem === 'string'
      );
    case 'log':
      return (
        (e.nivel === 'info' || e.nivel === 'aviso') &&
        texto(e.mensagem) &&
        (e.etapa === undefined || inteiro(e.etapa))
      );
    case 'etapa.fim':
      return (
        inteiro(e.indice) &&
        texto(e.ferramenta) &&
        inteiro(e.linhas_antes) &&
        inteiro(e.linhas_depois) &&
        inteiro(e.duracao_ms) &&
        ehObjeto(e.resumo) &&
        Object.values(e.resumo).every((valor) => inteiro(valor))
      );
    case 'saida.gravada':
      return texto(e.caminho) && inteiro(e.abas) && inteiro(e.linhas);
    case 'execucao.fim':
      return (
        STATUS.includes(e.status as string) &&
        inteiro(e.duracao_ms) &&
        inteiro(e.avisos) &&
        (e.status === 'erro'
          ? ehObjeto(e.erro) && texto(e.erro.mensagem)
          : e.erro === undefined)
      );
    default:
      return false;
  }
}

/** Valida um evento recebido do motor (saída ao vivo ou arquivo de log). */
export function ehEventoDeExecucao(valor: unknown): valor is EventoDeExecucao {
  return (
    ehObjeto(valor) &&
    valor.v === 1 &&
    texto(valor.execucao) &&
    inteiro(valor.seq, 1) &&
    typeof valor.ts === 'string' &&
    TS.test(valor.ts) &&
    camposValidos(valor)
  );
}
