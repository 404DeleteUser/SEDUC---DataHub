// Contrato de eventos (engine/contrato/EVENTOS.md): os mesmos exemplos do motor Python.
import { describe, expect, it } from 'vitest';
import validos from '../../engine/contrato/exemplos-validos.jsonl?raw';
import invalidos from '../../engine/contrato/exemplos-invalidos.jsonl?raw';
import { ehEventoDeExecucao } from './eventosExecucao';

const linhas = (conteudo: string) =>
  conteudo
    .split('\n')
    .filter((linha) => linha.trim())
    .map((linha) => JSON.parse(linha) as unknown);

describe('contrato de eventos', () => {
  it.each(linhas(validos))('aceita o exemplo válido %#', (evento) => {
    expect(ehEventoDeExecucao(evento)).toBe(true);
  });

  it.each(linhas(invalidos))('recusa o exemplo inválido %#', (evento) => {
    expect(ehEventoDeExecucao(evento)).toBe(false);
  });
});
