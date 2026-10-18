import { Moon, Sun } from 'lucide-react';

type ThemeToggleProps = {
  tema: 'dark' | 'light';
  onToggleTema: () => void;
};

function ThemeToggle({
  tema,
  onToggleTema,
}: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggleTema}
      title={
        tema === 'dark'
          ? 'Ativar modo claro'
          : 'Ativar modo escuro'
      }
      aria-label={
        tema === 'dark'
          ? 'Ativar modo claro'
          : 'Ativar modo escuro'
      }
      className="
        fixed
        top-4
        right-4
        z-[100]
        w-9
        h-9
        flex
        items-center
        justify-center
        rounded-md
        border
        border-[var(--border)]
        bg-[var(--bg-card)]
        text-[var(--window-control)]
        hover:bg-[var(--window-control-hover)]
        hover:text-[var(--text-primary)]
        transition-colors
      "
    >
      {tema === 'dark' ? (
        <Sun size={17} />
      ) : (
        <Moon size={17} />
      )}
    </button>
  );
}

export default ThemeToggle;