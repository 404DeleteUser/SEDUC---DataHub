import { describe, expect, it } from 'vitest';
import {
  abasDividirPor,
  cabecalhosDivergentes,
  correspondeAoDicionario,
  eliminarDuplicatas,
  nomeDeAba,
  normalizarParametros,
  parametrosPadrao,
  textoNormalizado,
  validarParametros,
} from './ferramentas';
import type { FerramentaId } from '../types/ferramenta';

const ids: FerramentaId[] = [
  'zebrar-planilha',
  'eliminar-duplicatas',
  'dicionario',
  'mesclar-planilhas',
  'dividir-por',
];

describe('parametrosPadrao', () => {
  it.each(ids)('%s tem padrão do próprio tipo', (id) => {
    expect(parametrosPadrao(id).ferramentaId).toBe(id);
  });

  it('padrões não são compartilhados entre chamadas', () => {
    const a = parametrosPadrao('dicionario');
    const b = parametrosPadrao('dicionario');
    expect(a).not.toBe(b);
    if (a.ferramentaId === 'dicionario') a.valores.push('x');
    expect(b.ferramentaId === 'dicionario' && b.valores).toEqual(['']);
  });
});

describe('normalizarParametros', () => {
  it('mantém parâmetros válidos da mesma ferramenta', () => {
    const p = { ferramentaId: 'dividir-por' as const, coluna: 'Tipo' };
    expect(normalizarParametros('dividir-por', p)).toBe(p);
  });

  it('usa o padrão quando não há parâmetros ou eles são de outra ferramenta', () => {
    expect(normalizarParametros('mesclar-planilhas', undefined)).toEqual(
      parametrosPadrao('mesclar-planilhas')
    );
    expect(
      normalizarParametros('dividir-por', parametrosPadrao('dicionario'))
    ).toEqual(parametrosPadrao('dividir-por'));
  });

  it('devolve undefined para etapas sem formulário (script Python)', () => {
    expect(normalizarParametros('script-python', undefined)).toBeUndefined();
  });
});

describe('textoNormalizado', () => {
  it('ignora maiúsculas, acentos e espaços nas pontas', () => {
    expect(textoNormalizado('  Çelúlar ')).toBe('celular');
    expect(textoNormalizado(42)).toBe('42');
    expect(textoNormalizado(null)).toBe('');
  });
});

describe('correspondeAoDicionario', () => {
  it('modo contém: basta conter algum valor, sem diferenciar caixa e acento', () => {
    expect(
      correspondeAoDicionario('Notebook Dell', ['NOTEBOOK'], 'contem')
    ).toBe(true);
    expect(
      correspondeAoDicionario('iPad Pro', ['celular', 'ipad'], 'contem')
    ).toBe(true);
    expect(correspondeAoDicionario('Monitor', ['celular'], 'contem')).toBe(
      false
    );
  });

  it('modo exato: o valor inteiro precisa ser igual', () => {
    expect(correspondeAoDicionario('Celular', ['célular'], 'exato')).toBe(true);
    expect(
      correspondeAoDicionario('Celular antigo', ['celular'], 'exato')
    ).toBe(false);
  });

  it('ignora valores vazios do dicionário', () => {
    expect(correspondeAoDicionario('qualquer', ['', '  '], 'contem')).toBe(
      false
    );
  });
});

describe('cabecalhosDivergentes', () => {
  it('sem divergência quando todos os arquivos têm as mesmas colunas (ordem e caixa livres)', () => {
    expect(
      cabecalhosDivergentes([
        { arquivo: 'a.xlsx', colunas: ['CPF', 'Nome'] },
        { arquivo: 'b.xlsx', colunas: ['nome', 'cpf'] },
      ])
    ).toEqual([]);
  });

  it('aponta colunas faltando e sobrando em relação ao primeiro arquivo', () => {
    expect(
      cabecalhosDivergentes([
        { arquivo: 'a.xlsx', colunas: ['CPF', 'Nome', 'Lotação'] },
        { arquivo: 'b.xlsx', colunas: ['CPF', 'Nome', 'Cargo'] },
      ])
    ).toEqual([
      { arquivo: 'b.xlsx', faltando: ['Lotação'], sobrando: ['Cargo'] },
    ]);
  });
});

describe('nomeDeAba', () => {
  it('respeita as regras do Excel: sem []:*?/\\ e até 31 caracteres', () => {
    expect(nomeDeAba('A/B: [teste]?')).toBe('A B teste');
    expect(nomeDeAba('x'.repeat(40))).toHaveLength(31);
    expect(nomeDeAba('   ')).toBe('Sem nome');
  });
});

describe('abasDividirPor', () => {
  it('cria uma aba por valor distinto, na ordem em que aparecem, e "Outros" para vazios', () => {
    const abas = abasDividirPor([
      'Celular',
      'iPad',
      'celular',
      '',
      'Notebook',
      null,
      'IPAD',
    ]);
    expect(abas).toEqual([
      { nome: 'Celular', linhas: 2 },
      { nome: 'iPad', linhas: 2 },
      { nome: 'Notebook', linhas: 1 },
      { nome: 'Outros', linhas: 2 },
    ]);
  });

  it('nomes que colidem depois de sanitizados recebem sufixo', () => {
    expect(abasDividirPor(['A/B', 'A B']).map((aba) => aba.nome)).toEqual([
      'A B',
      'A B (2)',
    ]);
  });

  it('"Consolidada" é reservada para a aba que mantém todas as linhas', () => {
    expect(abasDividirPor(['Consolidada', 'x']).map((aba) => aba.nome)).toEqual(
      ['Consolidada (2)', 'x']
    );
  });

  it('o valor "Outros" de verdade não se mistura com a aba de vazios', () => {
    expect(abasDividirPor(['Outros', '']).map((aba) => aba.nome)).toEqual([
      'Outros',
      'Outros (vazios)',
    ]);
  });
});

describe('validarParametros', () => {
  it('zebrar exige cores hexadecimais válidas', () => {
    const p = {
      ferramentaId: 'zebrar-planilha' as const,
      corCabecalho: '#1f4e79',
      corLinhaA: '#ffffff',
      corLinhaB: 'azul',
    };
    expect(validarParametros(p, { arquivos: 1 })).toEqual([
      {
        campo: 'corLinhaB',
        mensagem: 'Escolha uma cor válida para as linhas pares.',
      },
    ]);
  });

  it('eliminar duplicatas exige ao menos uma coluna-chave', () => {
    expect(
      validarParametros(parametrosPadrao('eliminar-duplicatas'), {
        arquivos: 1,
      })
    ).toEqual([
      {
        campo: 'colunasChave',
        mensagem: 'Escolha ao menos uma coluna para identificar duplicatas.',
      },
    ]);
  });

  it('dicionário exige coluna e ao menos um valor preenchido', () => {
    expect(
      validarParametros(parametrosPadrao('dicionario'), { arquivos: 1 })
    ).toEqual([
      {
        campo: 'coluna',
        mensagem: 'Escolha a coluna em que o dicionário será aplicado.',
      },
      { campo: 'valores', mensagem: 'Informe ao menos um valor para manter.' },
    ]);
  });

  it('mesclar exige ao menos dois arquivos e, no modo vertical, cabeçalhos iguais', () => {
    const p = parametrosPadrao('mesclar-planilhas');
    expect(validarParametros(p, { arquivos: 1 })).toEqual([
      {
        campo: 'arquivos',
        mensagem: 'Selecione ao menos dois arquivos para mesclar.',
      },
    ]);
    expect(
      validarParametros(p, {
        arquivos: 2,
        cabecalhos: [
          { arquivo: 'a.xlsx', colunas: ['CPF'] },
          { arquivo: 'b.xlsx', colunas: ['Nome'] },
        ],
      })
    ).toEqual([
      {
        campo: 'arquivos',
        mensagem:
          'Os cabeçalhos não coincidem. b.xlsx: falta CPF; sobra Nome. Ajuste as planilhas ou mescle como abas.',
      },
    ]);
    expect(
      validarParametros(
        { ferramentaId: 'mesclar-planilhas', modo: 'abas' },
        {
          arquivos: 2,
          cabecalhos: [
            { arquivo: 'a', colunas: ['CPF'] },
            { arquivo: 'b', colunas: ['Nome'] },
          ],
        }
      )
    ).toEqual([]);
  });

  it('dividir por exige a coluna', () => {
    expect(
      validarParametros(parametrosPadrao('dividir-por'), { arquivos: 1 })
    ).toEqual([
      {
        campo: 'coluna',
        mensagem: 'Escolha a coluna usada para criar as abas.',
      },
    ]);
  });
});

describe('eliminarDuplicatas', () => {
  const primeira = () => 0;

  it('com duas colunas, só é duplicata se as duas forem iguais', () => {
    const iguais = [
      ['1234', 4],
      ['1234', 4],
    ];
    const diferentes = [
      ['1234', 4],
      ['1234', 3],
    ];
    expect(eliminarDuplicatas(iguais, [0, 1], primeira).removidas).toBe(1);
    expect(eliminarDuplicatas(diferentes, [0, 1], primeira).removidas).toBe(0);
    expect(eliminarDuplicatas(diferentes, [0], primeira).removidas).toBe(1);
  });

  it('compara o valor exato: espaço, caixa e acento diferenciam', () => {
    const linhas = [['Ana'], ['Ana '], ['ana'], ['Âna']];
    expect(eliminarDuplicatas(linhas, [0], primeira).removidas).toBe(0);
  });

  it('mantém uma linha sorteada de cada grupo, na ordem original', () => {
    const linhas = [
      ['a', 1],
      ['b', 2],
      ['a', 3],
      ['a', 4],
      ['a', 5],
    ];
    // 0,99 sorteia a última linha do grupo "a" (quatro ocorrências).
    const resultado = eliminarDuplicatas(linhas, [0], () => 0.99);
    expect(resultado.removidas).toBe(3);
    expect(resultado.linhas).toEqual([
      ['b', 2],
      ['a', 5],
    ]);
  });

  it('não altera as linhas recebidas', () => {
    const linhas = [['x'], ['x']];
    eliminarDuplicatas(linhas, [0], primeira);
    expect(linhas).toEqual([['x'], ['x']]);
  });
});
