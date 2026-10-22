import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  icon?: LucideIcon;
  iconPosition?: 'start' | 'end';
  children: ReactNode;
};

export function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icone,
  iconPosition = 'start',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  const icone = Icone && (
    <Icone size={size === 'sm' ? 14 : 16} aria-hidden="true" />
  );
  return (
    <button
      type={type}
      className={`ui-button ui-button--${variant} ui-button--${size} ${className}`.trim()}
      {...props}
    >
      {iconPosition === 'start' && icone}
      {children}
      {iconPosition === 'end' && icone}
    </button>
  );
}

type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  icon: LucideIcon;
  label: string;
  variant?: 'ghost' | 'danger' | 'soft';
  size?: 'sm' | 'md';
};

export function IconButton({
  icon: Icone,
  label,
  variant = 'ghost',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`ui-icon-button ui-icon-button--${variant} ui-icon-button--${size} ${className}`.trim()}
      {...props}
    >
      <Icone size={size === 'sm' ? 15 : 17} aria-hidden="true" />
    </button>
  );
}
