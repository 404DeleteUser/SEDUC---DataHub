import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react';
import { IconButton } from '../../components/ui';
import { ferramentasMock } from '../../mock/ferramentasMock';
import { descreverScript } from '../../domain/scriptPython';
import type { EtapaProcesso, ScriptPython } from '../../types/processo';

type EtapaOrdenavelProps = {
  etapa: EtapaProcesso;
  scriptPython: ScriptPython | null;
  removivel: boolean;
  indice: number;
  selecionada: boolean;
  onSelecionar: () => void;
  onRemover: () => void;
  primeira: boolean;
  ultima: boolean;
  onMover: (direcao: -1 | 1) => void;
};

function resumoDaEtapa(
  etapa: EtapaProcesso,
  descricao: string,
  scriptPython: ScriptPython | null
) {
  if (etapa.ferramentaId === 'script-python') {
    return scriptPython
      ? descreverScript(scriptPython)
      : 'Script não selecionado';
  }
  if (etapa.planilhas.length === 0) {
    return descricao;
  }
  return `${etapa.planilhas.length} planilha(s) selecionada(s)`;
}

/** Item do fluxo: arraste pelo grip (dnd-kit) ou pelas setas; seleção abre o detalhe. */
export function EtapaOrdenavel({
  etapa,
  scriptPython,
  removivel,
  indice,
  selecionada,
  onSelecionar,
  onRemover,
  primeira,
  ultima,
  onMover,
}: EtapaOrdenavelProps) {
  const ferramenta = ferramentasMock.find(
    (item) => item.id === etapa.ferramentaId
  );
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: etapa.id,
  });
  if (!ferramenta) {
    return null;
  }
  const Icone = ferramenta.icone;
  const numero = indice + 1;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const classes = [
    'config-step',
    selecionada ? 'is-selected' : '',
    isDragging ? 'is-dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li ref={setNodeRef} style={style} className={classes}>
      <button
        type="button"
        aria-label={'Reordenar etapa ' + numero}
        {...attributes}
        {...listeners}
        onClick={(event) => event.stopPropagation()}
        title="Arrastar etapa"
        className="config-step__grip"
      >
        <GripVertical size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onSelecionar}
        aria-pressed={selecionada}
        className="config-step__select"
      >
        <span className="config-step__number" aria-hidden="true">
          {numero}
        </span>
        <span className={`config-step__icon text-white ${ferramenta.cor}`}>
          <Icone size={16} aria-hidden="true" />
        </span>
        <span className="config-step__text">
          <span className="config-step__name">{ferramenta.nome}</span>
          <span className="config-step__summary">
            {resumoDaEtapa(etapa, ferramenta.descricao, scriptPython)}
          </span>
        </span>
      </button>
      <div className="config-step__order">
        <IconButton
          icon={ChevronUp}
          size="sm"
          label={'Mover etapa ' + numero + ' para cima'}
          disabled={primeira}
          onClick={() => onMover(-1)}
        />
        <IconButton
          icon={ChevronDown}
          size="sm"
          label={'Mover etapa ' + numero + ' para baixo'}
          disabled={ultima}
          onClick={() => onMover(1)}
        />
      </div>
      {removivel ? (
        <IconButton
          icon={Trash2}
          variant="danger"
          size="sm"
          label={'Remover etapa ' + numero}
          onClick={(event) => {
            event.stopPropagation();
            onRemover();
          }}
        />
      ) : (
        <span className="config-step__spacer" aria-hidden="true" />
      )}
    </li>
  );
}

/** Identificação da ferramenta no topo do detalhe. A cor é a identidade da ferramenta (mock). */
export function FerramentaCabecalho({
  ferramenta,
}: {
  ferramenta: (typeof ferramentasMock)[number];
}) {
  const Icone = ferramenta.icone;
  return (
    <div className="config-tool">
      <span className={`config-tool__icon text-white ${ferramenta.cor}`}>
        <Icone size={18} aria-hidden="true" />
      </span>
      <div className="config-tool__text">
        <p className="config-tool__name">{ferramenta.nome}</p>
        <p className="config-tool__description">{ferramenta.descricao}</p>
      </div>
    </div>
  );
}
