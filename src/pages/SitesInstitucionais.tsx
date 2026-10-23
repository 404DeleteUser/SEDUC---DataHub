import { useState } from 'react';
import { Copy, ExternalLink, Globe, Search, TriangleAlert } from 'lucide-react';

import PageHeader from '../components/PageHeader';
import { IconButton } from '../components/ui';
import {
  ORGAOS,
  sitesInstitucionais,
  type SiteInstitucional,
} from '../data/sitesInstitucionais';
import { textoNormalizado } from '../domain/ferramentas';
import { abrirLinkExterno } from '../utils/abrirLink';

function dominio(url: string) {
  return new URL(url).host;
}

function correspondeABusca(site: SiteInstitucional, busca: string) {
  const termo = textoNormalizado(busca);
  return (
    !termo ||
    textoNormalizado(
      `${site.nome} ${site.orgao} ${dominio(site.url)}`
    ).includes(termo)
  );
}

export default function SitesInstitucionais() {
  const [busca, setBusca] = useState('');
  const [aviso, setAviso] = useState('');

  const filtrados = sitesInstitucionais.filter((site) =>
    correspondeABusca(site, busca)
  );

  async function abrir(site: SiteInstitucional) {
    try {
      await abrirLinkExterno(site.url);
      setAviso('');
    } catch {
      setAviso(
        `Não foi possível abrir ${site.nome}. Copie o link e cole no navegador.`
      );
    }
  }

  async function copiar(site: SiteInstitucional) {
    try {
      await navigator.clipboard.writeText(site.url);
      setAviso(`Link de ${site.nome} copiado.`);
    } catch {
      setAviso(`Não foi possível copiar o link de ${site.nome}.`);
    }
  }

  return (
    <main id="conteudo-principal" tabIndex={-1} className="page-scroll">
      <PageHeader
        titulo="Sites Institucionais"
        descricao="Atalhos para os sistemas usados no dia a dia. Os sites abrem no navegador padrão."
      />
      <div className="page-content sites-pagina">
        <label className="ferramentas-busca sites-busca">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Buscar site</span>
          <input
            type="search"
            value={busca}
            placeholder="Buscar por nome, órgão ou endereço…"
            autoComplete="off"
            onChange={(event) => setBusca(event.target.value)}
          />
        </label>
        <p className="sites-aviso" role="status">
          {aviso}
        </p>

        {!filtrados.length && (
          <p className="ui-empty">Nenhum site encontrado.</p>
        )}

        {ORGAOS.map((orgao) => {
          const sites = filtrados.filter((site) => site.orgao === orgao);
          if (!sites.length) return null;
          const tituloId = `sites-${orgao.replace(/\W+/g, '-').toLowerCase()}`;
          return (
            <section
              key={orgao}
              className="sites-grupo"
              aria-labelledby={tituloId}
            >
              <h2 id={tituloId} className="sites-grupo__titulo">
                {orgao}
              </h2>
              <ul className="sites-lista">
                {sites.map((site) => (
                  <li key={site.id} className="sites-cartao">
                    <button
                      type="button"
                      className="sites-cartao__abrir"
                      onClick={() => void abrir(site)}
                    >
                      <span className="sites-cartao__icone" aria-hidden="true">
                        <Globe size={18} />
                      </span>
                      <span className="sites-cartao__texto">
                        <strong>{site.nome}</strong>
                        <span className="sites-cartao__dominio">
                          {dominio(site.url)}
                        </span>
                      </span>
                      <ExternalLink
                        size={16}
                        className="sites-cartao__seta"
                        aria-hidden="true"
                      />
                      <span className="sr-only"> (abre no navegador)</span>
                    </button>
                    {new URL(site.url).protocol === 'http:' && (
                      <span
                        className="sites-cartao__http"
                        title="Este site não usa conexão segura (HTTPS)."
                      >
                        <TriangleAlert size={12} aria-hidden="true" />
                        Sem HTTPS
                      </span>
                    )}
                    <IconButton
                      icon={Copy}
                      label={`Copiar link de ${site.nome}`}
                      onClick={() => void copiar(site)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
