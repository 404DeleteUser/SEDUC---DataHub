import type { LucideIcon } from 'lucide-react';
import {
  Combine,
  CopyX,
  FileCode2,
  ListFilter,
  Rows3,
  Split,
} from 'lucide-react';
import type { FerramentaId } from '../types/ferramenta';

export type Ferramenta = {
  id: FerramentaId | 'script-python';
  nome: string;
  descricao: string;
  icone: LucideIcon;
  /** Cor de identidade da ferramenta (classe Tailwind), com ícone branco. */
  cor: string;
  /** Seleção genérica de colunas da etapa; as ferramentas atuais usam parâmetros próprios. */
  usaColunas: boolean;
};

/** Catálogo único de ferramentas: aba Ferramentas, Início e etapas de processo. */
export const ferramentasMock: Ferramenta[] = [
  {
    id: 'zebrar-planilha',
    nome: 'Zebrar Planilha',
    descricao:
      'Pinta o cabeçalho e alterna duas cores nas linhas para facilitar a leitura.',
    icone: Rows3,
    cor: 'bg-orange-600',
    usaColunas: false,
  },
  {
    id: 'eliminar-duplicatas',
    nome: 'Eliminar Duplicatas',
    descricao:
      'Remove linhas repetidas considerando as colunas escolhidas como chave.',
    icone: CopyX,
    cor: 'bg-red-600',
    usaColunas: false,
  },
  {
    id: 'dicionario',
    nome: 'Dicionário',
    descricao:
      'Mantém só as linhas em que a coluna contém, ou é igual a, um dos valores informados.',
    icone: ListFilter,
    cor: 'bg-emerald-600',
    usaColunas: false,
  },
  {
    id: 'mesclar-planilhas',
    nome: 'Mesclar Planilhas',
    descricao:
      'Empilha planilhas com o mesmo cabeçalho ou junta cada arquivo como uma aba.',
    icone: Combine,
    cor: 'bg-blue-600',
    usaColunas: false,
  },
  {
    id: 'dividir-por',
    nome: 'Dividir Por',
    descricao:
      'Mantém a aba consolidada e cria uma aba para cada valor da coluna escolhida.',
    icone: Split,
    cor: 'bg-violet-600',
    usaColunas: false,
  },
  {
    id: 'script-python',
    nome: 'Script Python conectado',
    descricao: 'Script existente conectado ao fluxo do processo.',
    icone: FileCode2,
    cor: 'bg-slate-600',
    usaColunas: false,
  },
];

/** Ferramentas que podem ser usadas avulsas ou adicionadas como etapa. */
export const ferramentasDoCatalogo = ferramentasMock.filter(
  (ferramenta): ferramenta is Ferramenta & { id: FerramentaId } =>
    ferramenta.id !== 'script-python'
);
