import { beforeEach, describe, expect, it } from 'vitest';
import {
  CHAVE_MANTER_CONECTADO,
  armazenamentoSessao,
  definirManterConectado,
  manterConectado,
} from './armazenamentoSessao';

const CHAVE = 'sb-teste-auth-token';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('armazenamento da sessão', () => {
  it('por padrão mantém conectado e grava no localStorage', () => {
    expect(manterConectado()).toBe(true);
    armazenamentoSessao.setItem(CHAVE, 'sessao');
    expect(localStorage.getItem(CHAVE)).toBe('sessao');
    expect(sessionStorage.getItem(CHAVE)).toBeNull();
    expect(armazenamentoSessao.getItem(CHAVE)).toBe('sessao');
  });

  it('desmarcado, grava só no sessionStorage, que acaba com a aba', () => {
    definirManterConectado(false);
    armazenamentoSessao.setItem(CHAVE, 'sessao');
    expect(sessionStorage.getItem(CHAVE)).toBe('sessao');
    expect(localStorage.getItem(CHAVE)).toBeNull();
    expect(armazenamentoSessao.getItem(CHAVE)).toBe('sessao');
  });

  it('ao trocar a opção, apaga a cópia que ficou no outro lugar', () => {
    armazenamentoSessao.setItem(CHAVE, 'antiga');
    definirManterConectado(false);
    armazenamentoSessao.setItem(CHAVE, 'nova');
    expect(localStorage.getItem(CHAVE)).toBeNull();
    expect(armazenamentoSessao.getItem(CHAVE)).toBe('nova');
  });

  it('a escolha fica lembrada e o item some dos dois lugares', () => {
    definirManterConectado(false);
    expect(localStorage.getItem(CHAVE_MANTER_CONECTADO)).toBe('nao');
    expect(manterConectado()).toBe(false);
    armazenamentoSessao.setItem(CHAVE, 'sessao');
    armazenamentoSessao.removeItem(CHAVE);
    expect(armazenamentoSessao.getItem(CHAVE)).toBeNull();
  });
});
