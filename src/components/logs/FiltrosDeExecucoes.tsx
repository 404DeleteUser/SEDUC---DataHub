import { Search } from 'lucide-react';
import { ROTULOS_DE_STATUS } from '../../domain/logsExecucao';
import type { StatusDaExecucao } from '../../types/logExecucao';
import { STATUS_DA_LISTA } from './constantes';

type Props = {
  busca: string;
  status: StatusDaExecucao | 'todos';
  origem: 'todas' | 'processo' | 'ferramenta';
  quantidade: number;
  aoBuscar: (valor: string) => void;
  aoFiltrarStatus: (valor: StatusDaExecucao | 'todos') => void;
  aoFiltrarOrigem: (valor: Props['origem']) => void;
};
export default function FiltrosDeExecucoes({
  busca,
  status,
  origem,
  quantidade,
  aoBuscar,
  aoFiltrarStatus,
  aoFiltrarOrigem,
}: Props) {
  return (
    <div className="logs-filtros">
      <label className="ferramentas-busca">
        <Search size={16} aria-hidden="true" />
        <span className="sr-only">Buscar execução</span>
        <input
          type="search"
          value={busca}
          placeholder="Buscar por processo ou arquivo…"
          onChange={(e) => aoBuscar(e.target.value)}
        />
      </label>
      <label>
        Status
        <select
          value={status}
          onChange={(e) => aoFiltrarStatus(e.target.value as Props['status'])}
        >
          <option value="todos">Todos</option>
          {STATUS_DA_LISTA.map((item) => (
            <option key={item} value={item}>
              {ROTULOS_DE_STATUS[item]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Origem
        <select
          value={origem}
          onChange={(e) => aoFiltrarOrigem(e.target.value as Props['origem'])}
        >
          <option value="todas">Todas</option>
          <option value="processo">Processos</option>
          <option value="ferramenta">Ferramentas</option>
        </select>
      </label>
      <span role="status">
        {quantidade} {quantidade === 1 ? 'execução' : 'execuções'}
      </span>
    </div>
  );
}
