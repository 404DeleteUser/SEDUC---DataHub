import { useEffect, useState } from 'react';

import Sidebar from './components/sidebar';
import ThemeToggle from './components/ThemeToggle';

import Home from './pages/Home';
import Processos from './pages/Processos';
import NovoProcesso from './pages/NovoProcesso';
import ConfigurarProcesso from './pages/ConfigurarProcesso';

import type { ProcessoBase } from './types/processo';

function App() {
  const [tema, setTema] = useState<'dark' | 'light'>(() => {
    const temaSalvo = localStorage.getItem('datahub-theme');

    return temaSalvo === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('datahub-theme', tema);

    document.documentElement.setAttribute('data-theme', tema);
  }, [tema]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [paginaAtual, setPaginaAtual] = useState('inicio');

  const [processoEmCriacao, setProcessoEmCriacao] =
    useState<ProcessoBase | null>(null);

  function alternarTema() {
    setTema((temaAtual) => (temaAtual === 'dark' ? 'light' : 'dark'));
  }

  return (
    <div
      className="
        h-screen
        flex
        bg-[var(--bg-app)]
        text-[var(--text-primary)]
        overflow-hidden
        transition-colors
        duration-200
      "
    >
      <ThemeToggle tema={tema} onToggleTema={alternarTema} />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((anterior) => !anterior)}
        paginaAtual={paginaAtual}
        onNavigate={setPaginaAtual}
      />

      {paginaAtual === 'inicio' && <Home />}

      {paginaAtual === 'processos' && (
        <Processos onNovoProcesso={() => setPaginaAtual('novo-processo')} />
      )}

      {paginaAtual === 'novo-processo' && (
        <NovoProcesso
          onVoltar={() => setPaginaAtual('processos')}
          onProximo={(processo) => {
            setProcessoEmCriacao(processo);

            setPaginaAtual('configurar-processo');
          }}
        />
      )}

      {paginaAtual === 'configurar-processo' && processoEmCriacao && (
        <ConfigurarProcesso
          processo={processoEmCriacao}
          onVoltar={() => setPaginaAtual('novo-processo')}
          onSalvar={() => {
            console.log('Processo salvo com sucesso.');

            setPaginaAtual('processos');
          }}
        />
      )}
    </div>
  );
}

export default App;
