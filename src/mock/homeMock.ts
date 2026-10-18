import {
  CalendarDays,
  Database,
  FileCheck2,
  FileSpreadsheet,
  Layers3,
  Table2,
  Trash2,
  WandSparkles,
  Wrench,
} from "lucide-react";


export const processosDestaque = [
  {
    id: 1,
    nome: "Cruzamento SEAP x Folha",
    descricao:
      "Cruza informações entre bases e identifica possíveis divergências.",
    corIcone: "bg-emerald-600 text-white",
    icone: FileSpreadsheet,
  },
  {
    id: 2,
    nome: "Verificação de Vigência",
    descricao:
      "Analisa contratos, lotações, vínculos e períodos de vigência.",
    corIcone: "bg-violet-600 text-white",
    icone: CalendarDays,
  },
  {
    id: 3,
    nome: "Consolidação de Relatórios",
    descricao:
      "Consolida diferentes fontes de dados em um único relatório.",
    corIcone: "bg-orange-600 text-white",
    icone: Database,
  },
  {
    id: 4,
    nome: "Validação de Base Funcional",
    descricao:
      "Executa verificações e identifica inconsistências na base.",
    corIcone: "bg-cyan-600 text-white",
    icone: FileCheck2,
  },
];

export const ferramentasMaisUsadas = [
  {
    id: 1,
    nome: "Limpeza de Dados",
    descricao: "Remove valores inválidos e inconsistências simples.",
    corIcone: "bg-cyan-600 text-white",
    icone: WandSparkles,
  },
  {
    id: 2,
    nome: "Remover Duplicatas",
    descricao: "Localiza e remove registros duplicados.",
    corIcone: "bg-red-600 text-white",
    icone: Trash2,
  },
  {
    id: 3,
    nome: "Juntar Planilhas",
    descricao: "Combina múltiplas planilhas em uma única base.",
    corIcone: "bg-blue-600 text-white",
    icone: Layers3,
  },
  {
    id: 4,
    nome: "Zebrar Planilha",
    descricao: "Aplica formatação alternada para facilitar a leitura.",
    corIcone: "bg-indigo-600 text-white",
    icone: Table2,
  },
  {
    id: 5,
    nome: "Formatar CPF",
    descricao: "Padroniza valores e corrige a formatação de CPFs.",
    corIcone: "bg-amber-600 text-white",
    icone: Wrench,
  },
  {
    id: 6,
    nome: "Padronizar Datas",
    descricao: "Converte datas para um formato definido.",
    corIcone: "bg-violet-600 text-white",
    icone: CalendarDays,
  },
  {
    id: 7,
    nome: "Remover Vazios",
    descricao: "Remove linhas e campos sem informações válidas.",
    corIcone: "bg-rose-600 text-white",
    icone: Trash2,
  },
  {
    id: 8,
    nome: "Converter Arquivo",
    descricao: "Converte planilhas entre formatos compatíveis.",
    corIcone: "bg-teal-600 text-white",
    icone: FileSpreadsheet,
  },
];

export const logsRecentes = [
  {
    id: 1,
    tipo: "processo",
    referenciaId: 1,
    status: "concluido",
    detalhe: "14.532 registros",
    duracao: "38s",
    horario: "Hoje • 10:42",
  },
  {
    id: 2,
    tipo: "processo",
    referenciaId: 4,
    status: "concluido",
    detalhe: "82.417 registros",
    duracao: "7m 45s",
    horario: "Hoje • 09:18",
  },
  {
    id: 3,
    tipo: "processo",
    referenciaId: 2,
    status: "atencao",
    detalhe: "27 divergências",
    duracao: "1m 12s",
    horario: "Hoje • 08:51",
  },
  {
    id: 4,
    tipo: "ferramenta",
    referenciaId: 2,
    status: "concluido",
    detalhe: "412 duplicatas removidas",
    duracao: "10s",
    horario: "Ontem • 17:35",
  },
  {
    id: 5,
    tipo: "ferramenta",
    referenciaId: 3,
    status: "erro",
    detalhe: "Arquivo inválido",
    duracao: "3s",
    horario: "Ontem • 16:12",
  },
];