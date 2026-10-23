import { useEffect, useState } from 'react';
import type { LinkDeAcesso } from '../domain/entrada';
import {
  aoMudarSessao,
  contaAtual,
  contaConfigurada,
  linkDeAcessoInicial,
  type Conta,
} from '../services/conta';

/** Estado do acesso. "local": sem Supabase configurado, o app não pede login. */
export type EstadoDaConta =
  | { modo: 'local' }
  | { modo: 'carregando' }
  | { modo: 'sem-conta' }
  | {
      modo: 'redefinir-senha';
      conta: Conta | null;
      link: Exclude<LinkDeAcesso, null>;
    }
  | { modo: 'conectado'; conta: Conta };

function estadoInicial(conta: Conta | null): EstadoDaConta {
  const link = linkDeAcessoInicial();
  if (link) return { modo: 'redefinir-senha', conta, link };
  return conta ? { modo: 'conectado', conta } : { modo: 'sem-conta' };
}

/** Sai de /redefinir-senha sem recarregar a página. */
function voltarParaRaiz() {
  if (window.location.pathname !== '/')
    window.history.replaceState(null, '', '/');
}

export function useConta() {
  const configurada = contaConfigurada();
  const [estado, setEstado] = useState<EstadoDaConta>(
    configurada ? { modo: 'carregando' } : { modo: 'local' }
  );

  useEffect(() => {
    if (!configurada) return;
    let ativo = true;
    // getSession espera o cliente ler o link do e-mail; até lá, os eventos não decidem.
    contaAtual()
      .catch(() => null)
      .then((conta) => ativo && setEstado(estadoInicial(conta)));
    const parar = aoMudarSessao((evento, conta) => {
      setEstado((anterior) => {
        if (evento === 'saiu') return { modo: 'sem-conta' };
        if (evento === 'recuperando-senha') {
          return { modo: 'redefinir-senha', conta, link: 'recuperacao' };
        }
        if (anterior.modo === 'carregando' || !conta) return anterior;
        // Durante a troca de senha a sessão já existe: a tela de nova senha continua.
        if (anterior.modo === 'redefinir-senha') return { ...anterior, conta };
        return { modo: 'conectado', conta };
      });
    });
    return () => {
      ativo = false;
      parar();
    };
  }, [configurada]);

  /** Depois de salvar a senha (ou diante de um link vencido): com sessão, segue para o app. */
  function sairDaRedefinicao() {
    voltarParaRaiz();
    setEstado((anterior) =>
      anterior.modo === 'redefinir-senha' && anterior.conta
        ? { modo: 'conectado', conta: anterior.conta }
        : { modo: 'sem-conta' }
    );
  }

  return { estado, sairDaRedefinicao };
}
