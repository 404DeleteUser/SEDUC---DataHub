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

export const logsRecentes = [
  {
    id: 1,
    tipo: 'processo',
    referenciaId: 1,
    status: 'concluido',
    detalhe: '14.532 registros',
    duracao: '38s',
    horario: 'Hoje • 10:42',
  },
  {
    id: 2,
    tipo: 'processo',
    referenciaId: 4,
    status: 'concluido',
    detalhe: '82.417 registros',
    duracao: '7m 45s',
    horario: 'Hoje • 09:18',
  },
  {
    id: 3,
    tipo: 'processo',
    referenciaId: 2,
    status: 'atencao',
    detalhe: '27 divergências',
    duracao: '1m 12s',
    horario: 'Hoje • 08:51',
  },
  {
    id: 4,
    tipo: 'ferramenta',
    referenciaId: 'eliminar-duplicatas',
    status: 'concluido',
    detalhe: '412 duplicatas removidas',
    duracao: '10s',
    horario: 'Ontem • 17:35',
  },
  {
    id: 5,
    tipo: 'ferramenta',
    referenciaId: 'mesclar-planilhas',
    status: 'erro',
    detalhe: 'Arquivo inválido',
    duracao: '3s',
    horario: 'Ontem • 16:12',
  },
];
