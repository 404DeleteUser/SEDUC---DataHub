import { describe, expect, it } from 'vitest';
import { descreverScript, principalEstaNaPasta } from './scriptPython';

const item = (nome: string, caminho?: string) => ({
  nome,
  caminho,
  rotulo: caminho ?? nome,
});

describe('principalEstaNaPasta', () => {
  it('no app desktop compara os caminhos (sem caixa, com / ou \\\\)', () => {
    const pasta = item('scripts', 'C:\\Projetos\\Scripts');
    expect(
      principalEstaNaPasta(
        item('main.py', 'c:/projetos/scripts/main.py'),
        pasta
      )
    ).toBe(true);
    expect(
      principalEstaNaPasta(item('main.py', 'C:\\Outros\\main.py'), pasta)
    ).toBe(false);
    expect(
      principalEstaNaPasta(
        item('x.py', 'C:\\Projetos\\ScriptsVelhos\\x.py'),
        pasta
      )
    ).toBe(false);
  });

  it('no navegador procura entre os .py listados', () => {
    const pasta = {
      ...item('scripts'),
      arquivos: ['main.py', 'util/apoio.py'],
    };
    expect(principalEstaNaPasta(item('util/apoio.py'), pasta)).toBe(true);
    expect(principalEstaNaPasta(item('outro.py'), pasta)).toBe(false);
  });
});

describe('descreverScript', () => {
  it('mostra o arquivo ou a pasta com o script principal', () => {
    expect(descreverScript({ modo: 'arquivo', principal: item('a.py') })).toBe(
      'a.py'
    );
    expect(
      descreverScript({
        modo: 'pasta',
        pasta: item('scripts'),
        principal: item('main.py'),
      })
    ).toBe('scripts · principal: main.py');
  });
});
