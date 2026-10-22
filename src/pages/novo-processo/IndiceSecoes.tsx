import type { MouseEvent } from 'react';
import { Check } from 'lucide-react';
import { comportamentoRolagem } from './constantes';

export type SecaoIndice = {
  id: string;
  titulo: string;
  completa: boolean;
  opcional?: boolean;
};

/** Índice lateral (≥ 1200px): âncoras para as seções, com ✓ nas obrigatórias completas. */
export function IndiceSecoes({ secoes }: { secoes: SecaoIndice[] }) {
  function irParaSecao(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const secao = document.getElementById(id);
    if (!secao) return;
    event.preventDefault();
    secao.scrollIntoView?.({
      block: 'start',
      behavior: comportamentoRolagem(),
    });
    secao.focus({ preventScroll: true });
  }

  return (
    <nav className="np-indice" aria-label="Seções do formulário">
      <p className="np-indice__titulo">Seções</p>
      <ol>
        {secoes.map((secao, indice) => (
          <li key={secao.id}>
            <a
              href={`#${secao.id}`}
              className={`np-indice__link ${secao.completa ? 'np-indice__link--completa' : ''}`}
              onClick={(event) => irParaSecao(event, secao.id)}
            >
              <span className="np-indice__marca" aria-hidden="true">
                {secao.completa ? (
                  <Check size={13} strokeWidth={3} />
                ) : (
                  indice + 1
                )}
              </span>
              <span className="np-indice__texto">
                {secao.titulo}
                {secao.opcional && (
                  <span className="np-indice__meta">Opcional</span>
                )}
              </span>
              {secao.completa && <span className="sr-only">(completa)</span>}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
