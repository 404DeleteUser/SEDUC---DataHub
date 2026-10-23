import { describe, expect, it } from 'vitest';
import {
  buscarSetores,
  categoriasDosSetores,
  estruturaDoOrganograma,
  filhosPorSetor,
  separarFilhos,
} from './organograma';
import { ID_SETOR_RAIZ, setoresSeduc } from '../data/organogramaSeduc';
import type { Setor } from '../types/organograma';

const exemplo: Setor[] = [
  { id: 'raiz', nome: 'Gabinete do Secretário', tipo: 'gabinete' },
  { id: 'adj', nome: 'Gabinete Adjunto', tipo: 'gabinete', paiId: 'raiz' },
  {
    id: 'sup',
    nome: 'Superintendência de Obras',
    tipo: 'superintendencia',
    paiId: 'adj',
  },
  {
    id: 'coord',
    nome: 'Coordenadoria de Projetos',
    tipo: 'coordenadoria',
    paiId: 'sup',
  },
  { id: 'nuc', nome: 'Núcleo de Manutenção', tipo: 'nucleo', paiId: 'coord' },
  {
    id: 'dre',
    nome: 'Diretoria Regional de Sinop',
    tipo: 'diretoria',
    paiId: 'adj',
    vinculo: 'vinculacao',
  },
  { id: 'cons', nome: 'Conselho Fiscal', tipo: 'conselho', paiId: 'dre' },
  { id: 'cee', nome: 'Conselho Estadual de Educação', tipo: 'conselho' },
  {
    id: 'cam',
    nome: 'Câmara de Educação Básica',
    tipo: 'camara',
    paiId: 'cee',
  },
  { id: 'col', nome: 'Comitês Setoriais', tipo: 'colegiado' },
];

describe('categoriasDosSetores', () => {
  const categorias = categoriasDosSetores(exemplo, 'raiz');

  it('classifica as cores pela regra do organograma', () => {
    expect(categorias.get('raiz')).toBe('raiz');
    expect(categorias.get('adj')).toBe('gabinete');
    expect(categorias.get('sup')).toBe('superintendencia');
    expect(categorias.get('coord')).toBe('coordenadoria');
    expect(categorias.get('nuc')).toBe('folha');
    expect(categorias.get('cons')).toBe('folha');
    expect(categorias.get('dre')).toBe('intermediario');
  });

  it('marca como avulso quem não chega a nenhum gabinete', () => {
    expect(categorias.get('cee')).toBe('avulso');
    expect(categorias.get('cam')).toBe('avulso');
    expect(categorias.get('col')).toBe('avulso');
  });
});

describe('filhosPorSetor', () => {
  it('agrupa os filhos e põe as raízes sob undefined', () => {
    const filhos = filhosPorSetor(exemplo);
    expect(filhos.get('adj')?.map((setor) => setor.id)).toEqual(['sup', 'dre']);
    expect(filhos.get(undefined)?.map((setor) => setor.id)).toEqual([
      'raiz',
      'cee',
      'col',
    ]);
  });
});

describe('arranjo do desenho', () => {
  it('separa gabinetes, faixa regional, colegiados e conselhos', () => {
    const estrutura = estruturaDoOrganograma(exemplo, 'raiz');
    expect(estrutura.raiz.id).toBe('raiz');
    expect(estrutura.gabinetes.map((setor) => setor.id)).toEqual(['adj']);
    expect(estrutura.apoio).toEqual([]);
    expect(estrutura.faixaRegional.map((setor) => setor.id)).toEqual(['dre']);
    expect(estrutura.colegiados.map((setor) => setor.id)).toEqual(['col']);
    expect(estrutura.conselhos.map((setor) => setor.id)).toEqual(['cee']);
  });

  it('a diretoria vinculada não aparece entre os filhos do gabinete', () => {
    const filhos = filhosPorSetor(exemplo);
    const { folhas, ramos } = separarFilhos('adj', filhos);
    expect(folhas).toEqual([]);
    expect(ramos.map((setor) => setor.id)).toEqual(['sup']);
  });

  it('acusa raiz inexistente', () => {
    expect(() => estruturaDoOrganograma(exemplo, 'nao-existe')).toThrow(
      'Setor raiz não encontrado'
    );
  });
});

describe('buscarSetores', () => {
  it('ignora caixa e acento e limita o resultado', () => {
    expect(buscarSetores(exemplo, 'camara').map((setor) => setor.id)).toEqual([
      'cam',
    ]);
    expect(buscarSetores(exemplo, 'GABINETE', 1)).toHaveLength(1);
  });

  it('termo vazio não retorna nada', () => {
    expect(buscarSetores(exemplo, '   ')).toEqual([]);
  });
});

describe('dados do Decreto nº 2.236/2026', () => {
  const ids = new Set(setoresSeduc.map((setor) => setor.id));

  it('tem ids únicos e todo pai existe e vem antes do filho', () => {
    expect(ids.size).toBe(setoresSeduc.length);
    const vistos = new Set<string>();
    for (const setor of setoresSeduc) {
      if (setor.paiId) expect(vistos.has(setor.paiId)).toBe(true);
      vistos.add(setor.id);
    }
  });

  it('tem 347 setores e só a raiz e os colegiados sem pai', () => {
    expect(setoresSeduc).toHaveLength(347);
    const semPai = setoresSeduc.filter((setor) => !setor.paiId);
    expect(semPai.map((setor) => setor.id)).toContain(ID_SETOR_RAIZ);
    expect(semPai).toHaveLength(7);
  });

  it('só o Conselho Estadual de Educação e os colegiados ficam avulsos', () => {
    const categorias = categoriasDosSetores(setoresSeduc, ID_SETOR_RAIZ);
    const avulsos = setoresSeduc.filter(
      (setor) => categorias.get(setor.id) === 'avulso'
    );
    expect(avulsos).toHaveLength(11);
    expect(avulsos.map((setor) => setor.nome)).toContain(
      'Câmara de Educação Profissional e Ensino Superior'
    );
  });

  it('arranja os 7 gabinetes adjuntos e a faixa com 13 diretorias e as Unidades Escolares', () => {
    const estrutura = estruturaDoOrganograma(setoresSeduc, ID_SETOR_RAIZ);
    expect(estrutura.gabinetes).toHaveLength(7);
    expect(estrutura.faixaRegional).toHaveLength(14);
    expect(estrutura.colegiados).toHaveLength(5);
    expect(estrutura.conselhos.map((setor) => setor.nome)).toEqual([
      'Conselho Estadual de Educação',
    ]);
    expect(estrutura.apoio.map((setor) => setor.nome)).toContain(
      'Gabinete de Direção'
    );
  });

  it('as 12 diretorias regionais e a metropolitana se vinculam à Gestão Regional', () => {
    const diretorias = setoresSeduc.filter((setor) =>
      /^Diretoria (Regional|Metropolitana)/.test(setor.nome)
    );
    expect(diretorias).toHaveLength(13);
    for (const diretoria of diretorias) {
      expect(diretoria.paiId).toBe(
        'gabinete-do-secretario-adjunto-de-gestao-regional'
      );
      expect(diretoria.vinculo).toBe('vinculacao');
    }
  });
});
