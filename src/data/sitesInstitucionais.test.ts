import { describe, expect, it } from 'vitest';
import { ORGAOS, sitesInstitucionais } from './sitesInstitucionais';

describe('sites institucionais', () => {
  it('tem os 12 sites, com ids únicos e endereços válidos', () => {
    expect(sitesInstitucionais).toHaveLength(12);
    const ids = new Set(sitesInstitucionais.map((site) => site.id));
    expect(ids.size).toBe(sitesInstitucionais.length);
    for (const site of sitesInstitucionais) {
      expect(['http:', 'https:']).toContain(new URL(site.url).protocol);
      expect(ORGAOS).toContain(site.orgao);
    }
  });
});
