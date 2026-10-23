import { useRef } from 'react';
import {
  TAMANHO_FONTE_ASCII,
  useAsciiCanvas,
  type Grade,
} from './useAsciiCanvas';

const PALAVRA = 'SEDUC';
const FONTE_DA_MASCARA = "'IBM Plex Sans Variable', system-ui, sans-serif";
const DENSOS = '+=*#%@';
const LEVES = '.:-+=';
const GLIFOS = '01<>/\\|{}[]#%&$';
/** Segundos entre uma passagem do feixe e a seguinte. */
const PERIODO = 5.5;
/** Largura do feixe, em colunas. */
const FAIXA = 10;

// Pseudoaleatório estável por coluna/célula (sem Math.random a cada quadro).
function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** "SEDUC" em ASCII: um feixe azul varre a caixa, embaralha as letras e as deixa assentar. */
export default function AsciiSeduc() {
  const mascara = useRef<Float32Array>(new Float32Array(0));

  function aoRedimensionar(g: Grade) {
    const off = document.createElement('canvas');
    off.width = Math.ceil(g.largura);
    off.height = Math.ceil(g.altura);
    const c = off.getContext('2d', { willReadFrequently: true });
    const m = new Float32Array(g.colunas * g.linhas);
    if (!c) return;
    // Altura das maiúsculas ≈ 0,72 do corpo: o corpo passa da caixa para as letras a preencherem.
    const areaL = g.largura * 0.56;
    let tam = (g.altura * 0.92) / 0.72;
    c.font = `700 ${tam}px ${FONTE_DA_MASCARA}`;
    const larg = c.measureText(PALAVRA).width;
    if (larg > areaL) tam *= areaL / larg;
    c.font = `700 ${tam}px ${FONTE_DA_MASCARA}`;
    c.textAlign = 'right';
    c.textBaseline = 'middle';
    c.fillStyle = '#000';
    c.fillText(PALAVRA, g.largura * 0.975, g.altura / 2 + tam * 0.03);
    const px = c.getImageData(0, 0, off.width, off.height).data;
    for (let y = 0; y < g.linhas; y++)
      for (let x = 0; x < g.colunas; x++) {
        const sx = Math.min(off.width - 1, Math.floor((x + 0.5) * g.celulaL));
        const sy = Math.min(off.height - 1, Math.floor((y + 0.5) * g.celulaA));
        m[y * g.colunas + x] = px[(sy * off.width + sx) * 4 + 3] / 255;
      }
    mascara.current = m;
  }

  function desenhar(g: Grade, t: number) {
    const { ctx, colunas, linhas, celulaL, celulaA } = g;
    const azul = g.cor('--brand-blue');
    const claro = g.cor('--accent-hover');
    const m = mascara.current;
    // A faixa de luz atravessa a caixa a cada PERIODO segundos, com folga nas bordas.
    const progresso = (t % PERIODO) / PERIODO;
    const feixe = -FAIXA + progresso * (colunas + FAIXA * 2);
    const tique = Math.floor(t * 14);
    for (let x = 0; x < colunas; x++) {
      const u = x / colunas;
      // Some à esquerda para não disputar com o texto do banner.
      const fade = Math.min(1, Math.max(0, (u - 0.12) / 0.34));
      const d = feixe - x; // > 0: o feixe já passou por esta coluna
      const noFeixe = Math.abs(d) < FAIXA ? 1 - Math.abs(d) / FAIXA : 0;
      // Depois da passagem, o brilho volta devagar ao repouso.
      const rastro = d > 0 ? Math.exp(-d / 26) : 0;
      for (let y = 0; y < linhas; y++) {
        const dentro = (m[y * colunas + x] ?? 0) > 0.45;
        // Respiração lenta e uniforme das letras em repouso.
        const respira = 0.5 + 0.5 * Math.sin(t * 1.1 - y * 0.35);
        if (dentro) {
          const embaralha =
            noFeixe > 0.15 && hash(x * 13 + y * 57 + tique) < noFeixe;
          const brilho = Math.min(
            1,
            0.22 + 0.1 * respira + 0.45 * rastro + 0.7 * noFeixe
          );
          const ch = embaralha
            ? GLIFOS[Math.floor(hash(x * 7 + y * 3 + tique) * GLIFOS.length)]
            : DENSOS[
                Math.min(DENSOS.length - 1, Math.floor(brilho * DENSOS.length))
              ];
          ctx.globalAlpha = (0.3 + 0.7 * brilho) * Math.max(fade, 0.15);
          ctx.fillStyle = noFeixe > 0.55 ? claro : azul;
          ctx.fillText(ch, x * celulaL, y * celulaA);
        } else if (
          noFeixe > 0 &&
          hash(x * 29 + y * 11 + tique) < noFeixe * 0.5
        ) {
          // Fora das letras, o feixe deixa só uma poeira de caracteres.
          const ch = LEVES[Math.floor(hash(x + y * 17 + tique) * LEVES.length)];
          ctx.globalAlpha = 0.3 * noFeixe * (0.3 + 0.7 * fade);
          ctx.fillStyle = azul;
          ctx.fillText(ch, x * celulaL, y * celulaA);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  const ref = useAsciiCanvas({
    tamanhoFonte: TAMANHO_FONTE_ASCII,
    aoRedimensionar,
    desenhar,
  });
  return <canvas ref={ref} className="welcome-ascii" aria-hidden="true" />;
}
