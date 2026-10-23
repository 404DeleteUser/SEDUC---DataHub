// Dados fictícios: nenhum nome, e-mail ou matrícula real.
import { describe, expect, it } from 'vitest';
import {
  agruparPorSetor,
  criarLocalizadorDeSetor,
  lerPessoas,
} from './lotacao';
import { setoresSeduc } from '../data/organogramaSeduc';
import type { PlanilhaLida } from '../utils/planilhas';
import type { Pessoa } from '../types/lotacao';

function planilha(colunas: string[], linhas: unknown[][]): PlanilhaLida {
  return {
    colunas,
    linhas,
    indicePorColuna: Object.fromEntries(colunas.map((c, i) => [c, i])),
  };
}

const CABECALHO = [
  'SerieLotacao',
  'Lotacao',
  'Sigla',
  'Nome',
  'EmailCompleto',
  'Funcao',
  'TipoProcesso',
  'NumFunc',
];

const pessoa = (nome: string, lotacao: string): Pessoa => ({
  nome,
  lotacao,
  matricula: '000',
  email: `${nome.toLowerCase()}@exemplo.test`,
  funcao: 'Analista',
});

describe('lerPessoas', () => {
  it('lê as colunas pelo nome do cabeçalho e ignora linhas vazias', () => {
    const pessoas = lerPessoas(
      planilha(CABECALHO, [
        [
          '1',
          'NÚCLEO DE FROTAS ',
          'NF',
          ' Fulana Teste ',
          'f@x.test',
          'Apoio',
          'X',
          123,
        ],
        ['', '', '', '', '', '', '', ''],
      ])
    );
    expect(pessoas).toEqual([
      {
        nome: 'Fulana Teste',
        lotacao: 'NÚCLEO DE FROTAS',
        email: 'f@x.test',
        funcao: 'Apoio',
        matricula: '123',
      },
    ]);
  });

  it('aceita cabeçalho com outra caixa e acento', () => {
    const cabecalho = ['LOTAÇÃO', 'nome', 'emailcompleto', 'FUNÇÃO', 'numfunc'];
    expect(
      lerPessoas(planilha(cabecalho, [['X', 'Y', 'z@x.test', 'W', '1']]))
    ).toHaveLength(1);
  });

  it('diz quais colunas faltam', () => {
    expect(() => lerPessoas(planilha(['Lotacao', 'Nome'], []))).toThrow(
      'A planilha não tem as colunas: EmailCompleto, Funcao, NumFunc.'
    );
  });
});

describe('criarLocalizadorDeSetor', () => {
  const localizar = criarLocalizadorDeSetor(setoresSeduc);
  const nomeDe = (lotacao: string) =>
    setoresSeduc.find((setor) => setor.id === localizar(lotacao))?.nome;

  it('ignora acento, caixa, hífen, espaços e a sigla do decreto', () => {
    expect(nomeDe('NUCLEO DE INFORMACOES ESTATISTICAS')).toBe(
      'Núcleo de Informações Estatísticas'
    );
    expect(nomeDe('NÚCLEO DE GESTÃO ESTRATÉGICA PARA RESULTADOS ')).toBe(
      'Núcleo de Gestão Estratégica para Resultados - NGER'
    );
    expect(
      nomeDe(
        'SUPERINTENDÊNCIA DE ESCOLAS ESTADUAIS MILITARES E CÍVICO-MILITARES'
      )
    ).toBe(
      'Superintendência de Escolas Estaduais Militares e Cívico Militares'
    );
  });

  it('usa as equivalências para nomes escritos de outro jeito', () => {
    expect(nomeDe('SUPERINTENDÊNCIA DE ADMINISTRATIVA')).toBe(
      'Superintendência Administrativa'
    );
    expect(nomeDe('UNIDADE SETORIAL DA PGE')).toBe('Unidade Setorial PGE');
    expect(
      nomeDe(
        'SUPERINTENDÊNCIA DE DESENVOLVIMENTO, APLICAÇÃO E SAÚDE E SEGURANÇA'
      )
    ).toBe('Superintendência de Desenvolvimento, Aplicação, Saúde e Segurança');
  });

  it('todas as equivalências apontam para um setor do decreto', () => {
    for (const lotacao of [
      'SUPERINTENDÊNCIA DE ADMINISTRATIVA',
      'UNIDADE SETORIAL DA PGE',
      'NÚCLEO DE INTELIGÊNCIA DE NEGÓCIO',
      'COORDENADORIA DE EDUCAÇÃO PROFISSIONAL E TECNOLÓGICA',
      'COORDENADORIA DE MONITORAMENTO DE PESSOAL',
      'UNIDADE DE POLÍTICAS DE FORMAÇÃO CONTINUADA',
      'SUPERINTENDÊNCIA DE AVALIAÇÃO DA EDUCAÇÃO BÁSICA',
      'SUPERINTENDÊNCIA DE DESENVOLVIMENTO, APLICAÇÃO E SAÚDE E SEGURANÇA',
    ]) {
      expect(localizar(lotacao), lotacao).toBeDefined();
    }
  });

  it('nome repetido: fica o setor da sede, fora das diretorias regionais', () => {
    expect(localizar('UNIDADE DE ASSESSORIA')).toBe(
      'unidade-de-assessoria--gabinete-do-secretario-de-estado-de-educacao'
    );
  });

  it('não inventa setor que não está no decreto', () => {
    expect(
      localizar('UNIDADE DE GESTÃO DE EMENDAS PARLAMENTARES')
    ).toBeUndefined();
  });
});

describe('agruparPorSetor', () => {
  it('agrupa por setor em ordem alfabética e lista o que ficou de fora', () => {
    const { porSetor, foraDoOrganograma } = agruparPorSetor(
      [
        pessoa('Bruna', 'NÚCLEO DE FROTAS'),
        pessoa('Ana', 'Núcleo de Frotas'),
        pessoa('Caio', 'SETOR INEXISTENTE'),
        pessoa('Davi', 'SETOR INEXISTENTE'),
        pessoa('Eva', 'OUTRO INEXISTENTE'),
      ],
      setoresSeduc
    );
    expect(porSetor.get('nucleo-de-frotas')?.map((p) => p.nome)).toEqual([
      'Ana',
      'Bruna',
    ]);
    expect(foraDoOrganograma).toEqual([
      { lotacao: 'SETOR INEXISTENTE', quantidade: 2 },
      { lotacao: 'OUTRO INEXISTENTE', quantidade: 1 },
    ]);
  });
});
