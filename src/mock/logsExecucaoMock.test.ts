import { describe, expect, it } from 'vitest';
import { ehEventoDeExecucao } from '../domain/eventosExecucao';
import { listarExecucoes } from '../domain/logsExecucao';
import { logsExecucaoMock } from './logsExecucaoMock';

describe('mock de logs de execução', () => {
  it('contém apenas eventos válidos com sequência contínua e timestamps não decrescentes', () => {
    for (const registro of logsExecucaoMock) {
      expect(registro.eventos.length).toBeGreaterThan(0);
      registro.eventos.forEach((evento, indice) => {
        expect(
          ehEventoDeExecucao(evento),
          `${registro.arquivo} evento ${indice + 1}`
        ).toBe(true);
        expect(evento.seq).toBe(indice + 1);
        if (indice > 0)
          expect(Date.parse(evento.ts)).toBeGreaterThanOrEqual(
            Date.parse(registro.eventos[indice - 1].ts)
          );
      });
      expect(registro.arquivo).toMatch(/\.jsonl$/);
      expect(registro.arquivo).toMatch(
        /\d{4}-\d{2}-\d{2}_\d{6}_[^\\/]+\.jsonl$/
      );
    }
  });

  it('representa os seis status da listagem', () => {
    const status = new Set(
      listarExecucoes(logsExecucaoMock).map((execucao) => execucao.status)
    );
    expect(status).toEqual(
      new Set([
        'concluido',
        'concluido_com_avisos',
        'erro',
        'cancelado',
        'em_andamento',
        'interrompido',
      ])
    );
  });

  it('mantém avisos e status final alinhados com os logs', () => {
    for (const registro of logsExecucaoMock) {
      const fim = [...registro.eventos]
        .reverse()
        .find((evento) => evento.tipo === 'execucao.fim');
      if (!fim || fim.tipo !== 'execucao.fim') continue;
      const avisos = registro.eventos.filter(
        (evento) => evento.tipo === 'log' && evento.nivel === 'aviso'
      ).length;
      expect(fim.avisos).toBe(avisos);
      if (fim.status === 'concluido' || fim.status === 'concluido_com_avisos') {
        expect(fim.status).toBe(avisos ? 'concluido_com_avisos' : 'concluido');
      }
    }
  });

  it('encadeia contagens de linhas entre entrada e etapas finalizadas', () => {
    for (const registro of logsExecucaoMock) {
      const entrada = registro.eventos.find(
        (evento) => evento.tipo === 'entrada.lida'
      );
      const primeiraEtapa = registro.eventos.find(
        (evento) => evento.tipo === 'etapa.fim'
      );
      if (
        primeiraEtapa?.tipo === 'etapa.fim' &&
        entrada?.tipo === 'entrada.lida'
      ) {
        expect(primeiraEtapa.linhas_antes).toBe(entrada.linhas);
      }
      let anterior: number | undefined;
      for (const evento of registro.eventos) {
        if (evento.tipo !== 'etapa.fim') continue;
        if (anterior !== undefined) expect(evento.linhas_antes).toBe(anterior);
        anterior = evento.linhas_depois;
      }
    }
  });

  it('inicia cada etapa finalizada antes do respectivo fim', () => {
    for (const registro of logsExecucaoMock) {
      for (const fim of registro.eventos.filter(
        (evento) => evento.tipo === 'etapa.fim'
      )) {
        if (fim.tipo !== 'etapa.fim') continue;
        const inicio = registro.eventos.find(
          (evento) =>
            evento.tipo === 'etapa.inicio' && evento.indice === fim.indice
        );
        expect(inicio).toBeDefined();
        expect(Date.parse(inicio!.ts)).toBeLessThan(Date.parse(fim.ts));
      }
    }
  });
});
