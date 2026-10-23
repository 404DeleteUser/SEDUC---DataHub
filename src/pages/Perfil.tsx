import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Camera, LogOut, Pencil, Trash2, User } from 'lucide-react';

import AsciiBrasao from '../components/ascii/AsciiBrasao';
import PageHeader from '../components/PageHeader';
import {
  Button,
  Field,
  SectionTitle,
  SimulationNotice,
} from '../components/ui';
import { iniciaisDoNome, validarNome } from '../domain/perfil';
import type { DadosFuncionais, PerfilLocal } from '../types/perfil';
import { reduzirFoto, validarArquivoDeFoto } from '../utils/perfilLocal';

type PerfilProps = {
  perfil: PerfilLocal;
  dados: DadosFuncionais;
  /** Onde nome e foto ficam: no navegador (modo local) ou na conta (Supabase). */
  armazenamento?: 'computador' | 'conta';
  /** Devolve false se não deu para salvar. */
  onAlterar: (perfil: PerfilLocal) => boolean | Promise<boolean>;
  onSair: () => void;
};

const ID_BOTAO_NOME = 'perfil-editar-nome';
const AVISO_NAO_SALVO = {
  computador:
    'Não foi possível salvar neste computador: a alteração vale só até fechar o app.',
  conta:
    'Não foi possível salvar na sua conta. Verifique a internet e tente de novo.',
};

export default function Perfil({
  perfil,
  dados,
  armazenamento = 'computador',
  onAlterar,
  onSair,
}: PerfilProps) {
  const [editandoNome, setEditandoNome] = useState(false);
  const [rascunho, setRascunho] = useState(perfil.nome);
  const [erroNome, setErroNome] = useState<string>();
  const [aviso, setAviso] = useState('');
  const [erroFoto, setErroFoto] = useState('');
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  const campoNomeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editandoNome) campoNomeRef.current?.focus();
  }, [editandoNome]);

  async function alterar(novo: PerfilLocal, sucesso: string) {
    setAviso('Salvando…');
    setAviso(
      (await onAlterar(novo)) ? sucesso : AVISO_NAO_SALVO[armazenamento]
    );
  }

  function abrirEdicaoDoNome() {
    setRascunho(perfil.nome);
    setErroNome(undefined);
    setEditandoNome(true);
  }

  function fecharEdicaoDoNome() {
    setEditandoNome(false);
    requestAnimationFrame(() =>
      document.getElementById(ID_BOTAO_NOME)?.focus()
    );
  }

  function salvarNome(evento: FormEvent) {
    evento.preventDefault();
    const erro = validarNome(rascunho);
    setErroNome(erro);
    if (erro) {
      campoNomeRef.current?.focus();
      return;
    }
    void alterar(
      { ...perfil, nome: rascunho.trim().replace(/\s+/g, ' ') },
      'Nome atualizado.'
    );
    fecharEdicaoDoNome();
  }

  async function trocarFoto(arquivo: File | undefined) {
    if (!arquivo) return;
    const erro = validarArquivoDeFoto(arquivo);
    setErroFoto(erro ?? '');
    if (erro) return;
    setProcessandoFoto(true);
    try {
      await alterar(
        { ...perfil, foto: await reduzirFoto(arquivo) },
        'Foto atualizada.'
      );
    } catch {
      setErroFoto('Não foi possível ler esta imagem. Tente outra.');
    } finally {
      setProcessandoFoto(false);
    }
  }

  const iniciais = iniciaisDoNome(perfil.nome);

  return (
    <main id="conteudo-principal" tabIndex={-1} className="page-scroll">
      <PageHeader titulo="Perfil" descricao="Seus dados no DataHub." />
      <div className="page-content perfil-pagina">
        <div className="perfil-conteudo">
          <section className="perfil-identidade" aria-labelledby="perfil-nome">
            <div className="perfil-foto">
              <div className="perfil-avatar">
                {perfil.foto ? (
                  <img src={perfil.foto} alt="Sua foto de perfil" />
                ) : iniciais ? (
                  <span aria-hidden="true">{iniciais}</span>
                ) : (
                  <User size={48} aria-hidden="true" />
                )}
              </div>
              <div className="perfil-foto__acoes">
                <label className="ui-button ui-button--secondary ui-button--sm perfil-trocar-foto">
                  <Camera size={14} aria-hidden="true" />
                  {processandoFoto ? 'Processando…' : 'Trocar foto'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={processandoFoto}
                    aria-describedby={erroFoto ? 'perfil-erro-foto' : undefined}
                    onClick={(evento) => {
                      evento.currentTarget.value = '';
                    }}
                    onChange={(evento) =>
                      void trocarFoto(evento.target.files?.[0])
                    }
                  />
                </label>
                {perfil.foto && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() =>
                      void alterar({ ...perfil, foto: null }, 'Foto removida.')
                    }
                  >
                    Remover foto
                  </Button>
                )}
              </div>
              {erroFoto && (
                <p
                  id="perfil-erro-foto"
                  className="ui-field__error"
                  role="alert"
                >
                  {erroFoto}
                </p>
              )}
            </div>

            <div className="perfil-nome">
              {editandoNome ? (
                <form
                  className="perfil-nome__form"
                  onSubmit={salvarNome}
                  noValidate
                >
                  <Field id="perfil-campo-nome" label="Nome" error={erroNome}>
                    {(controle) => (
                      <input
                        {...controle}
                        ref={campoNomeRef}
                        className="ui-input"
                        value={rascunho}
                        autoComplete="name"
                        maxLength={120}
                        onChange={(evento) => setRascunho(evento.target.value)}
                        onKeyDown={(evento) => {
                          if (evento.key === 'Escape') fecharEdicaoDoNome();
                        }}
                      />
                    )}
                  </Field>
                  <div className="perfil-nome__botoes">
                    <Button variant="primary" type="submit">
                      Salvar nome
                    </Button>
                    <Button variant="ghost" onClick={fecharEdicaoDoNome}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <h2 id="perfil-nome" className="perfil-nome__titulo">
                    {perfil.nome || 'Nome não definido'}
                  </h2>
                  <Button
                    id={ID_BOTAO_NOME}
                    variant="secondary"
                    size="sm"
                    icon={Pencil}
                    onClick={abrirEdicaoDoNome}
                  >
                    {perfil.nome ? 'Editar nome' : 'Definir nome'}
                  </Button>
                </>
              )}
              <p className="perfil-aviso" role="status">
                {aviso}
              </p>
            </div>
          </section>

          <section
            className="perfil-secao perfil-dados"
            aria-labelledby="perfil-dados-titulo"
          >
            <div className="perfil-dados__cabecalho">
              <SectionTitle id="perfil-dados-titulo" title="Dados funcionais" />
              <SimulationNotice
                detail={
                  armazenamento === 'conta'
                    ? 'Matrícula e vínculo de exemplo: a fonte real ainda será definida.'
                    : 'Dados de exemplo: a fonte real ainda será definida.'
                }
              />
            </div>
            <dl className="perfil-dados__lista">
              <div>
                <dt>Matrícula</dt>
                <dd>{dados.matricula}</dd>
              </div>
              <div>
                <dt>Vínculo</dt>
                <dd>{dados.vinculo}</dd>
              </div>
              <div>
                <dt>E-mail institucional</dt>
                <dd>{dados.emailInstitucional}</dd>
              </div>
            </dl>
          </section>

          <section
            className="perfil-secao perfil-sessao"
            aria-labelledby="perfil-sessao-titulo"
          >
            <SectionTitle
              id="perfil-sessao-titulo"
              title="Sessão"
              description="Encerra o uso do DataHub neste computador."
            />
            <Button
              variant="danger"
              icon={LogOut}
              onClick={() => setConfirmandoSaida(true)}
            >
              Sair da conta
            </Button>
          </section>
        </div>
        <div className="perfil-palco">
          <AsciiBrasao />
        </div>
      </div>

      <ConfirmarSaida
        aberto={confirmandoSaida}
        armazenamento={armazenamento}
        onCancelar={() => setConfirmandoSaida(false)}
        onConfirmar={() => {
          setConfirmandoSaida(false);
          onSair();
        }}
      />
    </main>
  );
}

function ConfirmarSaida({
  aberto,
  armazenamento,
  onCancelar,
  onConfirmar,
}: {
  aberto: boolean;
  armazenamento: 'computador' | 'conta';
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!aberto || !dialog) return;
    const gatilho =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialog.showModal();
    return () => {
      dialog.close();
      if (gatilho?.isConnected) gatilho.focus();
    };
  }, [aberto]);

  if (!aberto) return null;
  return (
    <dialog
      ref={dialogRef}
      className="native-dialog perfil-confirmacao"
      aria-labelledby="perfil-confirmacao-titulo"
      aria-describedby="perfil-confirmacao-texto"
      onCancel={(evento) => {
        evento.preventDefault();
        onCancelar();
      }}
    >
      <h2 id="perfil-confirmacao-titulo">Sair do DataHub?</h2>
      <p id="perfil-confirmacao-texto">
        Você poderá entrar de novo em seguida. Seu nome e sua foto continuam
        salvos {armazenamento === 'conta' ? 'na sua conta' : 'neste computador'}
        .
      </p>
      <div className="perfil-confirmacao__botoes">
        <Button variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button variant="danger" icon={LogOut} onClick={onConfirmar}>
          Sair
        </Button>
      </div>
    </dialog>
  );
}
