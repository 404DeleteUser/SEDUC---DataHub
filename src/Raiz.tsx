import App from './App';
import Entrada from './pages/Entrada';
import RedefinirSenha from './pages/RedefinirSenha';
import { useConta } from './hooks/useConta';
import { sair } from './services/conta';

/** Decide pela sessão do Supabase: Entrada, troca de senha ou o app. */
export default function Raiz() {
  const { estado, sairDaRedefinicao } = useConta();

  switch (estado.modo) {
    case 'local':
      return <App conta={null} />;
    case 'carregando':
      // Só o fundo: a Entrada não pisca antes de a sessão ser lida.
      return <div className="raiz-carregando" aria-busy="true" />;
    case 'sem-conta':
      return <Entrada />;
    case 'redefinir-senha':
      return (
        <RedefinirSenha
          conta={estado.conta}
          link={estado.link}
          onConcluir={sairDaRedefinicao}
        />
      );
    case 'conectado':
      return (
        <App
          key={estado.conta.id}
          conta={estado.conta}
          onSair={async () => {
            try {
              await sair();
            } catch {
              // Mesmo sem resposta do servidor, o Supabase apaga a sessão local.
            }
          }}
        />
      );
  }
}
