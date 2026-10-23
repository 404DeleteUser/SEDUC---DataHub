import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from 'react';
import { FolderOpen, Upload, type LucideIcon } from 'lucide-react';

type FileFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange' | 'value'
> & {
  id: string;
  file: File | null;
  placeholder: string;
  icon?: LucideIcon;
  onChange: (arquivo: File | null) => void;
};

/** Seletor de arquivo: o input nativo continua focável e anunciado; o rótulo visível mostra o arquivo. */
export function FileField({
  id,
  file,
  placeholder,
  icon: Icone = Upload,
  onChange,
  className = '',
  ...props
}: FileFieldProps) {
  return (
    <label
      className={`ui-file ${file ? 'ui-file--filled' : ''} ${className}`.trim()}
    >
      <Icone size={16} aria-hidden="true" />
      <span className="ui-file__name">{file ? file.name : placeholder}</span>
      <input
        id={id}
        name={props.name ?? id}
        type="file"
        className="sr-only"
        autoComplete="off"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        {...props}
      />
    </label>
  );
}

type ExplorerFieldProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'onClick' | 'value' | 'required'
> & {
  id: string;
  /** O que já foi escolhido (caminho ou nome); vazio mostra o placeholder. */
  value?: string;
  placeholder: string;
  icon?: LucideIcon;
  required?: boolean;
  onPick: () => void;
};

/** Campo que só abre o explorador de arquivos: não aceita digitar caminho. */
export function ExplorerField({
  id,
  value,
  placeholder,
  icon: Icone = FolderOpen,
  required: _required,
  onPick,
  className = '',
  ...props
}: ExplorerFieldProps) {
  return (
    <button
      type="button"
      id={id}
      className={`ui-file ui-file--button ${value ? 'ui-file--filled' : ''} ${className}`.trim()}
      title={value || undefined}
      onClick={onPick}
      {...props}
    >
      <Icone size={16} aria-hidden="true" />
      <span className="ui-file__name">{value || placeholder}</span>
    </button>
  );
}

type OptionCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
};

export function OptionCard({
  icon: Icone,
  title,
  description,
  selected,
  onSelect,
}: OptionCardProps) {
  return (
    <button
      type="button"
      className="ui-option"
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="ui-option__icon">
        <Icone size={18} aria-hidden="true" />
      </span>
      <span className="ui-option__text">
        <span className="ui-option__title">{title}</span>
        <span className="ui-option__description">{description}</span>
      </span>
    </button>
  );
}

type CheckboxProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (marcado: boolean) => void;
  disabled?: boolean;
};

export function Checkbox({
  label,
  description,
  checked,
  onChange,
  disabled,
}: CheckboxProps) {
  return (
    <label
      className={`ui-checkbox ${checked ? 'ui-checkbox--checked' : ''}`.trim()}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="ui-checkbox__text">
        <span className="ui-checkbox__label">{label}</span>
        {description && (
          <span className="ui-checkbox__description">{description}</span>
        )}
      </span>
    </label>
  );
}

type SelectableChipProps = {
  selected: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function SelectableChip({
  selected,
  onToggle,
  children,
}: SelectableChipProps) {
  return (
    <button
      type="button"
      className="ui-chip"
      aria-pressed={selected}
      onClick={onToggle}
    >
      {children}
    </button>
  );
}
