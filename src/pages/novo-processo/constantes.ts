import {
  CalendarDays,
  Database,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type IconeOpcao = {
  id: string;
  nome: string;
  icone: LucideIcon;
};

export const iconesDisponiveis: IconeOpcao[] = [
  { id: 'planilha', nome: 'Planilha', icone: FileSpreadsheet },
  { id: 'arquivo', nome: 'Arquivo', icone: FileText },
  { id: 'banco', nome: 'Banco de dados', icone: Database },
  { id: 'calendario', nome: 'Calendário', icone: CalendarDays },
  { id: 'usuarios', nome: 'Usuários', icone: Users },
  { id: 'validacao', nome: 'Validação', icone: ShieldCheck },
  { id: 'ferramenta', nome: 'Ferramenta', icone: Wrench },
];

/** Cores de identidade do processo (exceção permitida pelo DESIGN.md). */
export const coresPadrao = [
  '#059669',
  '#7c3aed',
  '#ea580c',
  '#0891b2',
  '#2563eb',
  '#dc2626',
  '#db2777',
];

export const LIMITE_AUXILIARES = 3;

export type ErroCampo = { id: string; mensagem: string };

/** Leva o usuário até o campo: rola o bloco do campo para o centro e foca o controle. */
export function irParaCampo(id: string) {
  const campo = document.getElementById(id);
  if (!campo) return;
  const bloco = campo.closest('.ui-field') ?? campo;
  bloco.scrollIntoView?.({ block: 'center', behavior: comportamentoRolagem() });
  campo.focus({ preventScroll: true });
}

export function comportamentoRolagem(): ScrollBehavior {
  const reduzir = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  return reduzir ? 'auto' : 'smooth';
}
