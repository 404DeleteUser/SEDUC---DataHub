import { useEffect, useState } from 'react';

import Sidebar from './components/sidebar';
import ThemeToggle from './components/ThemeToggle';

import Home from './pages/Home';
import Processos from './pages/Processos';
import NovoProcesso from './pages/NovoProcesso';
import ConfigurarProcesso from './pages/ConfigurarProcesso';

import type { ProcessoBase } from './types/processo';
import { criarConfiguracaoProcessoMock } from './mock/configuracaoProcessosMock';

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
  const [salvamentoSimulado, setSalvamentoSimulado] = useState(false);
  const [processoEmEdicaoId, setProcessoEmEdicaoId] = useState<number | null>(
    null
  );
  const [processosConfigurados, setProcessosConfigurados] = useState<
    Record<number, ProcessoBase>
  >({});

  const [processoEmCriacao, setProcessoEmCriacao] =
    useState<ProcessoBase | null>(null);

  function alternarTema() {
    setTema((temaAtual) => (temaAtual === 'dark' ? 'light' : 'dark'));
  }

  return (
    <div className="app-shell">
      <a href="#conteudo-principal" className="skip-link">
        Ir para o conteúdo
      </a>
      <ThemeToggle tema={tema} onToggleTema={alternarTema} />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((anterior) => !anterior)}
        paginaAtual={paginaAtual}
        onNavigate={setPaginaAtual}
      />

      {paginaAtual === 'inicio' && (
        <Home
          processosConfigurados={processosConfigurados}
          onEditarProcesso={(id) => {
            const configuracao =
              processosConfigurados[id] ?? criarConfiguracaoProcessoMock(id);
            if (!configuracao) return;
            setProcessoEmEdicaoId(id);
            setProcessoEmCriacao(configuracao);
            setSalvamentoSimulado(false);
            setPaginaAtual('novo-processo');
          }}
          onProcessos={() => setPaginaAtual('processos')}
        />
      )}

      {paginaAtual === 'processos' && (
        <Processos
          salvamentoSimulado={salvamentoSimulado}
          processosConfigurados={processosConfigurados}
          onEditarProcesso={(id) => {
            const configuracao =
              processosConfigurados[id] ?? criarConfiguracaoProcessoMock(id);
            if (!configuracao) return;
            setProcessoEmEdicaoId(id);
            setProcessoEmCriacao(configuracao);
            setSalvamentoSimulado(false);
            setPaginaAtual('novo-processo');
          }}
          onNovoProcesso={() => {
            setProcessoEmCriacao(null);
            setProcessoEmEdicaoId(null);
            setSalvamentoSimulado(false);
            setPaginaAtual('novo-processo');
          }}
        />
      )}

      {paginaAtual === 'novo-processo' && (
        <NovoProcesso
          processoInicial={processoEmCriacao}
          modoEdicao={processoEmEdicaoId !== null}
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
          modoEdicao={processoEmEdicaoId !== null}
          onVoltar={(processoAtualizado) => {
            setProcessoEmCriacao(processoAtualizado);
            setPaginaAtual('novo-processo');
          }}
          onSalvar={(processoSalvo) => {
            if (processoEmEdicaoId !== null) {
              setProcessosConfigurados((atuais) => ({
                ...atuais,
                [processoEmEdicaoId]: processoSalvo,
              }));
            }
            setSalvamentoSimulado(true);

            setPaginaAtual('processos');
          }}
        />
      )}
    </div>
  );
}

export default App;
