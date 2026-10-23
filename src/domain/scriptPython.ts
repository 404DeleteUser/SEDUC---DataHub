// Script Python conectado a um processo: um arquivo .py ou uma pasta com o principal.
import type { ItemDoExplorador, ScriptPython } from '../types/processo';

function caminhoComparavel(caminho: string): string {
  return caminho.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
}

/** O script principal precisa estar dentro da pasta conectada. */
export function principalEstaNaPasta(
  principal: ItemDoExplorador,
  pasta: ItemDoExplorador & { arquivos?: string[] }
): boolean {
  if (principal.caminho && pasta.caminho) {
    return caminhoComparavel(principal.caminho).startsWith(
      `${caminhoComparavel(pasta.caminho)}/`
    );
  }
  return pasta.arquivos?.includes(principal.nome) ?? false;
}

export function descreverScript(script: ScriptPython): string {
  return script.modo === 'pasta' && script.pasta
    ? `${script.pasta.nome} · principal: ${script.principal.nome}`
    : script.principal.nome;
}
