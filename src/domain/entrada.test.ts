import { describe, expect, it } from 'vitest';
import {
  falhaDeEntrada,
  lerLinkDeAcesso,
  normalizarEmail,
  validarEmail,
  validarNovaSenha,
  validarSenha,
} from './entrada';

describe('validarEmail', () => {
  it('pede o e-mail quando está vazio', () => {
    expect(validarEmail('')).toBe('Informe o e-mail.');
    expect(validarEmail('   ')).toBe('Informe o e-mail.');
  });

  it('recusa formato inválido', () => {
    expect(validarEmail('pessoa')).toBe('Confira o e-mail digitado.');
    expect(validarEmail('@edu.mt.gov.br')).toBe('Confira o e-mail digitado.');
    expect(validarEmail('pessoa @edu.mt.gov.br')).toBe(
      'Confira o e-mail digitado.'
    );
  });

  it('aceita só @edu.mt.gov.br, mesmo com domínios parecidos', () => {
    expect(validarEmail(' Pessoa.Teste@EDU.MT.GOV.BR ')).toBeUndefined();
    for (const parecido of [
      'pessoa@seduc.mt.gov.br',
      'pessoa@edu.mt.gov.br.outro.com',
      'pessoa@xedu.mt.gov.br',
      'pessoa@gmail.com',
    ]) {
      expect(validarEmail(parecido)).toBe('Use seu e-mail @edu.mt.gov.br.');
    }
  });
});

describe('normalizarEmail', () => {
  it('apara e passa para minúsculas', () => {
    expect(normalizarEmail('  Pessoa.Teste@EDU.mt.gov.br ')).toBe(
      'pessoa.teste@edu.mt.gov.br'
    );
  });
});

describe('validarSenha', () => {
  it('só exige que a senha esteja preenchida', () => {
    expect(validarSenha('')).toBe('Informe a senha.');
    expect(validarSenha('x')).toBeUndefined();
  });
});

describe('validarNovaSenha', () => {
  it('exige 8 caracteres e confirmação igual', () => {
    expect(validarNovaSenha('', '')).toEqual({
      senha: 'Informe a nova senha.',
    });
    expect(validarNovaSenha('1234567', '1234567')).toEqual({
      senha: 'A senha precisa ter pelo menos 8 caracteres.',
    });
    expect(validarNovaSenha('senha-ficticia', 'outra')).toEqual({
      confirmacao: 'As senhas não são iguais.',
    });
    expect(validarNovaSenha('senha-ficticia', 'senha-ficticia')).toEqual({});
  });
});

describe('falhaDeEntrada', () => {
  it('não diz se foi o e-mail ou a senha', () => {
    expect(falhaDeEntrada({ code: 'invalid_credentials', status: 400 })).toBe(
      'E-mail ou senha incorretos.'
    );
    expect(falhaDeEntrada({ code: 'email_not_confirmed', status: 400 })).toBe(
      'E-mail ou senha incorretos.'
    );
  });

  it('separa falha de rede ou de serviço, sem mostrar o erro técnico', () => {
    const servico =
      'Não foi possível entrar agora. Tente de novo em instantes.';
    expect(falhaDeEntrada(new TypeError('Failed to fetch'))).toBe(servico);
    expect(falhaDeEntrada({ status: 500, message: 'upstream error' })).toBe(
      servico
    );
    expect(falhaDeEntrada(undefined)).toBe(servico);
  });
});

describe('lerLinkDeAcesso', () => {
  it('reconhece convite, recuperação e link vencido', () => {
    expect(lerLinkDeAcesso('/', '#access_token=x&type=invite')).toBe('convite');
    expect(
      lerLinkDeAcesso('/redefinir-senha', '#access_token=x&type=recovery')
    ).toBe('recuperacao');
    expect(
      lerLinkDeAcesso(
        '/redefinir-senha',
        '#error=access_denied&error_code=otp_expired'
      )
    ).toBe('invalido');
  });

  it('a página /redefinir-senha aberta de novo continua na troca de senha', () => {
    expect(lerLinkDeAcesso('/redefinir-senha', '')).toBe('recuperacao');
    expect(lerLinkDeAcesso('/redefinir-senha/', '')).toBe('recuperacao');
    expect(lerLinkDeAcesso('/', '')).toBeNull();
  });
});
