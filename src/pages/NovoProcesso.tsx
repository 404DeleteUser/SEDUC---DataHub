import PageHeader, { ProcessSteps } from '../components/PageHeader';
import FolderPicker from '../components/FolderPicker';
import { useEffect, useState } from 'react';

import type { ProcessoBase, AuxiliarProcesso } from '../types/processo';

import {
  ChevronRight,
  Database,
  FileCode2,
  FileIcon,
  Folder,
  Wrench,
} from 'lucide-react';

import {
  Button,
  Field,
  FileField,
  OptionCard,
  SectionTitle,
  SimulationNotice,
} from '../components/ui';
import { ArquivosAuxiliares } from './novo-processo/ArquivosAuxiliares';
import { IdentidadeVisual } from './novo-processo/IdentidadeVisual';
import { IndiceSecoes } from './novo-processo/IndiceSecoes';
import { ResumoErros } from './novo-processo/ResumoErros';
import {
  LIMITE_AUXILIARES,
  coresPadrao,
  type ErroCampo,
} from './novo-processo/constantes';

/* ========================================================= */
/* PROPS */
/* ========================================================= */

type NovoProcessoProps = {
  processoInicial?: ProcessoBase | null;
  modoEdicao?: boolean;
  onVoltar: () => void;
  onProximo: (processo: ProcessoBase) => void;
};

type Auxiliar = AuxiliarProcesso;

/** IDs das seções (âncoras do índice lateral). */
const SECOES = {
  origem: 'secao-origem',
  gerais: 'secao-informacoes-gerais',
  principais: 'secao-arquivos-principais',
  auxiliares: 'secao-arquivos-auxiliares',
  saida: 'secao-saida',
} as const;

/* ========================================================= */
/* COMPONENTE */
/* ========================================================= */

function NovoProcesso({
  onVoltar,
  onProximo,
  processoInicial,
  modoEdicao = false,
}: NovoProcessoProps) {
  /* ===================================================== */
  /* INFORMAÇÕES GERAIS */
  /* ===================================================== */

  const [errosFormulario, setErrosFormulario] = useState<ErroCampo[]>([]);
  const [nome, setNome] = useState(processoInicial?.nome ?? '');
  const [descricao, setDescricao] = useState(processoInicial?.descricao ?? '');

  const [iconeSelecionado, setIconeSelecionado] = useState(
    processoInicial?.identidadeVisual.icone ?? 'planilha'
  );

  const [iconePersonalizado, setIconePersonalizado] = useState<string | null>(
    null
  );

  const [arquivoIconePersonalizado, setArquivoIconePersonalizado] =
    useState<File | null>(
      processoInicial?.identidadeVisual.imagemPersonalizada ?? null
    );

  const [corIcone, setCorIcone] = useState(
    processoInicial?.identidadeVisual.cor ?? coresPadrao[0]
  );

  /* ===================================================== */
  /* ARQUIVOS PRINCIPAIS E ORIGEM */
  /* ===================================================== */

  const [principal1, setPrincipal1] = useState<File | null>(
    processoInicial?.arquivosPrincipais.principal1 ?? null
  );

  const [principal2, setPrincipal2] = useState<File | null>(
    processoInicial?.arquivosPrincipais.principal2 ?? null
  );

  const [modoPrincipais, setModoPrincipais] = useState<
    'concatenar' | 'separados'
  >(processoInicial?.arquivosPrincipais.modo ?? 'concatenar');
  const [origem, setOrigem] = useState(
    processoInicial?.origem ?? 'ferramentas'
  );
  const [scriptPython, setScriptPython] = useState<File | null>(
    processoInicial?.scriptPython ?? null
  );

  /* ===================================================== */
  /* ARQUIVOS AUXILIARES */
  /* ===================================================== */

  const [auxiliares, setAuxiliares] = useState<Auxiliar[]>(
    processoInicial?.auxiliares ?? []
  );

  /* ===================================================== */
  /* SAÍDA */
  /* ===================================================== */

  const [nomeSaida, setNomeSaida] = useState(processoInicial?.saida.nome ?? '');
  const [formatoSaida, setFormatoSaida] = useState(
    processoInicial?.saida.formato ?? 'xlsx'
  );
  const [pastaDestino, setPastaDestino] = useState(
    processoInicial?.saida.pastaDestino ?? ''
  );

  /* ===================================================== */
  /* FUNÇÕES */
  /* ===================================================== */

  useEffect(() => {
    if (!arquivoIconePersonalizado) {
      setIconePersonalizado(null);
      return;
    }
    const url = URL.createObjectURL(arquivoIconePersonalizado);
    setIconePersonalizado(url);
    return () => URL.revokeObjectURL(url);
  }, [arquivoIconePersonalizado]);

  function adicionarAuxiliar() {
    if (auxiliares.length >= LIMITE_AUXILIARES) {
      return;
    }

    setAuxiliares((anterior) => [
      ...anterior,
      {
        id: Date.now(),
        nome: '',
        arquivo: null,
      },
    ]);
  }

  function removerAuxiliar(id: number) {
    setAuxiliares((anterior) =>
      anterior.filter((auxiliar) => auxiliar.id !== id)
    );
  }

  function atualizarNomeAuxiliar(id: number, nomeAuxiliar: string) {
    setAuxiliares((anterior) =>
      anterior.map((auxiliar) =>
        auxiliar.id === id ? { ...auxiliar, nome: nomeAuxiliar } : auxiliar
      )
    );
  }

  function atualizarArquivoAuxiliar(id: number, arquivo: File | null) {
    setAuxiliares((anterior) =>
      anterior.map((auxiliar) =>
        auxiliar.id === id ? { ...auxiliar, arquivo } : auxiliar
      )
    );
  }

  function selecionarIcone(id: string) {
    setIconeSelecionado(id);
    setIconePersonalizado(null);
    setArquivoIconePersonalizado(null);
  }

  function selecionarImagemPersonalizada(arquivo: File | null) {
    if (!arquivo) {
      return;
    }

    setArquivoIconePersonalizado(arquivo);
    setIconeSelecionado('personalizado');
  }

  function selecionarScriptPython(arquivo: File | null) {
    if (arquivo && !arquivo.name.toLowerCase().endsWith('.py')) {
      setErrosFormulario([
        {
          id: 'arquivo-script-python',
          mensagem: 'Selecione um arquivo .py.',
        },
      ]);
      return;
    }
    if (arquivo) setScriptPython(arquivo);
    setErrosFormulario((erros) =>
      erros.filter((erro) => erro.id !== 'arquivo-script-python')
    );
  }

  function proximo() {
    if (modoEdicao) {
      if (origem === 'script-python' && !scriptPython) {
        setErrosFormulario([
          {
            id: 'arquivo-script-python',
            mensagem: 'Selecione o script Python que deseja conectar.',
          },
        ]);
        document.getElementById('arquivo-script-python')?.focus();
        return;
      }
      setErrosFormulario([]);
      onProximo(montarProcesso());
      return;
    }
    const camposObrigatorios = [
      {
        id: 'nome-do-processo',
        preenchido: !!nome.trim(),
        mensagem: 'Informe o nome do processo.',
      },
      {
        id: 'principal-1',
        preenchido: !!principal1,
        mensagem: 'Selecione o arquivo principal.',
      },
      ...(origem === 'script-python'
        ? [
            {
              id: 'arquivo-script-python',
              preenchido: !!scriptPython,
              mensagem: 'Selecione o script Python que deseja conectar.',
            },
          ]
        : []),
      {
        id: 'nome-do-arquivo-de-sa-da',
        preenchido: !!nomeSaida.trim(),
        mensagem: 'Informe o nome do arquivo de saída.',
      },
      {
        id: 'pasta-de-destino',
        preenchido: !!pastaDestino.trim(),
        mensagem: 'Selecione a pasta de destino.',
      },
    ];
    const pendencias = camposObrigatorios
      .filter((campo) => !campo.preenchido)
      .map(({ id, mensagem }) => ({ id, mensagem }));
    setErrosFormulario(pendencias);
    if (pendencias.length) {
      document.getElementById(pendencias[0].id)?.focus();
      return;
    }
    onProximo(montarProcesso());
  }

  function montarProcesso(): ProcessoBase {
    const etapasExistentes = processoInicial?.etapas ?? [];
    const etapasSemScript = etapasExistentes.filter(
      (etapa) => etapa.ferramentaId !== 'script-python'
    );
    const etapas =
      origem === 'script-python' && scriptPython
        ? etapasExistentes.some(
            (etapa) => etapa.ferramentaId === 'script-python'
          )
          ? etapasExistentes
          : [
              ...etapasSemScript,
              {
                id: Date.now(),
                ferramentaId: 'script-python',
                planilhas: [],
                condicao: {
                  ativa: false,
                  tipo: 'coluna-existe' as const,
                  arquivoId: '',
                  coluna: '',
                  valor: '',
                },
              },
            ]
        : etapasSemScript;
    return {
      origem,
      scriptPython,
      etapas,
      nome,
      descricao,

      identidadeVisual: {
        icone: iconeSelecionado,
        imagemPersonalizada: arquivoIconePersonalizado,
        cor: corIcone,
      },

      arquivosPrincipais: {
        principal1,
        principal2,
        modo: modoPrincipais,
      },

      auxiliares,

      saida: {
        nome: nomeSaida,
        formato: formatoSaida,
        pastaDestino,
      },
    };
  }

  /* ===================================================== */
  /* DERIVADOS DA RENDERIZAÇÃO */
  /* ===================================================== */

  const origemPython = origem === 'script-python';

  const rotulos: Record<string, string> = {
    'nome-do-processo': 'Nome do processo',
    'principal-1': origemPython
      ? 'Arquivo de entrada do script'
      : 'Principal 1',
    'arquivo-script-python': 'Arquivo Python',
    'nome-do-arquivo-de-sa-da': origemPython
      ? 'Nome do arquivo de saída do script'
      : 'Nome do arquivo de saída',
    'pasta-de-destino': origemPython
      ? 'Pasta de saída do script'
      : 'Pasta de destino',
  };

  function erroDe(id: string) {
    return errosFormulario.find((erro) => erro.id === id)?.mensagem;
  }

  const secoesIndice = [
    {
      id: SECOES.origem,
      titulo: 'Origem do processo',
      completa: !origemPython || !!scriptPython,
    },
    {
      id: SECOES.gerais,
      titulo: 'Informações gerais',
      completa: !!nome.trim(),
    },
    {
      id: SECOES.principais,
      titulo: 'Arquivos principais',
      completa: !!principal1,
    },
    {
      id: SECOES.auxiliares,
      titulo: 'Arquivos auxiliares',
      completa: false,
      opcional: true,
    },
    {
      id: SECOES.saida,
      titulo: 'Saída',
      completa: !!nomeSaida.trim() && !!pastaDestino.trim(),
    },
  ];

  /* ===================================================== */
  /* RENDERIZAÇÃO */
  /* ===================================================== */

  return (
    <main id="conteudo-principal" tabIndex={-1} className="form-page">
      <PageHeader
        titulo={modoEdicao ? 'Editar Processo' : 'Novo Processo'}
        descricao={
          modoEdicao
            ? 'Atualize os arquivos, a saída e as informações do processo.'
            : 'Configure os arquivos e saída do processo.'
        }
        onVoltar={onVoltar}
        acao={<SimulationNotice />}
      />
      <ProcessSteps atual={1} />

      <div className="form-content">
        <div className="np-layout">
          <IndiceSecoes secoes={secoesIndice} />

          <div className="np-coluna">
            <ResumoErros
              erros={errosFormulario}
              rotuloDoCampo={(id) => rotulos[id] ?? id}
            />

            {/* 1. ORIGEM DO PROCESSO */}
            <section
              id={SECOES.origem}
              tabIndex={-1}
              aria-labelledby={`${SECOES.origem}-titulo`}
              className="ui-panel np-secao"
            >
              <SectionTitle
                id={`${SECOES.origem}-titulo`}
                step={1}
                title="Origem do processo"
                description="Crie um fluxo com ferramentas disponíveis ou conecte um script que você já possui."
              />
              <div className="np-campos">
                <div className="np-grade-2">
                  <OptionCard
                    icon={Wrench}
                    title="Criar com ferramentas"
                    description="Monte um processo com as ferramentas do DataHub."
                    selected={origem === 'ferramentas'}
                    onSelect={() => setOrigem('ferramentas')}
                  />
                  <OptionCard
                    icon={FileCode2}
                    title="Conectar script Python"
                    description="Ajuste as opções e combine o script com ferramentas."
                    selected={origemPython}
                    onSelect={() => setOrigem('script-python')}
                  />
                </div>

                {origemPython && (
                  <div className="np-script">
                    <Field
                      id="arquivo-script-python"
                      label="Arquivo Python"
                      required
                      error={erroDe('arquivo-script-python')}
                    >
                      {(controle) => (
                        <FileField
                          {...controle}
                          accept=".py,text/x-python"
                          icon={FileCode2}
                          file={scriptPython}
                          placeholder="Selecionar arquivo .py…"
                          onChange={selecionarScriptPython}
                        />
                      )}
                    </Field>

                    <div className="np-previa">
                      <div className="np-previa__cabecalho">
                        <p className="np-previa__titulo">
                          Opções de arquivos e pastas
                        </p>
                        <SimulationNotice />
                      </div>
                      <p className="np-previa__descricao">
                        Opções de arquivo e pasta que o DataHub mostrará para
                        edição depois de ler o script.
                      </p>
                      <dl className="np-previa__itens">
                        <div>
                          <dt>Arquivo de entrada</dt>
                          <dd>{principal1?.name ?? 'Aguardando seleção'}</dd>
                        </div>
                        <div>
                          <dt>Pasta de saída</dt>
                          <dd>{pastaDestino || 'Aguardando seleção'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 2. INFORMAÇÕES GERAIS */}
            <section
              id={SECOES.gerais}
              tabIndex={-1}
              aria-labelledby={`${SECOES.gerais}-titulo`}
              className="ui-panel np-secao"
            >
              <SectionTitle
                id={`${SECOES.gerais}-titulo`}
                step={2}
                title="Informações gerais"
              />
              <div className="np-campos">
                <Field
                  id="nome-do-processo"
                  label="Nome do processo"
                  required
                  error={erroDe('nome-do-processo')}
                >
                  {(controle) => (
                    <input
                      {...controle}
                      name="nome-do-processo"
                      autoComplete="off"
                      value={nome}
                      onChange={(event) => setNome(event.target.value)}
                      placeholder="Ex.: Auditoria de Faltas"
                      className="ui-input"
                    />
                  )}
                </Field>

                <Field id="descricao-do-processo" label="Descrição">
                  {(controle) => (
                    <textarea
                      {...controle}
                      name="descricao-do-processo"
                      autoComplete="off"
                      value={descricao}
                      onChange={(event) => setDescricao(event.target.value)}
                      placeholder="Descreva o objetivo do processo e o resultado esperado..."
                      className="ui-input"
                      rows={3}
                    />
                  )}
                </Field>

                <IdentidadeVisual
                  iconeSelecionado={iconeSelecionado}
                  iconePersonalizado={iconePersonalizado}
                  corIcone={corIcone}
                  onSelecionarIcone={selecionarIcone}
                  onSelecionarImagem={selecionarImagemPersonalizada}
                  onSelecionarCor={setCorIcone}
                />
              </div>
            </section>

            {/* 3. ARQUIVOS PRINCIPAIS */}
            <section
              id={SECOES.principais}
              tabIndex={-1}
              aria-labelledby={`${SECOES.principais}-titulo`}
              className="ui-panel np-secao"
            >
              <SectionTitle
                id={`${SECOES.principais}-titulo`}
                step={3}
                title="Arquivos principais"
                description="Arquivos principais utilizados no processamento."
                aside={<span className="np-contagem">até 2</span>}
              />
              <div className="np-campos">
                <div className="np-grade-2">
                  <Field
                    id="principal-1"
                    label={rotulos['principal-1']}
                    required
                    error={erroDe('principal-1')}
                  >
                    {(controle) => (
                      <FileField
                        {...controle}
                        file={principal1}
                        placeholder="Selecionar arquivo…"
                        onChange={setPrincipal1}
                      />
                    )}
                  </Field>

                  <Field id="principal-2" label="Principal 2">
                    {(controle) => (
                      <FileField
                        {...controle}
                        file={principal2}
                        placeholder="Selecionar arquivo…"
                        onChange={setPrincipal2}
                      />
                    )}
                  </Field>
                </div>

                <div role="group" aria-labelledby="modo-principais-rotulo">
                  <p id="modo-principais-rotulo" className="np-rotulo-grupo">
                    Modo dos arquivos principais
                  </p>
                  <div className="np-grade-2">
                    <OptionCard
                      icon={Database}
                      title="Concatenar"
                      description="Une os dois arquivos antes do processamento."
                      selected={modoPrincipais === 'concatenar'}
                      onSelect={() => setModoPrincipais('concatenar')}
                    />
                    <OptionCard
                      icon={FileIcon}
                      title="Manter separados"
                      description="Mantém cada arquivo como uma entrada independente."
                      selected={modoPrincipais === 'separados'}
                      onSelect={() => setModoPrincipais('separados')}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 4. ARQUIVOS AUXILIARES */}
            <ArquivosAuxiliares
              idSecao={SECOES.auxiliares}
              step={4}
              auxiliares={auxiliares}
              onAdicionar={adicionarAuxiliar}
              onRemover={removerAuxiliar}
              onAlterarNome={atualizarNomeAuxiliar}
              onAlterarArquivo={atualizarArquivoAuxiliar}
            />

            {/* 5. SAÍDA */}
            <section
              id={SECOES.saida}
              tabIndex={-1}
              aria-labelledby={`${SECOES.saida}-titulo`}
              className="ui-panel np-secao"
            >
              <SectionTitle
                id={`${SECOES.saida}-titulo`}
                step={5}
                title="Saída"
                description="Configure o arquivo resultante do processo."
              />
              <div className="np-campos">
                <div className="np-saida-linha">
                  <Field
                    id="nome-do-arquivo-de-sa-da"
                    label={rotulos['nome-do-arquivo-de-sa-da']}
                    required
                    error={erroDe('nome-do-arquivo-de-sa-da')}
                    className="np-saida-linha__nome"
                  >
                    {(controle) => (
                      <input
                        {...controle}
                        name="nome-do-arquivo-de-sa-da"
                        autoComplete="off"
                        value={nomeSaida}
                        onChange={(event) => setNomeSaida(event.target.value)}
                        placeholder="Ex.: Relatorio_Final.xlsx"
                        className="ui-input"
                      />
                    )}
                  </Field>

                  <Field
                    id="formato"
                    label="Formato"
                    className="np-saida-linha__formato"
                  >
                    {(controle) => (
                      <select
                        {...controle}
                        name="formato"
                        value={formatoSaida}
                        onChange={(event) =>
                          setFormatoSaida(event.target.value)
                        }
                        className="ui-input"
                      >
                        <option value="xlsx">XLSX (Excel)</option>
                        <option value="csv">CSV</option>
                      </select>
                    )}
                  </Field>
                </div>

                <Field
                  id="pasta-de-destino"
                  label={rotulos['pasta-de-destino']}
                  required
                  hint="Seleção simulada no navegador. O caminho completo será conectado ao app desktop."
                  error={erroDe('pasta-de-destino')}
                >
                  {(controle) => (
                    <div className="np-pasta">
                      <div className="np-pasta__campo">
                        <Folder size={16} aria-hidden="true" />
                        <input
                          {...controle}
                          name="pasta-de-destino"
                          autoComplete="off"
                          value={pastaDestino}
                          onChange={(event) =>
                            setPastaDestino(event.target.value)
                          }
                          placeholder="Nenhuma pasta selecionada"
                          className="ui-input"
                        />
                      </div>
                      <FolderPicker onSelect={setPastaDestino} />
                    </div>
                  )}
                </Field>
              </div>
            </section>
          </div>
        </div>
      </div>

      <footer className="form-footer np-rodape">
        <div className="np-rodape__info">
          <span className="np-rodape__etapa">Etapa 1 de 2</span>
          <span className="np-rodape__legenda" aria-hidden="true">
            <span>*</span> Campo obrigatório
          </span>
        </div>
        <Button onClick={onVoltar}>Cancelar</Button>
        <Button
          variant="primary"
          icon={ChevronRight}
          iconPosition="end"
          onClick={proximo}
        >
          Próximo
        </Button>
      </footer>
    </main>
  );
}

export default NovoProcesso;
