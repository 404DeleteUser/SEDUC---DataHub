import { describe, expect, it } from 'vitest';
import { iniciaisDoNome, validarNome } from './perfil';

describe('validarNome', () => {
  it('aceita nomes com acento, hífen e apóstrofo', () => {
    expect(validarNome("Ana Clara D'Ávila-Souza")).toBeUndefined();
  });

  it('explica o que falta', () => {
    expect(validarNome('   ')).toBe('Informe seu nome.');
    expect(validarNome('A')).toBe('O nome precisa ter pelo menos 2 letras.');
    expect(validarNome('x'.repeat(81))).toBe(
      'O nome pode ter no máximo 80 caracteres.'
    );
    expect(validarNome('Ana 2')).toBe(
      'Use só letras, espaços, hífen ou apóstrofo.'
    );
  });
});

describe('iniciaisDoNome', () => {
  it('usa a primeira e a última palavra', () => {
    expect(iniciaisDoNome('ana clara de souza')).toBe('AS');
    expect(iniciaisDoNome('Ângela')).toBe('Â');
    expect(iniciaisDoNome('')).toBe('');
  });
});
