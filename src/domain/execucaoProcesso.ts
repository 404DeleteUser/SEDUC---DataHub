// Roteiro da execução de um processo. O log não é configurável: cada etapa
// registra o log embutido da sua ferramenta, com os parâmetros da etapa.
import { normalizarParametros } from './ferramentas';
import { passosDaFerramenta } from './logFerramentas';
import { descreverScript } from './scriptPython';
import type { EtapaProcesso, ScriptPython } from '../types/processo';

export type PassoDaExecucao = { progresso: number; acao: string };

type EntradaDoRoteiro = {
  arquivos: { principal: string; complementar: string; saida: string };
  etapas: readonly EtapaProcesso[];
  scriptPython: ScriptPython | null;
  nomeDaFerramenta: (ferramentaId: string) => string;
};

function acoesDaEtapa(
  etapa: EtapaProcesso,
  { arquivos, scriptPython, nomeDaFerramenta }: EntradaDoRoteiro
): string[] {
  const nome = nomeDaFerramenta(etapa.ferramentaId);
  if (etapa.ferramentaId === 'script-python') {
    return [
      `${nome}: executando ${scriptPython ? descreverScript(scriptPython) : 'o script'}…`,
    ];
  }
  const parametros = normalizarParametros(etapa.ferramentaId, etapa.parametros);
  if (!parametros) return [`${nome}: executando…`];
  const nomesDosArquivos = [arquivos.principal, arquivos.complementar].filter(
    Boolean
  );
  return passosDaFerramenta(parametros, { arquivos: nomesDosArquivos }).map(
    (passo) => `${nome}: ${passo}`
  );
}

export function roteiroDaExecucao(
  entrada: EntradaDoRoteiro
): PassoDaExecucao[] {
  const { arquivos, etapas } = entrada;
  const acoes = [
    `Carregando a planilha principal (${arquivos.principal})…`,
    ...(arquivos.complementar
      ? [`Carregando a planilha complementar (${arquivos.complementar})…`]
      : []),
    ...etapas.flatMap((etapa) => acoesDaEtapa(etapa, entrada)),
    `Gravando o arquivo de saída (${arquivos.saida})…`,
    'Processo finalizado com sucesso.',
  ];
  return acoes.map((acao, indice) => ({
    acao,
    progresso: Math.round(((indice + 1) / acoes.length) * 100),
  }));
}
