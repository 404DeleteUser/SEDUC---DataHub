import {
  Combine,
  Eraser,
  FileCheck2,
  Paintbrush,
  Rows3,
  Trash2,
} from 'lucide-react';

export const ferramentasMock = [
  {
    id: 'juntar-planilhas',
    nome: 'Juntar Planilhas',
    descricao: 'Combina duas ou mais bases em uma única estrutura.',
    icone: Combine,
    cor: 'bg-blue-600',
    usaColunas: false,
  },

  {
    id: 'remover-duplicatas',
    nome: 'Remover Duplicatas',
    descricao: 'Remove registros repetidos com base nas colunas escolhidas.',
    icone: Trash2,
    cor: 'bg-red-600',
    usaColunas: true,
  },

  {
    id: 'remover-vazios',
    nome: 'Remover Vazios',
    descricao: 'Remove registros vazios considerando as colunas selecionadas.',
    icone: Eraser,
    cor: 'bg-rose-600',
    usaColunas: true,
  },

  {
    id: 'validar-dados',
    nome: 'Validar Dados',
    descricao: 'Executa verificações nas colunas selecionadas das bases.',
    icone: FileCheck2,
    cor: 'bg-emerald-600',
    usaColunas: true,
  },

  {
    id: 'formatar-planilha',
    nome: 'Formatar Planilha',
    descricao: 'Aplica formatação ao resultado do processamento.',
    icone: Paintbrush,
    cor: 'bg-violet-600',
    usaColunas: true,
  },

  {
    id: 'zebrar-planilha',
    nome: 'Zebrar Planilha',
    descricao: 'Aplica cores alternadas nas linhas para facilitar a leitura.',
    icone: Rows3,
    cor: 'bg-orange-600',
    usaColunas: false,
  },
];
