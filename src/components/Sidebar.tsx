import type { LucideIcon } from 'lucide-react';
import {
  House,
  FolderCog,
  Wrench,
  Landmark,
  ShieldCheck,
  Building2,
  Settings,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import brasaoMT from '../assets/brasao-mt.png';

type SidebarProps = {
  tema: 'dark' | 'light';
  onToggleTema: () => void;
  collapsed: boolean;
  onToggle: () => void;
  paginaAtual: string;
  onNavigate: (pagina: string) => void;
};

const PAGINAS_DE_PROCESSOS = [
  'processos',
  'novo-processo',
  'configurar-processo',
];

const TAMANHO_ICONE = 18;

function estaAtivo(paginaAtual: string, pagina?: string) {
  if (!pagina) return false;
  if (pagina === 'processos') return PAGINAS_DE_PROCESSOS.includes(paginaAtual);
  return paginaAtual === pagina;
}

export default function Sidebar({
  tema,
  onToggleTema,
  collapsed,
  onToggle,
  paginaAtual,
  onNavigate,
}: SidebarProps) {
  function item(Icone: LucideIcon, nome: string, pagina?: string) {
    const ativo = estaAtivo(paginaAtual, pagina);
    const disponivel = Boolean(pagina);
    let titulo: string | undefined;
    if (collapsed) titulo = disponivel ? nome : `${nome} (em breve)`;

    return (
      <button
        key={nome}
        type="button"
        className={`nav-item ${ativo ? 'nav-item-active' : ''}`}
        title={titulo}
        aria-current={ativo ? 'page' : undefined}
        disabled={!disponivel}
        onClick={pagina ? () => onNavigate(pagina) : undefined}
      >
        <Icone size={TAMANHO_ICONE} aria-hidden="true" />
        <span className={collapsed ? 'sr-only' : 'nav-item-label'}>{nome}</span>
        {!disponivel &&
          (collapsed ? (
            <span className="sr-only"> (em breve)</span>
          ) : (
            <span className="nav-soon">Em breve</span>
          ))}
      </button>
    );
  }

  function rotuloGrupo(texto: string) {
    return <p className={collapsed ? 'sr-only' : 'nav-group-label'}>{texto}</p>;
  }

  return (
    <aside className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-brand">
        <span className="brand-stripe" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <div className="sidebar-brand-body">
          <img
            src={brasaoMT}
            alt="Brasão de Mato Grosso"
            width={32}
            height={32}
          />
          {!collapsed && (
            <div className="sidebar-brand-text">
              <strong>DataHub</strong>
              <span>SEDUC-MT</span>
            </div>
          )}
        </div>
      </div>
      <div className="sidebar-scroll">
        <nav aria-label="Navegação principal">
          {rotuloGrupo('Área de trabalho')}
          {item(House, 'Início', 'inicio')}
          {item(FolderCog, 'Processos', 'processos')}
          {item(Wrench, 'Ferramentas', 'ferramentas')}
          {item(ShieldCheck, 'Logs de Execução')}
        </nav>
        <nav aria-label="Institucional" className="nav-group">
          {rotuloGrupo('Institucional')}
          {item(Landmark, 'Sites Institucionais', 'sites')}
          {item(Building2, 'Coordenadorias e Equipes', 'coordenadorias')}
        </nav>
        <nav aria-label="Preferências" className="nav-group">
          {item(Settings, 'Configurações')}
        </nav>
      </div>
      <div className="sidebar-footer">
        <ThemeToggle
          tema={tema}
          onToggleTema={onToggleTema}
          compacto={collapsed}
        />
        <button
          type="button"
          onClick={onToggle}
          className="nav-item sidebar-collapse"
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          title={collapsed ? 'Expandir sidebar' : undefined}
        >
          {collapsed ? (
            <PanelLeftOpen size={TAMANHO_ICONE} aria-hidden="true" />
          ) : (
            <PanelLeftClose size={TAMANHO_ICONE} aria-hidden="true" />
          )}
          <span className={collapsed ? 'sr-only' : 'nav-item-label'}>
            Recolher sidebar
          </span>
        </button>
        <button
          type="button"
          className="sidebar-profile"
          title="Perfil (em breve)"
          disabled
        >
          <span className="profile-avatar" aria-hidden="true">
            <User size={TAMANHO_ICONE} />
          </span>
          {collapsed ? (
            <span className="sr-only">Perfil (em breve)</span>
          ) : (
            <>
              <span className="sidebar-profile-name">Perfil</span>
              <span className="nav-soon">Em breve</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
