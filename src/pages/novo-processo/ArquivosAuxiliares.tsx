import { Layers3, Plus, Trash2 } from 'lucide-react';
import type { AuxiliarProcesso } from '../../types/processo';
import {
  Button,
  FileField,
  IconButton,
  SectionTitle,
} from '../../components/ui';
import { LIMITE_AUXILIARES } from './constantes';

type ArquivosAuxiliaresProps = {
  idSecao: string;
  step: number;
  auxiliares: AuxiliarProcesso[];
  onAdicionar: () => void;
  onRemover: (id: number) => void;
  onAlterarNome: (id: number, nome: string) => void;
  onAlterarArquivo: (id: number, arquivo: File | null) => void;
};

export function ArquivosAuxiliares({
  idSecao,
  step,
  auxiliares,
  onAdicionar,
  onRemover,
  onAlterarNome,
  onAlterarArquivo,
}: ArquivosAuxiliaresProps) {
  const noLimite = auxiliares.length >= LIMITE_AUXILIARES;

  return (
    <section
      id={idSecao}
      tabIndex={-1}
      aria-labelledby={`${idSecao}-titulo`}
      className="ui-panel np-secao"
    >
      <SectionTitle
        id={`${idSecao}-titulo`}
        step={step}
        title="Arquivos auxiliares"
        description="Adicione até três bases auxiliares utilizadas durante o processo."
        aside={
          <span className="np-contagem">
            {auxiliares.length}/{LIMITE_AUXILIARES}
          </span>
        }
      />

      <div className="np-campos">
        {auxiliares.length === 0 ? (
          <div className="ui-empty">
            <Layers3 size={20} aria-hidden="true" />
            Nenhum arquivo auxiliar adicionado.
          </div>
        ) : (
          <ul className="np-auxiliares">
            {auxiliares.map((auxiliar, indice) => (
              <li key={auxiliar.id} className="np-auxiliar">
                <span className="np-auxiliar__indice" aria-hidden="true">
                  {indice + 1}
                </span>
                <input
                  autoComplete="off"
                  aria-label="Nome funcional do auxiliar"
                  value={auxiliar.nome}
                  onChange={(event) =>
                    onAlterarNome(auxiliar.id, event.target.value)
                  }
                  placeholder="Nome funcional"
                  className="ui-input np-auxiliar__nome"
                />
                <FileField
                  id={`auxiliar-${auxiliar.id}-arquivo`}
                  aria-label={`Arquivo do auxiliar ${indice + 1}`}
                  file={auxiliar.arquivo}
                  placeholder="Selecionar arquivo"
                  className="np-auxiliar__arquivo"
                  onChange={(arquivo) => onAlterarArquivo(auxiliar.id, arquivo)}
                />
                <IconButton
                  icon={Trash2}
                  variant="danger"
                  label="Remover auxiliar"
                  onClick={() => onRemover(auxiliar.id)}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="np-auxiliares__acao">
          <Button
            icon={Plus}
            onClick={onAdicionar}
            disabled={noLimite}
            aria-describedby={noLimite ? 'auxiliares-limite' : undefined}
          >
            Adicionar auxiliar
          </Button>
          {noLimite && (
            <span id="auxiliares-limite" className="np-dica">
              Limite de 3 auxiliares
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
