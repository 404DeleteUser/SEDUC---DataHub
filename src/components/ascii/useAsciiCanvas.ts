import { useEffect, useRef } from 'react';

export type Grade = {
  ctx: CanvasRenderingContext2D;
  largura: number;
  altura: number;
  colunas: number;
  linhas: number;
  celulaL: number;
  celulaA: number;
  cor: (token: string) => string;
};

type Opcoes = {
  tamanhoFonte: number;
  /** Prepara dados que dependem do tamanho (máscaras, amostras). */
  aoRedimensionar?: (grade: Grade) => void;
  desenhar: (grade: Grade, t: number) => void;
  fps?: number;
};

/**
 * Tamanho dos caracteres das ilustrações ASCII. DESIGN.md pede texto ≥ 12px;
 * o pedido de 7–8px (conflito C6) aguarda decisão do usuário.
 */
export const TAMANHO_FONTE_ASCII = 12;

/** Instante desenhado quando o sistema pede menos movimento: um quadro parado. */
const INSTANTE_ESTATICO = 1.2;

/** Canvas que ocupa o elemento pai e redesenha uma grade de caracteres. */
export function useAsciiCanvas({
  tamanhoFonte,
  aoRedimensionar,
  desenhar,
  fps = 24,
}: Opcoes) {
  const ref = useRef<HTMLCanvasElement>(null);
  const desenharRef = useRef(desenhar);
  const redimRef = useRef(aoRedimensionar);
  desenharRef.current = desenhar;
  redimRef.current = aoRedimensionar;

  useEffect(() => {
    const canvas = ref.current;
    const pai = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !pai || !ctx) return;

    const reduzir =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    let grade: Grade | null = null;
    let quadro = 0;
    let ultimo = 0;
    let ativo = true;
    const inicio = performance.now();
    const estilo = () => getComputedStyle(document.documentElement);

    function montar() {
      if (!canvas || !pai || !ctx) return;
      // Área interna do pai (sem borda): é nela que o canvas absoluto se posiciona.
      const width = pai.clientWidth;
      const height = pai.clientHeight;
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const familia = estilo().getPropertyValue('--font-mono') || 'monospace';
      ctx.font = `${tamanhoFonte}px ${familia}`;
      ctx.textBaseline = 'top';
      const celulaL = Math.max(4, ctx.measureText('M').width);
      const celulaA = Math.round(tamanhoFonte * 1.15);
      let css = estilo();
      let lidoEm = 0;
      grade = {
        ctx,
        largura: width,
        altura: height,
        colunas: Math.ceil(width / celulaL),
        linhas: Math.ceil(height / celulaA),
        celulaL,
        celulaA,
        // As cores vêm dos tokens: trocar o tema muda o desenho no quadro seguinte.
        cor: (token) => {
          const agora = performance.now();
          if (agora - lidoEm > 250) {
            css = estilo();
            lidoEm = agora;
          }
          return css.getPropertyValue(token).trim();
        },
      };
      redimRef.current?.(grade);
    }

    function pintar(agora: number) {
      if (!grade) return;
      grade.ctx.clearRect(0, 0, grade.largura, grade.altura);
      desenharRef.current(
        grade,
        reduzir ? INSTANTE_ESTATICO : (agora - inicio) / 1000
      );
    }

    function laco(agora: number) {
      quadro = requestAnimationFrame(laco);
      if (agora - ultimo < 1000 / (reduzir ? 2 : fps)) return;
      ultimo = agora;
      pintar(agora);
    }

    montar();
    const observador =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            montar();
            pintar(performance.now());
          });
    observador?.observe(pai);
    quadro = requestAnimationFrame(laco);
    // A máscara depende da fonte; refaz quando ela terminar de carregar.
    document.fonts?.ready.then(() => {
      if (ativo) montar();
    });

    return () => {
      ativo = false;
      cancelAnimationFrame(quadro);
      observador?.disconnect();
    };
  }, [tamanhoFonte, fps]);

  return ref;
}
