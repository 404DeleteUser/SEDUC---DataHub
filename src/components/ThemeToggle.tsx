import { Moon, Sun } from 'lucide-react';

import { IconButton } from './ui';

type ThemeToggleProps = {
  tema: 'dark' | 'light';
  onToggleTema: () => void;
};

function ThemeToggle({ tema, onToggleTema }: ThemeToggleProps) {
  const escuro = tema === 'dark';
  return (
    <IconButton
      icon={escuro ? Sun : Moon}
      label={escuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
      onClick={onToggleTema}
      className="theme-toggle"
    />
  );
}

export default ThemeToggle;
