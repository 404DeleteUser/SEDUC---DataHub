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
import brasaoMT from '../assets/brasao-mt.png';
type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  paginaAtual: string;
  onNavigate: (pagina: string) => void;
};
export default function Sidebar({
  collapsed,
  onToggle,
  paginaAtual,
  onNavigate,
}: SidebarProps) {
  function item(Icone: LucideIcon, nome: string, pagina?: string) {
    const ativo =
      pagina === 'processos'
        ? ['processos', 'novo-processo', 'configurar-processo'].includes(
            paginaAtual
          )
        : paginaAtual === pagina;
    return (
      <button
        key={nome}
        type="button"
        className={`nav-item ${ativo ? 'nav-item-active' : ''}`}
        aria-label={nome}
        title={pagina ? nome : `${nome} — em preparação`}
        aria-current={ativo ? 'page' : undefined}
        disabled={!pagina}
        onClick={pagina ? () => onNavigate(pagina) : undefined}
      >
        <Icone size={19} aria-hidden="true" />
        <span className={collapsed ? 'sr-only' : ''}>{nome}</span>
        {!pagina && !collapsed && (
          <span className="nav-pending" aria-hidden="true">
            —
          </span>
        )}
      </button>
    );
  }
  return (
    <aside className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-brand">
        <img
          src={brasaoMT}
          alt="Brasão de Mato Grosso"
          width={40}
          height={40}
        />
        {!collapsed && (
          <div>
            <strong>
              DataHub<span>SEDUC · MT</span>
            </strong>
            <p>Secretaria de Estado de Educação</p>
          </div>
        )}
      </div>
      <div className="sidebar-scroll">
        <nav aria-label="Navegação principal">
          <p className="nav-group-label">
            {collapsed ? '···' : 'Área de trabalho'}
          </p>
          {item(House, 'Início', 'inicio')}
          {item(FolderCog, 'Processos', 'processos')}
          {item(Wrench, 'Ferramentas')}
          {item(ShieldCheck, 'Logs de Execução')}
        </nav>
        <nav aria-label="Institucional" className="nav-group">
          <p className="nav-group-label">
            {collapsed ? '···' : 'Institucional'}
          </p>
          {item(Landmark, 'Sites Institucionais')}
          {item(Building2, 'Coordenadorias e Equipes')}
        </nav>
        <nav aria-label="Preferências" className="nav-group">
          {item(Settings, 'Configurações')}
        </nav>
      </div>
      <div className="sidebar-footer">
        <button
          type="button"
          onClick={onToggle}
          className="nav-item sidebar-collapse"
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen size={19} />
          ) : (
            <PanelLeftClose size={19} />
          )}
          <span className={collapsed ? 'sr-only' : ''}>Recolher menu</span>
        </button>
        <button
          type="button"
          className="sidebar-profile"
          aria-label="Meu perfil — em preparação"
          disabled
          title="Perfil em preparação"
        >
          <span className="profile-avatar">
            <User size={18} />
          </span>
          {!collapsed && (
            <span>
              <strong>Davi Silva</strong>
              <small>Analista de Dados</small>
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
