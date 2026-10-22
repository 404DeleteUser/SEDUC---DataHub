import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type SectionTitleProps = {
  as?: 'h2' | 'h3';
  id?: string;
  title: string;
  step?: number;
  icon?: LucideIcon;
  description?: ReactNode;
  aside?: ReactNode;
};

export function SectionTitle({
  as: Titulo = 'h2',
  id,
  title,
  step,
  icon: Icone,
  description,
  aside,
}: SectionTitleProps) {
  return (
    <div className="ui-section-title">
      <div className="ui-section-title__row">
        {step !== undefined ? (
          <span className="ui-section-title__step" aria-hidden="true">
            {step}
          </span>
        ) : (
          Icone && (
            <Icone
              size={17}
              aria-hidden="true"
              className="ui-section-title__icon"
            />
          )
        )}
        <Titulo id={id}>{title}</Titulo>
        {aside && <div className="ui-section-title__aside">{aside}</div>}
      </div>
      {description && (
        <p className="ui-section-title__description">{description}</p>
      )}
    </div>
  );
}

/** Termo único para tudo que ainda não é real (DESIGN.md › Linguagem). */
export function SimulationNotice({ detail }: { detail?: string }) {
  return (
    <span className="ui-simulation" title={detail}>
      <span className="ui-simulation__dot" aria-hidden="true" />
      Simulação
      {detail && <span className="sr-only">. {detail}</span>}
    </span>
  );
}

const rotulosStatus = {
  concluido: 'Concluído',
  atencao: 'Atenção',
  erro: 'Erro',
} as const;

export type StatusExecucao = keyof typeof rotulosStatus;

export function StatusText({ status }: { status: StatusExecucao }) {
  return (
    <span className={`ui-status ui-status--${status}`}>
      {rotulosStatus[status]}
    </span>
  );
}
