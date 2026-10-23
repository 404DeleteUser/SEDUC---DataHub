import { describe, expect, it } from 'vitest';
import {
  descricaoCurtaDaExecucao,
  detalheDaExecucao,
  filtrarExecucoes,
  formatarDataCurta,
  formatarDataHora,
  formatarDuracao,
  listarExecucoes,
  parametrosLegiveis,
  resumoDaExecucao,
} from './logsExecucao';
import type { EventoDeExecucao } from './eventosExecucao';
import { logsExecucaoMock } from '../mock/logsExecucaoMock';
import type { ExecucaoRegistrada } from '../types/logExecucao';

const ts = '2026-10-22T14:05:12.000Z';
function evento<T extends EventoDeExecucao['tipo']>(
  tipo: T,
  campos: Omit<
    Extract<EventoDeExecucao, { tipo: T }>,
    'v' | 'execucao' | 'seq' | 'ts' | 'tipo'
  >,
  seq = 1
): Extract<EventoDeExecucao, { tipo: T }> {
  return { v: 1, execucao: 'exec-1', seq, ts, ...campos, tipo } as Extract<
    EventoDeExecucao,
    { tipo: T }
  >;
}
const inicio = (
  etapas: {
    indice: number;
    ferramenta: string;
    parametros: Record<string, unknown>;
  }[] = []
) =>
  evento('execucao.inicio', {
    nome: 'Auditoria Ágil',
    origem: 'processo',
    usuario: 'José.Silva',
    maquina: 'PC-01',
    entradas: [{ nome: 'base.xlsx', caminho: 'C:\\dados\\base.xlsx' }],
    saida: { nome: 'resultado.xlsx', caminho: 'C:\\saida\\resultado.xlsx' },
    etapas,
  });
const registro = (
  eventos: EventoDeExecucao[],
  arquivo = 'log.jsonl',
  emAndamento = false
): ExecucaoRegistrada => ({ arquivo, eventos, emAndamento });
const etapa = (
  indice: number,
  ferramenta = 'eliminar-duplicatas',
  parametros: Record<string, unknown> = {}
) => ({ indice, ferramenta, parametros });

describe('logs de execução: resumo e filtros', () => {
  it('resume os mesmos campos e semântica de registro.resumo_do_arquivo', () => {
    expect(resumoDaExecucao(registro([]))).toBeNull();
    const ini = inicio([etapa(0), etapa(1)]);
    const eventos: EventoDeExecucao[] = [
      ini,
      evento('log', { nivel: 'info', mensagem: 'informação' }, 2),
      evento('log', { nivel: 'aviso', mensagem: 'atenção' }, 3),
      evento(
        'execucao.fim',
        {
          status: 'erro',
          duracao_ms: 321,
          avisos: 1,
          erro: { mensagem: 'falhou' },
        },
        4
      ),
    ];
    expect(resumoDaExecucao(registro(eventos, 'arquivo.jsonl'))).toEqual({
      execucao: 'exec-1',
      arquivo: 'arquivo.jsonl',
      nome: 'Auditoria Ágil',
      origem: 'processo',
      usuario: 'José.Silva',
      inicio: ts,
      fim: ts,
      status: 'erro',
      duracao_ms: 321,
      avisos: 1,
      etapas: 2,
      saida: 'C:\\saida\\resultado.xlsx',
      erro: 'falhou',
    });
    expect(resumoDaExecucao(registro([ini]))).toMatchObject({
      status: 'interrompido',
      fim: null,
      duracao_ms: null,
    });
    expect(
      resumoDaExecucao({ ...registro([ini]), emAndamento: true })
    ).toMatchObject({ status: 'em_andamento', fim: null, duracao_ms: null });
  });

  it('ordena por início decrescente e descarta registros sem início', () => {
    const maisAntigo = {
      ...inicio(),
      ts: '2026-10-20T00:00:00.000Z',
    } as EventoDeExecucao;
    const recente = {
      ...inicio(),
      execucao: 'recente',
      ts: '2026-10-23T00:00:00.000Z',
    } as EventoDeExecucao;
    expect(
      listarExecucoes([
        registro([maisAntigo]),
        registro([]),
        registro([recente]),
      ]).map((r) => r.execucao)
    ).toEqual(['recente', 'exec-1']);
  });

  it('filtra status, origem e busca sem caixa/acento por nome e nome do arquivo, sem buscar pasta nem usuário', () => {
    const a = resumoDaExecucao(registro([inicio()]))!;
    const b = {
      ...a,
      execucao: 'b',
      status: 'erro' as const,
      origem: 'ferramenta' as const,
      usuario: 'MARIA',
      nome: 'Outro',
      saida: 'C:\\José\\destino\\Saída.xlsx',
    };
    const lista = [a, b];
    const filtrar = (
      busca: string,
      status: 'todos' | 'erro' = 'todos',
      origem: 'todas' | 'processo' | 'ferramenta' = 'todas'
    ) => filtrarExecucoes(lista, { busca, status, origem });
    expect(filtrar('auditoria agil').map((r) => r.execucao)).toEqual([
      'exec-1',
    ]);
    expect(filtrar('jose.silva')).toEqual([]);
    expect(filtrar('maria')).toEqual([]);
    expect(filtrar('saida.xlsx').map((r) => r.execucao)).toEqual(['b']);
    expect(filtrar('C:\\José')).toEqual([]);
    expect(filtrar('', 'erro', 'ferramenta')).toEqual([b]);
    expect(filtrar('', 'erro', 'processo')).toEqual([]);
  });
});

describe('parâmetros legíveis', () => {
  it('usa rótulos do catálogo, oculta valores do dicionário e campos não declarados', () => {
    expect(
      parametrosLegiveis('eliminar-duplicatas', {
        colunasChave: ['A', 'B'],
        ferramentaId: 'segredo',
        extra: 3,
      })
    ).toEqual([{ rotulo: 'Colunas-chave', valor: 'A, B' }]);
    expect(
      parametrosLegiveis('dicionario', {
        coluna: 'Cargo',
        modo: 'contem',
        valores: ['segredo', '', '  ', 'outro'],
      })
    ).toEqual([
      { rotulo: 'Coluna', valor: 'Cargo' },
      { rotulo: 'Como comparar', valor: 'Contém' },
      { rotulo: 'Valores para manter', valor: '2 valores' },
    ]);
    expect(parametrosLegiveis('dicionario', { valores: ['x'] })).toContainEqual(
      { rotulo: 'Valores para manter', valor: '1 valor' }
    );
    expect(
      parametrosLegiveis('mesclar-planilhas', { modo: 'vertical' })
    ).toEqual([{ rotulo: 'Como mesclar', valor: 'Empilhar linhas' }]);
    expect(
      parametrosLegiveis('zebrar-planilha', { corCabecalho: '#ab12ef' })[0]
        .valor
    ).toBe('#AB12EF');
    expect(
      parametrosLegiveis('script-python', {
        script: 'C:\\scripts\\limpar.py',
        extra: 'x',
      })
    ).toEqual([{ rotulo: 'Script', valor: 'limpar.py' }]);
    expect(parametrosLegiveis('desconhecida', { x: 1 })).toEqual([]);
  });
});

describe('detalhe da execução', () => {
  it('descreve situações, logs por etapa e gerais, saída, erro e resumo sem traceback', () => {
    const ini = inicio([
      etapa(0, 'mesclar-planilhas', { modo: 'vertical' }),
      etapa(1),
      etapa(2),
    ]);
    const eventos: EventoDeExecucao[] = [
      ini,
      evento(
        'entrada.lida',
        { arquivo: 'base.xlsx', abas: 1, linhas: 14532, colunas: 4 },
        2
      ),
      evento(
        'etapa.inicio',
        { indice: 0, ferramenta: 'mesclar-planilhas', nome: 'Mesclar' },
        3
      ),
      evento(
        'etapa.fim',
        {
          indice: 0,
          ferramenta: 'mesclar-planilhas',
          linhas_antes: 10,
          linhas_depois: 9,
          resumo: { linhas: 14532, chave_nova: 2 },
          duracao_ms: 100,
        },
        4
      ),
      evento('log', { nivel: 'info', mensagem: 'etapa ok', etapa: 0 }, 5),
      evento('log', { nivel: 'aviso', mensagem: 'aviso geral' }, 6),
      evento(
        'etapa.inicio',
        { indice: 1, ferramenta: 'eliminar-duplicatas', nome: 'Deduplicar' },
        7
      ),
      evento(
        'execucao.fim',
        {
          status: 'erro',
          duracao_ms: 100,
          avisos: 1,
          erro: { mensagem: 'deu ruim', detalhe: 'TRACEBACK SECRETO' },
        },
        8
      ),
      evento(
        'saida.gravada',
        { caminho: 'C:\\saida\\final.xlsx', abas: 2, linhas: 9 },
        9
      ),
    ];
    const detalhe = detalheDaExecucao(registro(eventos))!;
    expect(detalhe.etapas.map((e) => e.situacao)).toEqual([
      'concluida',
      'em_andamento',
      'nao_executada',
    ]);
    expect(detalhe.etapas[0].logs).toEqual([
      { nivel: 'info', mensagem: 'etapa ok' },
    ]);
    expect(detalhe.avisosGerais).toEqual(['aviso geral']);
    expect(detalhe.saidaGravada).toEqual({
      nome: 'final.xlsx',
      abas: 2,
      linhas: 9,
    });
    expect(detalhe.erro).toEqual({ mensagem: 'deu ruim', etapa: null });
    expect(detalhe.etapas[0].resumo).toEqual([
      { rotulo: 'Total de linhas', valor: '14.532' },
      { rotulo: 'Chave nova', valor: '2' },
    ]);
    expect(JSON.stringify(detalhe)).not.toContain('TRACEBACK SECRETO');
    expect(JSON.stringify(detalhe)).not.toContain('detalhe');
  });

  it.each([
    ['concluida', 'concluido'],
    ['falhou', 'erro'],
    ['em_andamento', null],
    ['nao_executada', 'cancelado'],
  ] as const)('mapeia etapa %s', (caso, status) => {
    const ini = inicio([etapa(0)]);
    const eventos: EventoDeExecucao[] = [ini];
    if (status === 'concluido')
      eventos.push(
        evento(
          'etapa.fim',
          {
            indice: 0,
            ferramenta: 'eliminar-duplicatas',
            linhas_antes: 1,
            linhas_depois: 1,
            resumo: {},
            duracao_ms: 1,
          },
          2
        )
      );
    if (status === 'erro')
      eventos.push(
        evento(
          'execucao.fim',
          {
            status: 'erro',
            duracao_ms: 1,
            avisos: 0,
            erro: { mensagem: 'x', etapa: 0 },
          },
          2
        )
      );
    if (status === 'cancelado')
      eventos.push(
        evento(
          'execucao.fim',
          { status: 'cancelado', duracao_ms: 1, avisos: 0 },
          2
        )
      );
    if (status === null)
      eventos.push(
        evento(
          'etapa.inicio',
          { indice: 0, ferramenta: 'eliminar-duplicatas', nome: 'Dedupe' },
          2
        )
      );
    expect(detalheDaExecucao(registro(eventos))?.etapas[0].situacao).toBe(caso);
  });
});

describe('formatadores', () => {
  it.each([
    [null, '—'],
    [450, '0,5 s'],
    [9999, '10,0 s'],
    [12000, '12 s'],
    [125000, '2 min 05 s'],
  ] as const)('formata %s ms como %s', (ms, esperado) =>
    expect(formatarDuracao(ms)).toBe(esperado)
  );
  it('formata data/hora usando o fuso local corrente', () => {
    const valor = '2026-07-15T16:24:00.000Z';
    expect(formatarDataHora(valor)).toBe(
      new Date(valor).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  });
});

describe('descrição curta da execução', () => {
  function descricaoDe(nome: string, status: string) {
    const registro = logsExecucaoMock.find((item) => {
      const resumo = resumoDaExecucao(item);
      return resumo?.nome === nome && resumo.status === status;
    });
    return descricaoCurtaDaExecucao(detalheDaExecucao(registro!)!);
  }

  it('mostra o erro, as linhas gravadas ou as etapas concluídas', () => {
    expect(descricaoDe('Lotação por DRE', 'erro')).toBe(
      'A coluna DRE não existe na aba Lotação.'
    );
    expect(descricaoDe('Eliminar Duplicatas', 'concluido')).toBe(
      '7.828 linhas gravadas'
    );
    expect(descricaoDe('Cruzamento SEAP x Folha', 'em_andamento')).toBe(
      '1 de 2 etapas concluídas'
    );
  });
});

describe('data curta', () => {
  it('omite o ano e usa o fuso local', () => {
    const valor = '2026-07-15T16:24:00.000Z';
    expect(formatarDataCurta(valor)).toBe(
      new Date(valor).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
    expect(formatarDataCurta(valor)).not.toContain('2026');
  });
});
