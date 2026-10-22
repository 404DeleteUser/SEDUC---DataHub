import { useEffect, useState, useSyncExternalStore } from 'react';
import { ChevronRight } from 'lucide-react';

import Sidebar from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';

import Home from './pages/Home';
import Processos from './pages/Processos';
import NovoProcesso from './pages/NovoProcesso';
import ConfigurarProcesso from './pages/ConfigurarProcesso';

import type { ProcessoBase } from './types/processo';
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

function montarTrilha(pagina: string, emEdicao: boolean): string[] {
  const fluxo = emEdicao ? 'Editar processo' : 'Novo processo';
  switch (pagina) {
    case 'processos':
      return ['Processos'];
    case 'novo-processo':
      return ['Processos', fluxo];
    case 'configurar-processo':
      return ['Processos', fluxo, 'Ferramentas'];
    default:
      return ['Início'];
  }
}

function Trilha({ partes }: { partes: string[] }) {
  const itens = ['DataHub', ...partes];
  return (
    <nav aria-label="Trilha" className="app-breadcrumb">
      <ol>
        {itens.map((parte, indice) => {
          const ultima = indice === itens.length - 1;
          return (
            <li key={`${parte}-${indice}`}>
              {indice > 0 && <ChevronRight size={14} aria-hidden="true" />}
              <span aria-current={ultima ? 'page' : undefined}>{parte}</span>
            </li>
          );
        })}
      </ol>
    </nav>
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

  function alternarTema() {
    setTema((temaAtual) => (temaAtual === 'dark' ? 'light' : 'dark'));
  }

  return (
    <div className="app-shell">
      <a href="#conteudo-principal" className="skip-link">
        Ir para o conteúdo
      </a>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarManual(!sidebarCollapsed)}
        paginaAtual={paginaAtual}
        onNavigate={setPaginaAtual}
      />
      <div className="app-column">
        <header className="app-topbar">
          <Trilha
            partes={montarTrilha(paginaAtual, processoEmEdicaoId !== null)}
          />
          <ThemeToggle tema={tema} onToggleTema={alternarTema} />
        </header>

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
    </div>
  );
}

export default App;
