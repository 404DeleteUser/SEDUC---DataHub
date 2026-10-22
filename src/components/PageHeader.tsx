import type { ReactNode } from 'react';
import { ArrowLeft, Check } from 'lucide-react';

import { IconButton } from './ui';

type PageHeaderProps = {
  titulo: string;
  descricao: string;
  onVoltar?: () => void;
  acao?: ReactNode;
};

export default function PageHeader({
  titulo,
  descricao,
  onVoltar,
  acao,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-main">
        {onVoltar && (
          <IconButton
            icon={ArrowLeft}
            label="Voltar"
            onClick={onVoltar}
            className="page-header-back"
          />
        )}
        <div className="min-w-0">
          <h1>{titulo}</h1>
          <p>{descricao}</p>
        </div>
      </div>
      {acao && <div className="page-header-action">{acao}</div>}
    </header>
  );
}

const PASSOS_DO_PROCESSO = ['Arquivos e saída', 'Configuração do processo'];

export function ProcessSteps({ atual }: { atual: 1 | 2 }) {
  return (
    <ol className="process-steps" aria-label="Criação do processo">
      {PASSOS_DO_PROCESSO.map((nome, indice) => {
        const numero = indice + 1;
        const concluido = numero < atual;
        const corrente = numero === atual;
        const estado = concluido ? 'step-done' : corrente ? 'step-current' : '';
        return (
          <li
            key={nome}
            aria-current={corrente ? 'step' : undefined}
            className={`process-step ${estado}`.trim()}
          >
            <span className="process-step-marker" aria-hidden="true">
              {concluido ? <Check size={14} strokeWidth={2.5} /> : numero}
            </span>
            <span className="process-step-label">
              {nome}
              {concluido && <span className="sr-only"> (concluído)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
