import { useState, type FormEvent } from 'react';
import { KeyRound, LogIn, Mail, UserPlus } from 'lucide-react';

import brasaoMT from '../../assets/brasao-mt.png';
import { Button, Field } from '../ui';
import {
  DOMINIO_INSTITUCIONAL,
  mensagemDoErroDeAcesso,
  validarEmailInstitucional,
  validarSenha,
} from '../../domain/acesso';
import { validarNome } from '../../domain/perfil';
import {
  cadastrar,
  enviarRecuperacaoDeSenha,
  entrar,
} from '../../services/conta';

type Modo = 'entrar' | 'cadastrar' | 'recuperar';

const TITULOS: Record<Modo, string> = {
  entrar: 'Entrar no DataHub',
  cadastrar: 'Criar conta',
  recuperar: 'Recuperar a senha',
};

type Erros = Partial<
  Record<'nome' | 'email' | 'senha' | 'confirmacao', string>
>;

/** Login, cadastro e recuperação de senha (Supabase Auth, só @edu.mt.gov.br). */
export default function TelaAcesso() {
  const [modo, setModo] = useState<Modo>('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [falha, setFalha] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  function trocarModo(novo: Modo) {
    setModo(novo);
    setErros({});
    setFalha('');
    setAviso('');
    setSenha('');
    setConfirmacao('');
  }

  function validar(): Erros {
    const encontrados: Erros = { email: validarEmailInstitucional(email) };
    if (modo !== 'recuperar') encontrados.senha = validarSenha(senha);
    if (modo === 'cadastrar') {
      encontrados.nome = validarNome(nome);
      if (!encontrados.senha && senha !== confirmacao) {
        encontrados.confirmacao = 'As senhas não são iguais.';
      }
    }
    return Object.fromEntries(
      Object.entries(encontrados).filter(([, mensagem]) => mensagem)
    );
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const encontrados = validar();
    setErros(encontrados);
    setFalha('');
    setAviso('');
    const primeiro = Object.keys(encontrados)[0];
    if (primeiro) {
      document.getElementById(`acesso-${primeiro}`)?.focus();
      return;
    }
    setEnviando(true);
    try {
      if (modo === 'entrar') {
        await entrar(email, senha);
      } else if (modo === 'cadastrar') {
        const conta = await cadastrar(email, senha, nome);
        if (!conta) {
          trocarModo('entrar');
          setAviso(
            `Enviamos um link de confirmação para ${email.trim()}. Abra o e-mail, confirme e depois entre aqui.`
          );
        }
      } else {
        await enviarRecuperacaoDeSenha(email);
        setAviso(
          'Se existir uma conta com este e-mail, enviamos um link para criar uma nova senha.'
        );
      }
    } catch (erro) {
      setFalha(mensagemDoErroDeAcesso(erro));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main id="conteudo-principal" tabIndex={-1} className="tela-saida">
      <div className="tela-saida__cartao tela-acesso">
        <img
          src={brasaoMT}
          alt="Brasão de Mato Grosso"
          width={56}
          height={56}
        />
        <h1>{TITULOS[modo]}</h1>
        <p>
          {modo === 'recuperar'
            ? 'Informe seu e-mail institucional para receber o link.'
            : `Use seu e-mail institucional (${DOMINIO_INSTITUCIONAL}).`}
        </p>

        <form className="tela-acesso__form" onSubmit={enviar} noValidate>
          {modo === 'cadastrar' && (
            <Field id="acesso-nome" label="Nome" required error={erros.nome}>
              {(controle) => (
                <input
                  {...controle}
                  className="ui-input"
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              )}
            </Field>
          )}
          <Field id="acesso-email" label="E-mail" required error={erros.email}>
            {(controle) => (
              <input
                {...controle}
                type="email"
                className="ui-input"
                autoComplete="username"
                placeholder={`nome.sobrenome${DOMINIO_INSTITUCIONAL}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
          </Field>
          {modo !== 'recuperar' && (
            <Field
              id="acesso-senha"
              label="Senha"
              required
              hint={
                modo === 'cadastrar' ? 'Pelo menos 8 caracteres.' : undefined
              }
              error={erros.senha}
            >
              {(controle) => (
                <input
                  {...controle}
                  type="password"
                  className="ui-input"
                  autoComplete={
                    modo === 'cadastrar' ? 'new-password' : 'current-password'
                  }
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              )}
            </Field>
          )}
          {modo === 'cadastrar' && (
            <Field
              id="acesso-confirmacao"
              label="Confirme a senha"
              required
              error={erros.confirmacao}
            >
              {(controle) => (
                <input
                  {...controle}
                  type="password"
                  className="ui-input"
                  autoComplete="new-password"
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                />
              )}
            </Field>
          )}

          {falha && (
            <p className="ui-field__error" role="alert">
              {falha}
            </p>
          )}
          <p className="tela-acesso__aviso" role="status">
            {aviso}
          </p>

          <Button
            type="submit"
            variant="primary"
            disabled={enviando}
            icon={
              modo === 'entrar' ? LogIn : modo === 'cadastrar' ? UserPlus : Mail
            }
          >
            {enviando
              ? 'Aguarde…'
              : modo === 'entrar'
                ? 'Entrar'
                : modo === 'cadastrar'
                  ? 'Criar conta'
                  : 'Enviar link'}
          </Button>
        </form>

        <div className="tela-acesso__links">
          {modo !== 'entrar' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => trocarModo('entrar')}
            >
              Já tenho conta
            </Button>
          )}
          {modo !== 'cadastrar' && (
            <Button
              variant="ghost"
              size="sm"
              icon={UserPlus}
              onClick={() => trocarModo('cadastrar')}
            >
              Criar conta
            </Button>
          )}
          {modo !== 'recuperar' && (
            <Button
              variant="ghost"
              size="sm"
              icon={KeyRound}
              onClick={() => trocarModo('recuperar')}
            >
              Esqueci a senha
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
