import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';

import brasaoMT from '../../assets/brasao-mt.png';
import { Button, Field } from '../ui';
import { mensagemDoErroDeAcesso, validarSenha } from '../../domain/acesso';
import { definirNovaSenha } from '../../services/conta';

/** Aberta pelo link de recuperação do e-mail: define a nova senha e segue para o app. */
export default function TelaNovaSenha({
  onConcluir,
}: {
  onConcluir: () => void;
}) {
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState<{
    campo?: 'senha' | 'confirmacao';
    texto: string;
  }>();
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const problema = validarSenha(senha);
    if (problema) {
      setErro({ campo: 'senha', texto: problema });
      document.getElementById('nova-senha')?.focus();
      return;
    }
    if (senha !== confirmacao) {
      setErro({ campo: 'confirmacao', texto: 'As senhas não são iguais.' });
      document.getElementById('nova-senha-confirmacao')?.focus();
      return;
    }
    setErro(undefined);
    setEnviando(true);
    try {
      await definirNovaSenha(senha);
      onConcluir();
    } catch (falha) {
      setErro({ texto: mensagemDoErroDeAcesso(falha) });
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
        <h1>Criar nova senha</h1>
        <p>Escolha a nova senha da sua conta.</p>
        <form className="tela-acesso__form" onSubmit={enviar} noValidate>
          <Field
            id="nova-senha"
            label="Nova senha"
            required
            hint="Pelo menos 8 caracteres."
            error={erro?.campo === 'senha' ? erro.texto : undefined}
          >
            {(controle) => (
              <input
                {...controle}
                type="password"
                className="ui-input"
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            )}
          </Field>
          <Field
            id="nova-senha-confirmacao"
            label="Confirme a nova senha"
            required
            error={erro?.campo === 'confirmacao' ? erro.texto : undefined}
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
          {erro && !erro.campo && (
            <p className="ui-field__error" role="alert">
              {erro.texto}
            </p>
          )}
          <Button
            type="submit"
            variant="primary"
            icon={KeyRound}
            disabled={enviando}
          >
            {enviando ? 'Aguarde…' : 'Salvar nova senha'}
          </Button>
        </form>
      </div>
    </main>
  );
}
