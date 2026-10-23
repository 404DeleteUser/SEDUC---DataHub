import { Moon, Sun } from 'lucide-react';

type ThemeToggleProps = {
  tema: 'dark' | 'light';
  onToggleTema: () => void;
  /** Sidebar recolhida: mostra só o ícone (o texto fica para leitores de tela). */
  compacto?: boolean;
};

/** Alternador de tema global. Fica isolado para poder migrar para uma titlebar customizada. */
function ThemeToggle({
  tema,
  onToggleTema,
  compacto = false,
}: ThemeToggleProps) {
  const escuro = tema === 'dark';
  const Icone = escuro ? Sun : Moon;
  const rotulo = escuro ? 'Ativar modo claro' : 'Ativar modo escuro';
  return (
    <button
      type="button"
      className="nav-item theme-toggle"
      onClick={onToggleTema}
      title={compacto ? rotulo : undefined}
    >
      <Icone size={18} aria-hidden="true" />
      <span className={compacto ? 'sr-only' : 'nav-item-label'}>{rotulo}</span>
    </button>
  );
}

export default ThemeToggle;
