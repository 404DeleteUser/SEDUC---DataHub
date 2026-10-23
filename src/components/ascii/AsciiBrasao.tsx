import { useEffect, useRef } from 'react';
import brasaoMT from '../../assets/brasao-mt.png';
import {
  TAMANHO_FONTE_ASCII,
  useAsciiCanvas,
  type Grade,
} from './useAsciiCanvas';

const DENSOS = '+=*#%@';

type Amostra = { w: number; h: number; px: Uint8ClampedArray };

/** Brasão de Mato Grosso em ASCII, tremulando como uma bandeira, nas cores do próprio brasão. */
export default function AsciiBrasao() {
  const amostra = useRef<Amostra | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      amostra.current = {
        w: c.width,
        h: c.height,
        px: ctx.getImageData(0, 0, c.width, c.height).data,
      };
    };
    img.src = brasaoMT;
  }, []);

  function desenhar(g: Grade, t: number) {
    const a = amostra.current;
    if (!a) return;
    const { ctx, colunas, linhas, celulaL, celulaA, largura, altura } = g;
    // Quadrado centralizado, com folga para a ondulação.
    const lado = Math.min(largura * 0.9, altura * 0.88);
    const x0 = (largura - lado) / 2;
    const y0 = (altura - lado) / 2;
    for (let y = 0; y < linhas; y++) {
      for (let x = 0; x < colunas; x++) {
        const cx = (x + 0.5) * celulaL;
        const cy = (y + 0.5) * celulaA;
        let u = (cx - x0) / lado;
        let v = (cy - y0) / lado;
        if (u < -0.05 || u > 1.05) continue;
        // Onda que nasce no "mastro" (lado esquerdo) e cresce para a direita.
        const fase = u * 7 - t * 2.6;
        const amp = 0.035 * (0.25 + u);
        v -= Math.sin(fase) * amp + Math.sin(u * 3.1 - t * 1.4) * 0.012;
        u -= Math.cos(fase) * amp * 0.25;
        if (u < 0 || u >= 1 || v < 0 || v >= 1) continue;
        const i = (Math.floor(v * a.h) * a.w + Math.floor(u * a.w)) * 4;
        const r = a.px[i];
        const gr = a.px[i + 1];
        const b = a.px[i + 2];
        const al = a.px[i + 3];
        if (al < 60) continue;
        // Luz e sombra das dobras: a sombra apaga a cor e afina o caractere.
        const luz = 0.5 + 0.5 * Math.cos(fase + 0.6);
        const ch =
          DENSOS[Math.min(DENSOS.length - 1, Math.floor(luz * DENSOS.length))];
        const k = 0.5 + 0.62 * luz;
        ctx.fillStyle = `rgb(${Math.min(255, r * k + 18)},${Math.min(255, gr * k + 18)},${Math.min(255, b * k + 18)})`;
        ctx.fillText(ch, x * celulaL, y * celulaA);
      }
    }
  }

  const ref = useAsciiCanvas({
    tamanhoFonte: TAMANHO_FONTE_ASCII,
    desenhar,
    fps: 30,
  });
  return (
    <canvas
      ref={ref}
      className="perfil-ascii"
      role="img"
      aria-label="Brasão de Mato Grosso em ASCII, tremulando como uma bandeira"
    />
  );
}
