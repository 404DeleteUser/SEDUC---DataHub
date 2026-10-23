import {
  CalendarDays,
  Database,
  FileCheck2,
  FileSpreadsheet,
} from 'lucide-react';
import { ferramentasDoCatalogo } from './ferramentasMock';

export const processosDestaque = [
  {
    id: 1,
    nome: 'Cruzamento SEAP x Folha',
    descricao:
      'Cruza informações entre bases e identifica possíveis divergências.',
    corIcone: 'bg-emerald-600 text-white',
    icone: FileSpreadsheet,
  },
  {
    id: 2,
    nome: 'Verificação de Vigência',
    descricao: 'Analisa contratos, lotações, vínculos e períodos de vigência.',
    corIcone: 'bg-violet-600 text-white',
    icone: CalendarDays,
  },
  {
    id: 3,
    nome: 'Consolidação de Relatórios',
    descricao: 'Consolida diferentes fontes de dados em um único relatório.',
    corIcone: 'bg-orange-600 text-white',
    icone: Database,
  },
  {
    id: 4,
    nome: 'Validação de Base Funcional',
    descricao: 'Executa verificações e identifica inconsistências na base.',
    corIcone: 'bg-cyan-600 text-white',
    icone: FileCheck2,
  },
];

/** Atalhos do Início: derivados do catálogo único de ferramentas. */
export const ferramentasMaisUsadas = (
  [
    'eliminar-duplicatas',
    'dicionario',
    'mesclar-planilhas',
    'zebrar-planilha',
    'dividir-por',
  ] as const
).flatMap((id) => {
  const ferramenta = ferramentasDoCatalogo.find((item) => item.id === id);
  return ferramenta
    ? [{ ...ferramenta, corIcone: `${ferramenta.cor} text-white` }]
    : [];
});
