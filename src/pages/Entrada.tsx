import { useId, useState, type FormEvent } from 'react';
import { LogIn, Mail } from 'lucide-react';

import MolduraEntrada from '../components/entrada/MolduraEntrada';
import { Button, Field } from '../components/ui';
import {
  DOMINIO_INSTITUCIONAL,
  falhaDeEntrada,
  validarEmail,
  validarSenha,
} from '../domain/entrada';
import { enviarRecuperacaoDeSenha, entrar } from '../services/conta';

type Erros = { email?: string; senha?: string };

const AVISO_RECUPERACAO =
  'Se esse e-mail tiver acesso, você vai receber um link para criar uma nova senha.';
const FALHA_RECUPERACAO =
  'Não foi possível enviar o link agora. Tente de novo em instantes.';

/** Entrada do DataHub: e-mail e senha (Supabase Auth). Contas só por convite. */
export default function Entrada() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [manter, setManter] = useState(true);
  const [erros, setErros] = useState<Erros>({});
  const [falha, setFalha] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [recuperando, setRecuperando] = useState(false);
  const [enviandoLink, setEnviandoLink] = useState(false);
  const [avisoLink, setAvisoLink] = useState('');
  const idRecuperacao = useId();

  function focar(campo: keyof Erros) {
    document.getElementById(`entrada-${campo}`)?.focus();
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (entrando) return;
    const encontrados: Erros = {
      email: validarEmail(email),
      senha: validarSenha(senha),
    };
    setErros(encontrados);
    setFalha('');
    const primeiro = (['email', 'senha'] as const).find((c) => encontrados[c]);
    if (primeiro) {
      focar(primeiro);
      return;
    }
    setEntrando(true);
    try {
      // Com sucesso, a Raiz troca a Entrada pelo app.
      await entrar(email, senha, manter);
    } catch (erro) {
      setFalha(falhaDeEntrada(erro));
      setEntrando(false);
    }
  }

  async function enviarLink() {
    const problema = validarEmail(email);
    setErros({ email: problema });
    setAvisoLink('');
    if (problema) {
      focar('email');
      return;
    }
    setEnviandoLink(true);
    try {
      await enviarRecuperacaoDeSenha(email);
      setAvisoLink(AVISO_RECUPERACAO);
    } catch {
      setAvisoLink(FALHA_RECUPERACAO);
    } finally {
      setEnviandoLink(false);
    }
  }

  return (
    <MolduraEntrada titulo="Entrar">
      <form className="entrada__form" onSubmit={enviar} noValidate>
        <Field id="entrada-email" label="E-mail" required error={erros.email}>
          {(controle) => (
            <input
              {...controle}
              type="email"
              name="email"
              autoComplete="username"
              inputMode="email"
              placeholder={`nome${DOMINIO_INSTITUCIONAL}`}
              autoFocus
              readOnly={entrando}
              className="entrada__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Field>
        <Field id="entrada-senha" label="Senha" required error={erros.senha}>
          {(controle) => (
            <input
              {...controle}
              type="password"
              name="password"
              autoComplete="current-password"
              readOnly={entrando}
              className="entrada__input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          )}
        </Field>

        <div className="entrada__opcoes">
          <label className="entrada__manter">
            <input
              type="checkbox"
              checked={manter}
              disabled={entrando}
              onChange={(e) => setManter(e.target.checked)}
            />
            Manter conectado
          </label>
          <button
            type="button"
            className="entrada__link"
            aria-expanded={recuperando}
            aria-controls={idRecuperacao}
            onClick={() => {
              setRecuperando(!recuperando);
              setAvisoLink('');
            }}
          >
            Esqueci a senha
          </button>
        </div>

        <div
          id={idRecuperacao}
          hidden={!recuperando}
          className="entrada__recuperar"
        >
          <p>Enviaremos um link para o e-mail informado acima.</p>
          <Button
            size="sm"
            icon={Mail}
            disabled={enviandoLink}
            onClick={() => void enviarLink()}
          >
            {enviandoLink ? 'Enviando…' : 'Enviar link'}
          </Button>
          <p className="entrada__aviso" role="status">
            {avisoLink}
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          icon={LogIn}
          iconPosition="end"
          className="entrada__botao"
          disabled={entrando}
        >
          {entrando ? 'Entrando…' : 'Entrar'}
        </Button>
        {falha && (
          <p className="entrada__falha" role="alert">
            {falha}
          </p>
        )}
      </form>
    </MolduraEntrada>
  );
}
