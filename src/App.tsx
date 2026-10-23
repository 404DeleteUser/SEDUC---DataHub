import { useEffect, useState, useSyncExternalStore } from 'react';

import Sidebar from './components/Sidebar';

import Home from './pages/Home';
import Processos from './pages/Processos';
import NovoProcesso from './pages/NovoProcesso';
import ConfigurarProcesso from './pages/ConfigurarProcesso';
import Ferramentas from './pages/Ferramentas';
import Coordenadorias from './pages/Coordenadorias';
import SitesInstitucionais from './pages/SitesInstitucionais';
import LogsExecucao from './pages/LogsExecucao';

import type { ProcessoBase } from './types/processo';
import type { FerramentaId } from './types/ferramenta';
import { processosMock } from './mock/processosMock';
import { criarConfiguracaoProcessoMock } from './mock/configuracaoProcessosMock';

const CONSULTA_JANELA_ESTREITA = '(max-width: 1099px)';

function assinarJanelaEstreita(aoMudar: () => void) {
  const consulta = window.matchMedia?.(CONSULTA_JANELA_ESTREITA);
  if (!consulta) return () => {};
  consulta.addEventListener('change', aoMudar);
  return () => consulta.removeEventListener('change', aoMudar);
}

function lerJanelaEstreita() {
  return window.matchMedia?.(CONSULTA_JANELA_ESTREITA)?.matches ?? false;
}

// Abaixo de 1100px a sidebar recolhe sozinha, salvo escolha manual do usuário.
function useJanelaEstreita(): boolean {
  return useSyncExternalStore(
    assinarJanelaEstreita,
    lerJanelaEstreita,
    () => false
  );
}

function App() {
  const [tema, setTema] = useState<'dark' | 'light'>(() => {
    const temaSalvo = localStorage.getItem('datahub-theme');

    return temaSalvo === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('datahub-theme', tema);

    document.documentElement.setAttribute('data-theme', tema);
  }, [tema]);

  const janelaEstreita = useJanelaEstreita();
  const [sidebarManual, setSidebarManual] = useState<boolean | null>(null);
  const sidebarCollapsed = sidebarManual ?? janelaEstreita;

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
  const [ferramentaInicial, setFerramentaInicial] = useState<FerramentaId>();
  const [logInicial, setLogInicial] = useState<string>();

  function abrirFerramentas(ferramentaId?: FerramentaId) {
    setFerramentaInicial(ferramentaId);
    setPaginaAtual('ferramentas');
  }

  function abrirLogs(execucao?: string) {
    setLogInicial(execucao);
    setPaginaAtual('logs');
  }

  function navegar(pagina: string) {
    if (pagina === 'ferramentas') setFerramentaInicial(undefined);
    if (pagina === 'logs') setLogInicial(undefined);
    setPaginaAtual(pagina);
  }

  function alternarTema() {
    setTema((temaAtual) => (temaAtual === 'dark' ? 'light' : 'dark'));
  }

  return (
    <div className="app-shell">
      <a href="#conteudo-principal" className="skip-link">
        Ir para o conteúdo
      </a>
      <Sidebar
        tema={tema}
        onToggleTema={alternarTema}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarManual(!sidebarCollapsed)}
        paginaAtual={paginaAtual}
        onNavigate={navegar}
      />
      <div className="app-column">
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
            onAbrirFerramenta={abrirFerramentas}
            onFerramentas={() => abrirFerramentas()}
            onLogs={() => abrirLogs()}
            onAbrirLog={abrirLogs}
          />
        )}

        {paginaAtual === 'coordenadorias' && <Coordenadorias />}

        {paginaAtual === 'sites' && <SitesInstitucionais />}
        {paginaAtual === 'logs' && (
          <LogsExecucao
            key={logInicial ?? 'recentes'}
            execucaoInicial={logInicial}
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
              setProcessosConfigurados((atuais) => {
                // Processo novo recebe o próximo id livre e entra no catálogo.
                const id =
                  processoEmEdicaoId ??
                  Math.max(
                    0,
                    ...processosMock.map((processo) => processo.id),
                    ...Object.keys(atuais).map(Number)
                  ) + 1;
                return { ...atuais, [id]: processoSalvo };
              });
              setSalvamentoSimulado(true);

              setPaginaAtual('processos');
            }}
          />
        )}
        {paginaAtual === 'ferramentas' && (
          <Ferramentas
            key={ferramentaInicial ?? 'catalogo'}
            ferramentaInicial={ferramentaInicial}
          />
        )}
      </div>
    </div>
  );
}

export default App;
