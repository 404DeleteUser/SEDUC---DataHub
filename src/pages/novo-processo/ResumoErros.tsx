import { AlertCircle, ArrowDownRight } from 'lucide-react';
import { irParaCampo, type ErroCampo } from './constantes';

type ResumoErrosProps = {
  erros: ErroCampo[];
  rotuloDoCampo: (id: string) => string;
};

/**
 * Resumo das pendências no topo do formulário. Não usa role="alert": as mensagens
 * de cada campo já são anunciadas; aqui a região é apenas polite.
 */
export function ResumoErros({ erros, rotuloDoCampo }: ResumoErrosProps) {
  const total = erros.length;
  return (
    <div aria-live="polite" className="np-resumo-regiao">
      {total > 0 && (
        <div className="ui-alert ui-alert--error np-resumo">
          <AlertCircle size={18} aria-hidden="true" />
          <div className="np-resumo__corpo">
            <p className="np-resumo__titulo">
              {total === 1
                ? 'Revise 1 campo antes de continuar'
                : `Revise ${total} campos antes de continuar`}
            </p>
            <ul className="np-resumo__lista">
              {erros.map((erro) => (
                <li key={erro.id}>
                  <button
                    type="button"
                    className="np-resumo__link"
                    onClick={() => irParaCampo(erro.id)}
                  >
                    <ArrowDownRight size={14} aria-hidden="true" />
                    {rotuloDoCampo(erro.id)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
