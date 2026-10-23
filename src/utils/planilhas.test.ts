import { describe, expect, it } from 'vitest';
import { lerColunas, lerPlanilha, valoresDaColuna } from './planilhas';

const csv = (nome: string, conteudo: string) =>
  new File([conteudo], nome, { type: 'text/csv' });

describe('lerPlanilha', () => {
  it('lê cabeçalho (sem vazios nem repetidos) e linhas da primeira aba', async () => {
    const planilha = await lerPlanilha(
      csv('base.csv', 'Tipo,Nome,,Tipo\nCelular,Ana,,x\niPad,Bia,,y\n')
    );
    expect(planilha.colunas).toEqual(['Tipo', 'Nome']);
    expect(planilha.linhas).toHaveLength(2);
  });

  it('mantém os acentos de CSV em UTF-8', async () => {
    const planilha = await lerPlanilha(
      csv('a.csv', 'Lotação,Nome\nNÚCLEO DE FROTAS,Ana\n')
    );
    expect(planilha.colunas).toEqual(['Lotação', 'Nome']);
    expect(planilha.linhas[0][0]).toBe('NÚCLEO DE FROTAS');
  });

  it('lê CSV salvo pelo Excel no Windows (Windows-1252)', async () => {
    // "Ú" = 0xDA e "ç" = 0xE7 em Windows-1252: bytes inválidos em UTF-8.
    const bytes = new Uint8Array([
      ...new TextEncoder().encode('Lota'),
      0xe7,
      0xe3,
      ...new TextEncoder().encode('o\nN'),
      0xda,
      ...new TextEncoder().encode('CLEO\n'),
    ]);
    const planilha = await lerPlanilha(new File([bytes], 'w.csv'));
    expect(planilha.colunas).toEqual(['Lotação']);
    expect(planilha.linhas[0][0]).toBe('NÚCLEO');
  });

  it('recusa formatos não suportados', async () => {
    await expect(lerPlanilha(csv('base.txt', 'a,b'))).rejects.toThrow(
      'Formato não suportado'
    );
  });

  it('recusa planilha vazia', async () => {
    await expect(lerPlanilha(csv('vazia.csv', ''))).rejects.toThrow(
      'Planilha sem cabeçalho'
    );
  });
});

describe('lerColunas', () => {
  it('devolve só o cabeçalho', async () => {
    expect(await lerColunas(csv('a.csv', 'CPF,Nome\n1,Ana'))).toEqual([
      'CPF',
      'Nome',
    ]);
  });
});

describe('valoresDaColuna', () => {
  it('devolve os valores da coluna escolhida, linha a linha', async () => {
    const arquivo = csv('a.csv', 'Tipo,Nome\nCelular,Ana\n,Bia\niPad,Caio\n');
    expect(await valoresDaColuna(arquivo, 'Tipo')).toEqual([
      'Celular',
      '',
      'iPad',
    ]);
  });

  it('coluna inexistente devolve lista vazia', async () => {
    expect(await valoresDaColuna(csv('a.csv', 'Tipo\nx'), 'Nome')).toEqual([]);
  });
});
