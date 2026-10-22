import { FileSpreadsheet, ImagePlus, Plus } from 'lucide-react';
import { coresPadrao, iconesDisponiveis } from './constantes';

type IdentidadeVisualProps = {
  iconeSelecionado: string;
  iconePersonalizado: string | null;
  corIcone: string;
  onSelecionarIcone: (id: string) => void;
  onSelecionarImagem: (arquivo: File | null) => void;
  onSelecionarCor: (cor: string) => void;
};

/** Prévia, ícone e cor do processo. As cores de identidade são a única exceção à paleta. */
export function IdentidadeVisual({
  iconeSelecionado,
  iconePersonalizado,
  corIcone,
  onSelecionarIcone,
  onSelecionarImagem,
  onSelecionarCor,
}: IdentidadeVisualProps) {
  const IconeAtual =
    iconesDisponiveis.find((item) => item.id === iconeSelecionado)?.icone ??
    FileSpreadsheet;

  return (
    <div
      className="np-identidade"
      role="group"
      aria-labelledby="identidade-visual-rotulo"
    >
      <p id="identidade-visual-rotulo" className="ui-field__label">
        Identidade visual
      </p>

      <div className="np-identidade__corpo">
        <div className="np-identidade__previa">
          {iconePersonalizado ? (
            <img
              width={64}
              height={64}
              src={iconePersonalizado}
              alt="Ícone personalizado"
            />
          ) : (
            <span
              role="img"
              aria-label="Prévia do ícone do processo"
              className="np-identidade__amostra"
              style={{ backgroundColor: corIcone }}
            >
              <IconeAtual size={28} strokeWidth={2.2} aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="np-identidade__opcoes">
          <div role="group" aria-labelledby="identidade-icone-rotulo">
            <span id="identidade-icone-rotulo" className="np-rotulo-grupo">
              Ícone
            </span>
            <div className="np-identidade__icones">
              {iconesDisponiveis.map((item) => {
                const Icone = item.icone;
                const selecionado =
                  iconeSelecionado === item.id && !iconePersonalizado;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.nome}
                    aria-label={item.nome}
                    aria-pressed={selecionado}
                    onClick={() => onSelecionarIcone(item.id)}
                    className="np-icone-opcao"
                  >
                    <Icone size={18} aria-hidden="true" />
                  </button>
                );
              })}

              <label
                title="Selecionar imagem do computador"
                className={`np-icone-opcao np-icone-opcao--upload ${
                  iconePersonalizado ? 'np-icone-opcao--ativo' : ''
                }`}
              >
                {iconePersonalizado ? (
                  <img width={40} height={40} src={iconePersonalizado} alt="" />
                ) : (
                  <ImagePlus size={18} aria-hidden="true" />
                )}
                <input
                  autoComplete="off"
                  aria-label="Imagem personalizada"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) =>
                    onSelecionarImagem(event.target.files?.[0] ?? null)
                  }
                />
              </label>
            </div>
          </div>

          <div role="group" aria-labelledby="identidade-cor-rotulo">
            <span id="identidade-cor-rotulo" className="np-rotulo-grupo">
              Cor
            </span>
            <div className="np-identidade__cores">
              {coresPadrao.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  aria-label={'Cor ' + cor}
                  aria-pressed={corIcone === cor && !iconePersonalizado}
                  onClick={() => onSelecionarCor(cor)}
                  className="np-cor-opcao"
                  style={{ backgroundColor: cor }}
                />
              ))}

              <label
                title="Escolher cor personalizada"
                className="np-cor-opcao np-cor-opcao--personalizada"
              >
                <span className="np-cor-opcao__miolo">
                  <Plus size={14} aria-hidden="true" />
                </span>
                <input
                  autoComplete="off"
                  id="cor"
                  name="cor"
                  type="color"
                  aria-label="Cor personalizada"
                  value={corIcone}
                  onChange={(event) => onSelecionarCor(event.target.value)}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
