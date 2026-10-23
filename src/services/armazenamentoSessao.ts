// Onde o Supabase guarda a sessão, conforme "Manter conectado":
// marcado → localStorage (sobrevive ao fechar o navegador);
// desmarcado → sessionStorage (acaba ao fechar a aba). A senha nunca é guardada.

export const CHAVE_MANTER_CONECTADO = 'datahub-manter-conectado';

type Armazenamento = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function manterConectado(): boolean {
  try {
    return localStorage.getItem(CHAVE_MANTER_CONECTADO) !== 'nao';
  } catch {
    return true;
  }
}

export function definirManterConectado(manter: boolean): void {
  try {
    localStorage.setItem(CHAVE_MANTER_CONECTADO, manter ? 'sim' : 'nao');
  } catch {
    // Sem localStorage, o padrão (manter) continua valendo.
  }
}

function destino(): { usar: Storage; limpar: Storage } {
  return manterConectado()
    ? { usar: localStorage, limpar: sessionStorage }
    : { usar: sessionStorage, limpar: localStorage };
}

export const armazenamentoSessao: Armazenamento = {
  getItem(chave) {
    return destino().usar.getItem(chave);
  },
  setItem(chave, valor) {
    const { usar, limpar } = destino();
    usar.setItem(chave, valor);
    limpar.removeItem(chave);
  },
  removeItem(chave) {
    localStorage.removeItem(chave);
    sessionStorage.removeItem(chave);
  },
};
