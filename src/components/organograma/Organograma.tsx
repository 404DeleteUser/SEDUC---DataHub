import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type FocusEvent,
} from 'react';
import { House, Maximize, Minus, Plus } from 'lucide-react';

import { IconButton } from '../ui';
import {
  separarFilhos,
  type CategoriaSetor,
  type EstruturaOrganograma,
  type FilhosPorSetor,
} from '../../domain/organograma';
import type { Setor } from '../../types/organograma';

type OrganogramaProps = {
  estrutura: EstruturaOrganograma;
  filhos: FilhosPorSetor;
  categorias: ReadonlyMap<string, CategoriaSetor>;
  selecionadoId?: string;
  onSelecionar: (id: string) => void;
};

type Contexto = Pick<
  OrganogramaProps,
  'filhos' | 'categorias' | 'selecionadoId' | 'onSelecionar'
>;

const OrganogramaContexto = createContext<Contexto | null>(null);

function useOrganograma(): Contexto {
  const contexto = useContext(OrganogramaContexto);
  if (!contexto) throw new Error('Use dentro de <Organograma>.');
  return contexto;
}

const ZOOM_MINIMO = 0.12;
const ZOOM_MAXIMO = 2;
/** Zoom mínimo ao centralizar um setor: o nome precisa ficar legível. */
const ZOOM_LEGIVEL = 0.9;
const PASSO_BOTAO = 1.25;
const SENSIBILIDADE_RODA = 0.0015;
/** Abaixo disso um clique não vira arraste. */
const LIMIAR_ARRASTE_PX = 4;
const MARGEM_TOPO_PX = 24;

function Caixa({
  setor,
  destaque,
}: {
  setor: Setor;
  destaque?: 'gabinete' | 'raiz';
}) {
  const { categorias, selecionadoId, onSelecionar } = useOrganograma();
  return (
    <button
      type="button"
      className={`org-caixa ${destaque ? `org-caixa--${destaque}` : ''}`.trim()}
      data-setor={setor.id}
      data-categoria={categorias.get(setor.id)}
      aria-pressed={setor.id === selecionadoId}
      onClick={() => onSelecionar(setor.id)}
    >
      {setor.nome}
    </button>
  );
}

/** Caixa do setor e, abaixo, os subordinados em lista recuada (como no PDF). */
function SetorComSubordinados({ setor }: { setor: Setor }) {
  const { filhos } = useOrganograma();
  const subordinados = filhos.get(setor.id);
  return (
    <>
      <Caixa setor={setor} />
      {subordinados && (
        <ul className="org-ramo">
          {subordinados.map((filho) => (
            <Ramo key={filho.id} setor={filho} />
          ))}
        </ul>
      )}
    </>
  );
}

function Ramo({ setor }: { setor: Setor }) {
  return (
    <li className="org-ramo__item" data-vinculo={setor.vinculo}>
      <SetorComSubordinados setor={setor} />
    </li>
  );
}

/** Divide os itens em duas colunas, preenchendo a da esquerda primeiro. */
function emDuasColunas<T>(itens: T[]): [T[], T[]] {
  const metade = Math.ceil(itens.length / 2);
  return [itens.slice(0, metade), itens.slice(metade)];
}

/**
 * Gabinete adjunto: unidades e depois os ramos, em duas colunas ao redor de um
 * tronco central; cada caixa liga-se ao tronco por um traço, como no PDF.
 */
function ColunaGabinete({ gabinete }: { gabinete: Setor }) {
  const { filhos } = useOrganograma();
  const { folhas, ramos } = separarFilhos(gabinete.id, filhos);
  const itens = [...folhas, ...ramos];
  const inicioUltimaLinha = itens.length - (itens.length % 2 === 0 ? 2 : 1);
  return (
    <li className="org-coluna" data-vinculo={gabinete.vinculo}>
      <div className="org-coluna__cabeca">
        <Caixa setor={gabinete} destaque="gabinete" />
      </div>
      {itens.length > 0 && (
        <ul className="org-filhos">
          {itens.map((setor, indice) => (
            <li
              key={setor.id}
              className={[
                'org-filhos__item',
                indice % 2 ? 'is-direita' : 'is-esquerda',
                indice >= inicioUltimaLinha ? 'is-ultima-linha' : '',
              ]
                .join(' ')
                .trim()}
              data-vinculo={setor.vinculo}
            >
              <SetorComSubordinados setor={setor} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** Arraste e zoom aplicados direto no DOM, sem re-renderizar as 347 caixas. */
function useNavegacao() {
  const janelaRef = useRef<HTMLDivElement>(null);
  const quadroRef = useRef<HTMLDivElement>(null);
  const vista = useRef({ x: 0, y: 0, k: 1 });

  function aplicar(animar = false) {
    const quadro = quadroRef.current;
    if (!quadro) return;
    const { x, y, k } = vista.current;
    quadro.classList.toggle('is-animando', animar);
    quadro.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
  }

  const limitar = (k: number) =>
    Math.min(ZOOM_MAXIMO, Math.max(ZOOM_MINIMO, k));

  function zoomEm(px: number, py: number, novoK: number, animar = false) {
    const { x, y, k } = vista.current;
    const alvo = limitar(novoK);
    vista.current = {
      k: alvo,
      x: px - (px - x) * (alvo / k),
      y: py - (py - y) * (alvo / k),
    };
    aplicar(animar);
  }

  /** Posição do elemento no quadro, sem o zoom aplicado. */
  function posicaoNoQuadro(elemento: HTMLElement) {
    const quadro = quadroRef.current!.getBoundingClientRect();
    const caixa = elemento.getBoundingClientRect();
    const { k } = vista.current;
    return {
      x: (caixa.left - quadro.left) / k,
      y: (caixa.top - quadro.top) / k,
      largura: caixa.width / k,
      altura: caixa.height / k,
    };
  }

  function centralizar(elemento: HTMLElement) {
    const janela = janelaRef.current;
    if (!janela) return;
    const k = Math.max(vista.current.k, ZOOM_LEGIVEL);
    const alvo = posicaoNoQuadro(elemento);
    vista.current = {
      k,
      x: janela.clientWidth / 2 - (alvo.x + alvo.largura / 2) * k,
      y: janela.clientHeight / 3 - (alvo.y + alvo.altura / 2) * k,
    };
    aplicar(true);
  }

  function irParaTopo(animar = true) {
    const janela = janelaRef.current;
    const raiz =
      quadroRef.current?.querySelector<HTMLElement>('.org-caixa--raiz');
    if (!janela || !raiz) return;
    const alvo = posicaoNoQuadro(raiz);
    vista.current = {
      k: 1,
      x: janela.clientWidth / 2 - (alvo.x + alvo.largura / 2),
      y: MARGEM_TOPO_PX - alvo.y,
    };
    aplicar(animar);
  }

  function ajustarATela() {
    const janela = janelaRef.current;
    const quadro = quadroRef.current;
    if (!janela || !quadro) return;
    const largura = quadro.scrollWidth;
    const altura = quadro.scrollHeight;
    const k = limitar(
      Math.min(janela.clientWidth / largura, janela.clientHeight / altura) *
        0.96
    );
    vista.current = {
      k,
      x: (janela.clientWidth - largura * k) / 2,
      y: (janela.clientHeight - altura * k) / 2,
    };
    aplicar(true);
  }

  function zoomPorBotao(fator: number) {
    const janela = janelaRef.current;
    if (!janela) return;
    zoomEm(
      janela.clientWidth / 2,
      janela.clientHeight / 2,
      vista.current.k * fator,
      true
    );
  }

  useEffect(() => {
    const janela = janelaRef.current;
    if (!janela) return;
    let inicio: { x: number; y: number; vx: number; vy: number } | null = null;
    let arrastando = false;

    function aoRolar(evento: WheelEvent) {
      evento.preventDefault();
      const caixa = janela!.getBoundingClientRect();
      zoomEm(
        evento.clientX - caixa.left,
        evento.clientY - caixa.top,
        vista.current.k * Math.exp(-evento.deltaY * SENSIBILIDADE_RODA)
      );
    }
    function aoPressionar(evento: PointerEvent) {
      if (evento.button !== 0) return;
      inicio = {
        x: evento.clientX,
        y: evento.clientY,
        vx: vista.current.x,
        vy: vista.current.y,
      };
      arrastando = false;
    }
    function aoMover(evento: PointerEvent) {
      if (!inicio) return;
      const dx = evento.clientX - inicio.x;
      const dy = evento.clientY - inicio.y;
      if (!arrastando && Math.hypot(dx, dy) < LIMIAR_ARRASTE_PX) return;
      if (!arrastando) janela!.setPointerCapture(evento.pointerId);
      arrastando = true;
      janela!.classList.add('is-arrastando');
      vista.current = {
        ...vista.current,
        x: inicio.vx + dx,
        y: inicio.vy + dy,
      };
      aplicar();
    }
    function aoSoltar() {
      inicio = null;
      janela!.classList.remove('is-arrastando');
    }
    // Um arraste que termina sobre uma caixa não deve selecioná-la.
    function aoClicar(evento: MouseEvent) {
      if (!arrastando) return;
      arrastando = false;
      evento.stopPropagation();
      evento.preventDefault();
    }

    janela.addEventListener('wheel', aoRolar, { passive: false });
    janela.addEventListener('pointerdown', aoPressionar);
    janela.addEventListener('pointermove', aoMover);
    janela.addEventListener('pointerup', aoSoltar);
    janela.addEventListener('pointercancel', aoSoltar);
    janela.addEventListener('click', aoClicar, true);
    return () => {
      janela.removeEventListener('wheel', aoRolar);
      janela.removeEventListener('pointerdown', aoPressionar);
      janela.removeEventListener('pointermove', aoMover);
      janela.removeEventListener('pointerup', aoSoltar);
      janela.removeEventListener('pointercancel', aoSoltar);
      janela.removeEventListener('click', aoClicar, true);
    };
  }, []);

  return {
    janelaRef,
    quadroRef,
    centralizar,
    irParaTopo,
    ajustarATela,
    zoomPorBotao,
  };
}

/** Organograma no arranjo do PDF oficial: caixas, linhas e faixa das regionais. */
export function Organograma({
  estrutura,
  filhos,
  categorias,
  selecionadoId,
  onSelecionar,
}: OrganogramaProps) {
  const navegacao = useNavegacao();
  const [apoioEsquerda, apoioDireita] = emDuasColunas(estrutura.apoio);
  const gestaoRegional = estrutura.faixaRegional[0]?.paiId;
  const nomeGestaoRegional = estrutura.gabinetes.find(
    (gabinete) => gabinete.id === gestaoRegional
  )?.nome;

  useLayoutEffect(() => {
    navegacao.irParaTopo(false);
    // Só na abertura: depois a vista é do usuário.
  }, []);

  useEffect(() => {
    if (!selecionadoId) return;
    const caixa = navegacao.quadroRef.current?.querySelector<HTMLElement>(
      `[data-setor="${selecionadoId}"]`
    );
    if (caixa) navegacao.centralizar(caixa);
  }, [selecionadoId]);

  /** Tab até uma caixa fora da vista traz a caixa para o centro. */
  function aoFocar(evento: FocusEvent<HTMLDivElement>) {
    const alvo = evento.target;
    const janela = navegacao.janelaRef.current;
    if (!(alvo instanceof HTMLElement) || !alvo.matches('.org-caixa')) return;
    if (!janela || !alvo.matches(':focus-visible')) return;
    const caixa = alvo.getBoundingClientRect();
    const area = janela.getBoundingClientRect();
    const visivel =
      caixa.left >= area.left &&
      caixa.right <= area.right &&
      caixa.top >= area.top &&
      caixa.bottom <= area.bottom;
    if (!visivel) navegacao.centralizar(alvo);
  }

  return (
    <OrganogramaContexto.Provider
      value={{ filhos, categorias, selecionadoId, onSelecionar }}
    >
      <div className="org-controles" role="group" aria-label="Zoom">
        <IconButton
          icon={Plus}
          label="Aumentar zoom"
          onClick={() => navegacao.zoomPorBotao(PASSO_BOTAO)}
        />
        <IconButton
          icon={Minus}
          label="Diminuir zoom"
          onClick={() => navegacao.zoomPorBotao(1 / PASSO_BOTAO)}
        />
        <IconButton
          icon={Maximize}
          label="Ajustar à tela"
          onClick={navegacao.ajustarATela}
        />
        <IconButton
          icon={House}
          label="Voltar ao topo"
          onClick={() => navegacao.irParaTopo()}
        />
      </div>
      <div
        ref={navegacao.janelaRef}
        className="org-janela"
        role="region"
        aria-label="Organograma"
        onFocus={aoFocar}
      >
        <div ref={navegacao.quadroRef} className="org-quadro">
          <div className="org-topo">
            <ul className="org-colegiados" aria-label="Colegiados">
              {estrutura.colegiados.map((setor) => (
                <li key={setor.id}>
                  <Caixa setor={setor} />
                </li>
              ))}
            </ul>
            <div className="org-centro">
              <div className="org-raiz">
                <Caixa setor={estrutura.raiz} destaque="raiz" />
              </div>
              <div className="org-apoio">
                {[apoioEsquerda, apoioDireita].map((lista, indice) => (
                  <ul
                    key={indice}
                    className={`org-apoio__lado org-apoio__lado--${indice ? 'direita' : 'esquerda'}`}
                  >
                    {lista.map((setor) => (
                      <li key={setor.id} data-vinculo={setor.vinculo}>
                        <Caixa setor={setor} />
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
            <div className="org-conselhos">
              {estrutura.conselhos.map((conselho) => (
                <ul key={conselho.id} className="org-ramo org-ramo--raiz">
                  <Ramo setor={conselho} />
                </ul>
              ))}
            </div>
          </div>

          <ul className="org-linha" aria-label="Gabinetes adjuntos">
            {estrutura.gabinetes.map((gabinete) => (
              <ColunaGabinete key={gabinete.id} gabinete={gabinete} />
            ))}
          </ul>

          {estrutura.faixaRegional.length > 0 && (
            <section className="org-faixa" aria-label="Diretorias regionais">
              {nomeGestaoRegional && (
                <p className="org-faixa__legenda">
                  Vinculadas ao {nomeGestaoRegional}
                </p>
              )}
              <ul className="org-linha org-linha--vinculacao">
                {estrutura.faixaRegional.map((setor) => (
                  <li key={setor.id} className="org-coluna">
                    <ul className="org-ramo org-ramo--raiz">
                      <Ramo setor={setor} />
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </OrganogramaContexto.Provider>
  );
}
