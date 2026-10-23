import { useState, type FormEvent } from 'react';
import { ArrowLeft, KeyRound } from 'lucide-react';

import MolduraEntrada from '../components/entrada/MolduraEntrada';
import { Button, Field } from '../components/ui';
import {
  falhaDeNovaSenha,
  validarNovaSenha,
  type ErrosNovaSenha,
  type LinkDeAcesso,
} from '../domain/entrada';
import { definirNovaSenha, type Conta } from '../services/conta';

type RedefinirSenhaProps = {
  conta: Conta | null;
  link: Exclude<LinkDeAcesso, null>;
  /** Depois de salvar, ou para sair de um link vencido. */
  onConcluir: () => void;
};

/** /redefinir-senha: aberta pelo link de "Esqueci a senha" ou pelo convite da administração. */
export default function RedefinirSenha({
  conta,
  link,
  onConcluir,
}: RedefinirSenhaProps) {
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState<ErrosNovaSenha>({});
  const [falha, setFalha] = useState('');
  const [salvando, setSalvando] = useState(false);

  if (link === 'invalido' || !conta) {
    return (
      <MolduraEntrada titulo="Link vencido">
        <p className="entrada__texto">
          Este link não vale mais. Na entrada, use "Esqueci a senha" para
          receber um novo.
        </p>
        <Button
          variant="primary"
          icon={ArrowLeft}
          className="entrada__botao entrada__botao--inicio"
          onClick={onConcluir}
        >
          Voltar para a entrada
        </Button>
      </MolduraEntrada>
    );
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    if (salvando) return;
    const encontrados = validarNovaSenha(senha, confirmacao);
    setErros(encontrados);
    setFalha('');
    if (encontrados.senha || encontrados.confirmacao) {
      const campo = encontrados.senha ? 'nova-senha' : 'confirmar-senha';
      document.getElementById(campo)?.focus();
      return;
    }
    setSalvando(true);
    try {
      await definirNovaSenha(senha);
      onConcluir();
    } catch (erro) {
      setFalha(falhaDeNovaSenha(erro));
      setSalvando(false);
    }
  }

  return (
    <MolduraEntrada
      titulo={link === 'convite' ? 'Criar sua senha' : 'Criar nova senha'}
    >
      <form className="entrada__form" onSubmit={salvar} noValidate>
        {/* Para o gerenciador de senhas do navegador saber de qual conta é a senha. */}
        <input
          type="email"
          name="email"
          autoComplete="username"
          value={conta.email}
          readOnly
          hidden
        />
        <Field
          id="nova-senha"
          label="Nova senha"
          required
          hint="Pelo menos 8 caracteres."
          error={erros.senha}
        >
          {(controle) => (
            <input
              {...controle}
              type="password"
              name="new-password"
              autoComplete="new-password"
              autoFocus
              readOnly={salvando}
              className="entrada__input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          )}
        </Field>
        <Field
          id="confirmar-senha"
          label="Confirmar senha"
          required
          error={erros.confirmacao}
        >
          {(controle) => (
            <input
              {...controle}
              type="password"
              name="confirm-password"
              autoComplete="new-password"
              readOnly={salvando}
              className="entrada__input"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
            />
          )}
        </Field>
        <Button
          type="submit"
          variant="primary"
          icon={KeyRound}
          iconPosition="end"
          className="entrada__botao"
          disabled={salvando}
        >
          {salvando ? 'Salvando…' : 'Salvar'}
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
