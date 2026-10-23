import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { SimulationNotice } from '../components/ui/display';
import FiltrosDeExecucoes from '../components/logs/FiltrosDeExecucoes';
import ListaDeExecucoes from '../components/logs/ListaDeExecucoes';
import DetalheDaExecucao from '../components/logs/DetalheDaExecucao';
import {
  detalheDaExecucao,
  filtrarExecucoes,
  listarExecucoes,
} from '../domain/logsExecucao';
import { logsExecucaoMock } from '../mock/logsExecucaoMock';
import type { StatusDaExecucao } from '../types/logExecucao';

const resumos = listarExecucoes(logsExecucaoMock);

export default function LogsExecucao({
  execucaoInicial,
}: {
  /** Execução aberta a partir do Início; sem ela, a mais recente. */
  execucaoInicial?: string;
}) {
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState<StatusDaExecucao | 'todos'>('todos');
  const [origem, setOrigem] = useState<'todas' | 'processo' | 'ferramenta'>(
    'todas'
  );
  const [selecionada, setSelecionada] = useState(
    execucaoInicial ?? resumos[0]?.execucao ?? ''
  );
  const [copia, setCopia] = useState('');
  const filtrados = useMemo(
    () => filtrarExecucoes(resumos, { busca, status, origem }),
    [busca, status, origem]
  );
  const atual =
    filtrados.find((item) => item.execucao === selecionada) ?? filtrados[0];
  const registro =
    atual && logsExecucaoMock.find((item) => item.arquivo === atual.arquivo);
  const detalhe = registro ? detalheDaExecucao(registro) : null;

  function selecionar(execucao: string) {
    setSelecionada(execucao);
    setCopia('');
  }

  async function copiar(caminho: string) {
    try {
      await navigator.clipboard.writeText(caminho);
      setCopia('Caminho do log copiado.');
    } catch {
      setCopia('Não foi possível copiar o caminho do log.');
    }
  }

  function limpar() {
    setBusca('');
    setStatus('todos');
    setOrigem('todas');
  }

  return (
    <main id="conteudo-principal" tabIndex={-1} className="page-scroll">
      <PageHeader
        titulo="Logs de Execução"
        descricao="Histórico das execuções de processos e ferramentas neste computador. Cada log fica guardado por 90 dias."
        acao={
          <SimulationNotice detail="Registro de exemplo; nada foi executado." />
        }
      />
      <div className="page-content logs-pagina">
        <FiltrosDeExecucoes
          busca={busca}
          status={status}
          origem={origem}
          quantidade={filtrados.length}
          aoBuscar={setBusca}
          aoFiltrarStatus={setStatus}
          aoFiltrarOrigem={setOrigem}
        />
        <div className="logs-layout">
          <ListaDeExecucoes
            itens={filtrados}
            selecionada={atual?.execucao}
            aoSelecionar={selecionar}
            aoLimpar={limpar}
          />
          {detalhe && (
            <DetalheDaExecucao
              detalhe={detalhe}
              copia={copia}
              aoCopiar={copiar}
            />
          )}
        </div>
      </div>
    </main>
  );
}
