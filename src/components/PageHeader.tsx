import type { ReactNode } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export default function PageHeader({
  titulo,
  descricao,
  onVoltar,
  acao,
}: {
  titulo: string;
  descricao: string;
  onVoltar?: () => void;
  acao?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="min-w-0">
        <div className="page-breadcrumb">
          <span>DataHub</span>
          <ChevronRight size={12} aria-hidden="true" />
          <span>{titulo}</span>
        </div>
        <div className="flex items-center gap-3">
          {onVoltar && (
            <button
              type="button"
              onClick={onVoltar}
              className="icon-button"
              aria-label="Voltar"
            >
              <ArrowLeft size={19} />
            </button>
          )}
          <div className="min-w-0">
            <h1>{titulo}</h1>
            <p>{descricao}</p>
          </div>
        </div>
      </div>
      {acao && <div className="page-header-action">{acao}</div>}
    </header>
  );
}
export function ProcessSteps({ atual }: { atual: 1 | 2 }) {
  return (
    <ol className="process-steps" aria-label="Criação do processo">
      {['Arquivos e saída', 'Configuração do processo'].map((nome, indice) => (
        <li
          key={nome}
          aria-current={atual === indice + 1 ? 'step' : undefined}
          className={atual >= indice + 1 ? 'step-active' : ''}
        >
          <span>{String(indice + 1).padStart(2, '0')}</span>
          {nome}
        </li>
      ))}
    </ol>
  );
}
