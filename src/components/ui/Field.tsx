import type { ReactNode } from 'react';

export type FieldControlProps = {
  id: string;
  required?: boolean;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
};

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: (controle: FieldControlProps) => ReactNode;
};

/** Rótulo + controle + dica + erro. O `id` é preservado: a validação foca campos por id. */
export function Field({
  id,
  label,
  required = false,
  hint,
  error,
  className = '',
  children,
}: FieldProps) {
  const dicaId = hint ? `${id}-dica` : undefined;
  const erroId = error ? `${id}-erro` : undefined;
  const descricao = [dicaId, erroId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`ui-field ${className}`.trim()}>
      <label htmlFor={id} className="ui-field__label">
        {label}
        {required && (
          <>
            <span className="ui-field__required" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(obrigatório)</span>
          </>
        )}
      </label>
      {children({
        id,
        required: required || undefined,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': descricao,
      })}
      {hint && (
        <p id={dicaId} className="ui-field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={erroId} className="ui-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
