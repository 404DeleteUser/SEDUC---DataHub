// Abre um site fora do app: no app desktop, no navegador padrão do sistema;
// no navegador, em nova aba sem acesso à janela do DataHub.
import { isTauri } from '@tauri-apps/api/core';

const PROTOCOLOS_PERMITIDOS = ['http:', 'https:'];

export async function abrirLinkExterno(url: string): Promise<void> {
  if (!PROTOCOLOS_PERMITIDOS.includes(new URL(url).protocol)) {
    throw new Error(`Endereço não permitido: ${url}`);
  }
  if (isTauri()) {
    const { openUrl } = await import('@tauri-apps/plugin-opener');
    await openUrl(url);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
