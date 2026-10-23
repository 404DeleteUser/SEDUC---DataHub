import type { ReactNode } from 'react';
import AsciiBrasao from '../ascii/AsciiBrasao';

/** Janela da Entrada e da troca de senha: brasão em ASCII à esquerda, formulário solto à direita. */
export default function MolduraEntrada({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <main id="conteudo-principal" tabIndex={-1} className="entrada">
      <div className="entrada__palco">
        <AsciiBrasao />
      </div>
      <div className="entrada__coluna">
        <p className="entrada__marca">
          <span className="entrada__marca-nome">DataHub</span>
          <span className="entrada__marca-orgao">SEDUC-MT</span>
        </p>
        <h1 className="entrada__titulo">{titulo}</h1>
        {children}
      </div>
    </main>
  );
}
