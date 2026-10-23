import { useEffect, useState } from 'react';
import {
  aoMudarSessao,
  contaAtual,
  contaConfigurada,
  type Conta,
} from '../services/conta';

/** Estado do acesso. "local": sem Supabase configurado, o app não pede login. */
export type EstadoDaConta =
  | { modo: 'local' }
  | { modo: 'carregando' }
  | { modo: 'sem-conta' }
  | { modo: 'recuperando-senha'; conta: Conta | null }
  | { modo: 'conectado'; conta: Conta };

export function useConta() {
  const configurada = contaConfigurada();
  const [estado, setEstado] = useState<EstadoDaConta>(
    configurada ? { modo: 'carregando' } : { modo: 'local' }
  );

  useEffect(() => {
    if (!configurada) return;
    let ativo = true;
    contaAtual()
      .then((conta) => {
        if (!ativo) return;
        setEstado((anterior) =>
          anterior.modo !== 'carregando'
            ? anterior
            : conta
              ? { modo: 'conectado', conta }
              : { modo: 'sem-conta' }
        );
      })
      .catch(() => ativo && setEstado({ modo: 'sem-conta' }));
    const parar = aoMudarSessao((evento, conta) => {
      if (evento === 'recuperando-senha') {
        setEstado({ modo: 'recuperando-senha', conta });
      } else if (evento === 'saiu' || !conta) {
        setEstado({ modo: 'sem-conta' });
      } else {
        // Durante a troca de senha a sessão já existe: a tela de nova senha continua.
        setEstado((anterior) =>
          anterior.modo === 'recuperando-senha'
            ? anterior
            : { modo: 'conectado', conta }
        );
      }
    });
    return () => {
      ativo = false;
      parar();
    };
  }, [configurada]);

  function concluirRecuperacao() {
    setEstado((anterior) =>
      anterior.modo === 'recuperando-senha' && anterior.conta
        ? { modo: 'conectado', conta: anterior.conta }
        : anterior
    );
  }

  return { estado, concluirRecuperacao };
}
