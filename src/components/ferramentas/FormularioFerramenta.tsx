import {
  AlertCircle,
  Equal,
  Layers,
  Plus,
  Rows3,
  TextSearch,
  Trash2,
} from 'lucide-react';
import type { AbaPrevista } from '../../domain/ferramentas';
import type {
  ErroParametro,
  ParametrosDicionario,
  ParametrosFerramenta,
} from '../../types/ferramenta';
import { Button, Field, IconButton, OptionCard, SelectableChip } from '../ui';

type FormularioFerramentaProps = {
  /** Prefixo dos ids: a mesma ferramenta pode aparecer na aba e numa etapa. */
  idBase: string;
  parametros: ParametrosFerramenta;
  colunas: string[];
  onChange: (parametros: ParametrosFerramenta) => void;
  erros?: ErroParametro[];
  previaAbas?: AbaPrevista[];
};

/** Parâmetros de uma ferramenta. Controlado: quem usa decide se o valor é salvo. */
export function FormularioFerramenta({
  idBase,
  parametros,
  colunas,
  onChange,
  erros = [],
  previaAbas,
}: FormularioFerramentaProps) {
  const erroDe = (campo: string) =>
    erros.find((erro) => erro.campo === campo)?.mensagem;
  const id = (campo: string) => `${idBase}-${campo}`;

  switch (parametros.ferramentaId) {
    case 'zebrar-planilha': {
      const cores = [
        ['corCabecalho', 'Cor do cabeçalho'],
        ['corLinhaA', 'Cor das linhas ímpares'],
        ['corLinhaB', 'Cor das linhas pares'],
      ] as const;
      return (
        <div className="ferramenta-form ferramenta-form--zebra">
          <div className="ferramenta-form__cores">
            {cores.map(([campo, rotulo]) => (
              <Field
                key={campo}
                id={id(campo)}
                label={rotulo}
                error={erroDe(campo)}
              >
                {(controle) => (
                  <CampoCor
                    controle={controle}
                    rotulo={rotulo}
                    valor={parametros[campo]}
                    onChange={(cor) =>
                      onChange({ ...parametros, [campo]: cor })
                    }
                  />
                )}
              </Field>
            ))}
          </div>
          <PreviaZebra
            corCabecalho={parametros.corCabecalho}
            corLinhaA={parametros.corLinhaA}
            corLinhaB={parametros.corLinhaB}
          />
        </div>
      );
    }

    case 'eliminar-duplicatas':
      return (
        <div className="ferramenta-form">
          <fieldset
            className="ferramenta-form__grupo"
            aria-describedby={
              erroDe('colunasChave') ? id('colunasChave-erro') : undefined
            }
          >
            <legend className="ui-field__label">
              Colunas que identificam a linha
            </legend>
            <p className="ui-field__hint">
              Duplicadas são as linhas com o valor exatamente igual em todas as
              colunas escolhidas (espaço, maiúscula e acento contam). De cada
              grupo, o sistema sorteia uma linha para permanecer.
            </p>
            <ListaDeColunas
              id={id('colunasChave')}
              colunas={colunas}
              selecionadas={parametros.colunasChave}
              onAlternar={(coluna) =>
                onChange({
                  ...parametros,
                  colunasChave: parametros.colunasChave.includes(coluna)
                    ? parametros.colunasChave.filter((item) => item !== coluna)
                    : [...parametros.colunasChave, coluna],
                })
              }
            />
            {erroDe('colunasChave') && (
              <p
                id={id('colunasChave-erro')}
                className="ui-field__error"
                role="alert"
              >
                {erroDe('colunasChave')}
              </p>
            )}
          </fieldset>
        </div>
      );

    case 'dicionario':
      return (
        <FormularioDicionario
          id={id}
          parametros={parametros}
          colunas={colunas}
          onChange={onChange}
          erroDe={erroDe}
        />
      );

    case 'mesclar-planilhas':
      return (
        <div className="ferramenta-form">
          <fieldset className="ferramenta-form__grupo">
            <legend className="ui-field__label">Como mesclar</legend>
            <div className="ferramenta-form__opcoes">
              <OptionCard
                icon={Rows3}
                title="Empilhar linhas"
                description="Une as linhas numa única aba. Os cabeçalhos precisam ser iguais."
                selected={parametros.modo === 'vertical'}
                onSelect={() => onChange({ ...parametros, modo: 'vertical' })}
              />
              <OptionCard
                icon={Layers}
                title="Uma aba por arquivo"
                description="Cada arquivo vira uma aba do resultado, sem exigir cabeçalhos iguais."
                selected={parametros.modo === 'abas'}
                onSelect={() => onChange({ ...parametros, modo: 'abas' })}
              />
            </div>
          </fieldset>
          {erroDe('arquivos') && (
            <p className="ui-alert ui-alert--error" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              {erroDe('arquivos')}
            </p>
          )}
        </div>
      );

    case 'dividir-por':
      return (
        <div className="ferramenta-form">
          <Field
            id={id('coluna')}
            label="Coluna"
            hint="Cada valor diferente dessa coluna vira uma aba. A aba consolidada é mantida."
            error={erroDe('coluna')}
          >
            {(controle) => (
              <SeletorDeColuna
                controle={controle}
                colunas={colunas}
                valor={parametros.coluna}
                onChange={(coluna) => onChange({ ...parametros, coluna })}
              />
            )}
          </Field>
          {previaAbas && previaAbas.length > 0 && (
            <div className="ferramenta-previa">
              <p className="ui-field__label" id={id('previa')}>
                Abas que serão criadas
              </p>
              <ul
                className="ferramenta-previa__abas"
                aria-labelledby={id('previa')}
              >
                <li>
                  <span>Consolidada</span>
                  <span className="ferramenta-previa__info">
                    todas as linhas
                  </span>
                </li>
                {previaAbas.map((aba) => (
                  <li key={aba.nome}>
                    <span>{aba.nome}</span>
                    <span className="ferramenta-previa__info">
                      {aba.linhas} {aba.linhas === 1 ? 'linha' : 'linhas'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
  }
}

function FormularioDicionario({
  id,
  parametros,
  colunas,
  onChange,
  erroDe,
}: {
  id: (campo: string) => string;
  parametros: ParametrosDicionario;
  colunas: string[];
  onChange: (parametros: ParametrosFerramenta) => void;
  erroDe: (campo: string) => string | undefined;
}) {
  // Depois de adicionar ou remover, o foco vai para o campo afetado.
  const atualizarValores = (valores: string[], focar?: number) => {
    onChange({ ...parametros, valores });
    if (focar !== undefined)
      requestAnimationFrame(() =>
        document.getElementById(id(`valor-${focar}`))?.focus()
      );
  };
  const erroValores = erroDe('valores');
  return (
    <div className="ferramenta-form">
      <Field id={id('coluna')} label="Coluna" error={erroDe('coluna')}>
        {(controle) => (
          <SeletorDeColuna
            controle={controle}
            colunas={colunas}
            valor={parametros.coluna}
            onChange={(coluna) => onChange({ ...parametros, coluna })}
          />
        )}
      </Field>
      <fieldset className="ferramenta-form__grupo">
        <legend className="ui-field__label">Como comparar</legend>
        <div className="ferramenta-form__opcoes">
          <OptionCard
            icon={TextSearch}
            title="Contém"
            description="Mantém a linha se o texto da célula contém o valor."
            selected={parametros.modo === 'contem'}
            onSelect={() => onChange({ ...parametros, modo: 'contem' })}
          />
          <OptionCard
            icon={Equal}
            title="Valor exato"
            description="Mantém a linha só se a célula for igual ao valor."
            selected={parametros.modo === 'exato'}
            onSelect={() => onChange({ ...parametros, modo: 'exato' })}
          />
        </div>
      </fieldset>
      <fieldset
        className="ferramenta-form__grupo"
        aria-describedby={`${id('valores-dica')}${erroValores ? ` ${id('valores-erro')}` : ''}`}
      >
        <legend className="ui-field__label">Valores para manter</legend>
        <p id={id('valores-dica')} className="ui-field__hint">
          Mantém só as linhas que correspondem a algum valor. Maiúsculas e
          acentos não fazem diferença.
        </p>
        <ol id={id('valores')} className="ferramenta-valores">
          {parametros.valores.map((valor, indice) => (
            <li key={indice}>
              <input
                className="ui-input"
                id={id(`valor-${indice}`)}
                aria-label={`Valor ${indice + 1}`}
                aria-invalid={erroValores && !valor.trim() ? true : undefined}
                value={valor}
                placeholder="Ex.: celular"
                autoComplete="off"
                onChange={(event) =>
                  atualizarValores(
                    parametros.valores.map((item, i) =>
                      i === indice ? event.target.value : item
                    )
                  )
                }
              />
              <IconButton
                icon={Trash2}
                label={`Remover valor ${indice + 1}`}
                variant="danger"
                size="sm"
                disabled={parametros.valores.length === 1}
                onClick={() =>
                  atualizarValores(
                    parametros.valores.filter((_, i) => i !== indice),
                    Math.max(0, indice - 1)
                  )
                }
              />
            </li>
          ))}
        </ol>
        <div>
          <Button
            size="sm"
            icon={Plus}
            onClick={() =>
              atualizarValores(
                [...parametros.valores, ''],
                parametros.valores.length
              )
            }
          >
            Adicionar valor
          </Button>
        </div>
        {erroValores && (
          <p id={id('valores-erro')} className="ui-field__error" role="alert">
            {erroValores}
          </p>
        )}
      </fieldset>
    </div>
  );
}

type ControleCampo = Parameters<Parameters<typeof Field>[0]['children']>[0];

function SeletorDeColuna({
  controle,
  colunas,
  valor,
  onChange,
}: {
  controle: ControleCampo;
  colunas: string[];
  valor: string;
  onChange: (coluna: string) => void;
}) {
  const opcoes =
    valor && !colunas.includes(valor) ? [valor, ...colunas] : colunas;
  return (
    <select
      {...controle}
      className="ui-input"
      value={valor}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">
        {colunas.length
          ? 'Selecione a coluna…'
          : 'Selecione um arquivo para listar as colunas'}
      </option>
      {opcoes.map((coluna) => (
        <option key={coluna} value={coluna}>
          {coluna}
        </option>
      ))}
    </select>
  );
}

function ListaDeColunas({
  id,
  colunas,
  selecionadas,
  onAlternar,
}: {
  id: string;
  colunas: string[];
  selecionadas: string[];
  onAlternar: (coluna: string) => void;
}) {
  const todas = [
    ...selecionadas.filter((coluna) => !colunas.includes(coluna)),
    ...colunas,
  ];
  if (!todas.length) {
    return (
      <p className="ui-empty">Selecione um arquivo para listar as colunas.</p>
    );
  }
  return (
    <div id={id} className="ferramenta-colunas">
      {todas.map((coluna) => (
        <SelectableChip
          key={coluna}
          selected={selecionadas.includes(coluna)}
          onToggle={() => onAlternar(coluna)}
        >
          {coluna}
        </SelectableChip>
      ))}
    </div>
  );
}

const COR_HEX = /^#[0-9a-f]{6}$/i;

function CampoCor({
  controle,
  rotulo,
  valor,
  onChange,
}: {
  controle: ControleCampo;
  rotulo: string;
  valor: string;
  onChange: (cor: string) => void;
}) {
  return (
    <div className="ferramenta-cor">
      <input
        type="color"
        className="ferramenta-cor__amostra"
        aria-label={`${rotulo}: seletor`}
        value={COR_HEX.test(valor) ? valor : '#000000'}
        onChange={(event) => onChange(event.target.value)}
      />
      <input
        {...controle}
        className="ui-input ui-input--mono"
        value={valor}
        maxLength={7}
        spellCheck={false}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value.trim())}
      />
    </div>
  );
}

/** Texto legível sobre a cor escolhida (luminância relativa simplificada). */
function corDeTexto(fundo: string) {
  if (!COR_HEX.test(fundo)) return '#16283f';
  const [r, g, b] = [1, 3, 5].map(
    (i) => parseInt(fundo.slice(i, i + 2), 16) / 255
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 ? '#16283f' : '#ffffff';
}

function PreviaZebra({
  corCabecalho,
  corLinhaA,
  corLinhaB,
}: {
  corCabecalho: string;
  corLinhaA: string;
  corLinhaB: string;
}) {
  const linhas = ['Linha 1', 'Linha 2', 'Linha 3', 'Linha 4'];
  return (
    <figure className="ferramenta-zebra">
      <figcaption className="ui-field__label">Prévia</figcaption>
      <div className="ferramenta-zebra__tabela" aria-hidden="true">
        <div
          style={{ background: corCabecalho, color: corDeTexto(corCabecalho) }}
        >
          Cabeçalho
        </div>
        {linhas.map((linha, indice) => {
          const cor = indice % 2 === 0 ? corLinhaA : corLinhaB;
          return (
            <div
              key={linha}
              style={{ background: cor, color: corDeTexto(cor) }}
            >
              {linha}
            </div>
          );
        })}
      </div>
    </figure>
  );
}
