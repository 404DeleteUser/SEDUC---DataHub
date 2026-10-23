import { describe, expect, it } from 'vitest';
import {
  mensagemDoErroDeAcesso,
  validarEmailInstitucional,
  validarSenha,
} from './acesso';

describe('validarEmailInstitucional', () => {
  it('aceita só @edu.mt.gov.br, sem diferenciar caixa', () => {
    expect(
      validarEmailInstitucional(' Ana.Teste@EDU.MT.GOV.BR ')
    ).toBeUndefined();
    expect(validarEmailInstitucional('')).toBe('Informe seu e-mail.');
    expect(validarEmailInstitucional('ana@gmail.com')).toBe(
      'Use seu e-mail institucional (@edu.mt.gov.br).'
    );
    expect(validarEmailInstitucional('ana@edu.mt.gov.br.exemplo.com')).toBe(
      'Use seu e-mail institucional (@edu.mt.gov.br).'
    );
    expect(validarEmailInstitucional('@edu.mt.gov.br')).toBe(
      'Informe um e-mail válido.'
    );
  });
});

describe('validarSenha', () => {
  it('exige 8 caracteres', () => {
    expect(validarSenha('')).toBe('Informe a senha.');
    expect(validarSenha('1234567')).toBe(
      'A senha precisa ter pelo menos 8 caracteres.'
    );
    expect(validarSenha('12345678')).toBeUndefined();
  });
});

describe('mensagemDoErroDeAcesso', () => {
  it('traduz os erros do Supabase pelo código', () => {
    expect(mensagemDoErroDeAcesso({ code: 'invalid_credentials' })).toBe(
      'E-mail ou senha incorretos.'
    );
    expect(mensagemDoErroDeAcesso({ code: 'email_not_confirmed' })).toMatch(
      /Confirme seu e-mail/
    );
    expect(mensagemDoErroDeAcesso({ code: 'user_already_exists' })).toMatch(
      /Já existe uma conta/
    );
    expect(
      mensagemDoErroDeAcesso({ code: 'over_email_send_rate_limit' })
    ).toMatch(/Muitos e-mails/);
  });

  it('reconhece o bloqueio de domínio do banco e cai numa mensagem genérica', () => {
    expect(
      mensagemDoErroDeAcesso({ message: 'Database error saving new user' })
    ).toBe('Use seu e-mail institucional (@edu.mt.gov.br).');
    expect(mensagemDoErroDeAcesso(new Error('Failed to fetch'))).toBe(
      'Sem conexão com o servidor. Verifique a internet e tente de novo.'
    );
    expect(mensagemDoErroDeAcesso({ message: '???' })).toBe(
      'Não foi possível concluir agora. Tente de novo.'
    );
  });
});
