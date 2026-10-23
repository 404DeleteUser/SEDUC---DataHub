import { useState } from 'react';
import { FileCode2, FolderCode } from 'lucide-react';

import { ExplorerField, Field, OptionCard } from '../../components/ui';
import { principalEstaNaPasta } from '../../domain/scriptPython';
import type { ItemDoExplorador, ScriptPython } from '../../types/processo';
import {
  escolherArquivo,
  escolherPasta,
  type PastaEscolhida,
} from '../../utils/explorador';

/** Id do campo que falta preencher: a validação do formulário foca por ele. */
export const ID_CAMPO_SCRIPT = 'arquivo-script-python';

type ConexaoScriptPythonProps = {
  value: ScriptPython | null;
  /** Erro do formulário (script obrigatório). */
  erro?: string;
  onChange: (script: ScriptPython | null) => void;
};

/** Conecta um arquivo .py ou uma pasta de scripts com o principal escolhido. */
export function ConexaoScriptPython({
  value,
  erro,
  onChange,
}: ConexaoScriptPythonProps) {
  const [modo, setModo] = useState<ScriptPython['modo']>(
    value?.modo ?? 'arquivo'
  );
  const [arquivo, setArquivo] = useState<ItemDoExplorador | null>(
    value?.modo === 'arquivo' ? value.principal : null
  );
  const [pasta, setPasta] = useState<PastaEscolhida | null>(
    value?.pasta ?? null
  );
  const [principal, setPrincipal] = useState<ItemDoExplorador | null>(
    value?.modo === 'pasta' ? value.principal : null
  );
  const [erroPasta, setErroPasta] = useState('');
  const [erroPrincipal, setErroPrincipal] = useState('');

  function emitir(
    novoModo: ScriptPython['modo'],
    novoArquivo: ItemDoExplorador | null,
    novaPasta: PastaEscolhida | null,
    novoPrincipal: ItemDoExplorador | null
  ) {
    if (novoModo === 'arquivo') {
      onChange(
        novoArquivo ? { modo: 'arquivo', principal: novoArquivo } : null
      );
      return;
    }
    onChange(
      novaPasta && novoPrincipal
        ? { modo: 'pasta', pasta: novaPasta, principal: novoPrincipal }
        : null
    );
  }

  function trocarModo(novoModo: ScriptPython['modo']) {
    setModo(novoModo);
    emitir(novoModo, arquivo, pasta, principal);
  }

  async function escolherScript() {
    const escolhido = await escolherArquivo({
      titulo: 'Script Python',
      extensoes: ['py'],
    });
    if (!escolhido) return;
    setArquivo(escolhido);
    emitir('arquivo', escolhido, pasta, principal);
  }

  async function escolherPastaDosScripts() {
    const escolhida = await escolherPasta({
      titulo: 'Pasta dos scripts Python',
      listarExtensoes: ['py'],
    });
    if (!escolhida) return;
    if (escolhida.arquivos && !escolhida.arquivos.length) {
      setErroPasta(`A pasta ${escolhida.nome} não tem arquivos .py.`);
      return;
    }
    setErroPasta('');
    setErroPrincipal('');
    setPasta(escolhida);
    // A pasta mudou: o principal anterior pode não estar nela.
    const mantido =
      principal && principalEstaNaPasta(principal, escolhida)
        ? principal
        : null;
    setPrincipal(mantido);
    emitir('pasta', arquivo, escolhida, mantido);
  }

  function definirPrincipal(novo: ItemDoExplorador) {
    if (!pasta) return;
    if (!principalEstaNaPasta(novo, pasta)) {
      setErroPrincipal(
        `O script principal precisa estar dentro da pasta ${pasta.nome}.`
      );
      return;
    }
    setErroPrincipal('');
    setPrincipal(novo);
    emitir('pasta', arquivo, pasta, novo);
  }

  async function escolherPrincipalNoExplorador() {
    const escolhido = await escolherArquivo({
      titulo: 'Script principal',
      extensoes: ['py'],
      pastaInicial: pasta?.caminho,
    });
    if (escolhido) definirPrincipal(escolhido);
  }

  const idPasta = !pasta ? ID_CAMPO_SCRIPT : 'pasta-script-python';
  const idPrincipal =
    pasta && !principal ? ID_CAMPO_SCRIPT : 'script-principal';

  return (
    <div className="np-script__conexao">
      <fieldset className="np-script__modos">
        <legend className="ui-field__label">Como conectar</legend>
        <OptionCard
          icon={FileCode2}
          title="Arquivo .py"
          description="Um único script."
          selected={modo === 'arquivo'}
          onSelect={() => trocarModo('arquivo')}
        />
        <OptionCard
          icon={FolderCode}
          title="Pasta com scripts"
          description="Vários .py; você escolhe o principal."
          selected={modo === 'pasta'}
          onSelect={() => trocarModo('pasta')}
        />
      </fieldset>

      {modo === 'arquivo' ? (
        <Field
          id={ID_CAMPO_SCRIPT}
          label="Arquivo Python"
          required
          error={erro}
        >
          {(controle) => (
            <ExplorerField
              {...controle}
              icon={FileCode2}
              value={arquivo?.rotulo}
              placeholder="Selecionar arquivo .py…"
              onPick={() => void escolherScript()}
            />
          )}
        </Field>
      ) : (
        <>
          <Field
            id={idPasta}
            label="Pasta dos scripts"
            required
            hint={
              pasta?.arquivos
                ? `${pasta.arquivos.length} ${pasta.arquivos.length === 1 ? 'arquivo .py encontrado' : 'arquivos .py encontrados'}.`
                : undefined
            }
            error={erroPasta || (!pasta ? erro : undefined)}
          >
            {(controle) => (
              <ExplorerField
                {...controle}
                icon={FolderCode}
                value={pasta?.rotulo}
                placeholder="Selecionar pasta…"
                onPick={() => void escolherPastaDosScripts()}
              />
            )}
          </Field>
          <Field
            id={idPrincipal}
            label="Script principal"
            required
            hint="É o script executado; os outros .py da pasta ficam disponíveis para ele."
            error={erroPrincipal || (pasta && !principal ? erro : undefined)}
          >
            {(controle) =>
              pasta?.arquivos ? (
                <select
                  {...controle}
                  className="ui-input"
                  value={principal?.nome ?? ''}
                  onChange={(event) =>
                    definirPrincipal({
                      nome: event.target.value,
                      rotulo: event.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Selecione o script…
                  </option>
                  {pasta.arquivos.map((nome) => (
                    <option key={nome} value={nome}>
                      {nome}
                    </option>
                  ))}
                </select>
              ) : (
                <ExplorerField
                  {...controle}
                  icon={FileCode2}
                  value={principal?.rotulo}
                  placeholder={
                    pasta
                      ? 'Selecionar o script principal…'
                      : 'Escolha a pasta primeiro'
                  }
                  disabled={!pasta}
                  onPick={() => void escolherPrincipalNoExplorador()}
                />
              )
            }
          </Field>
        </>
      )}
    </div>
  );
}
