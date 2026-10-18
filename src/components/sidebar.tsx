import type { ReactNode } from 'react';

import {
  House,
  FolderCog,
  Wrench,
  Landmark,
  ShieldCheck,
  Building2,
  Settings,
  User,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

import brasaoMT from '../assets/brasao-mt.png';

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  paginaAtual: string;
  onNavigate: (pagina: string) => void;
};

type SidebarItemProps = {
  icon: ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
  onClick?: () => void;
};

function Sidebar({
  collapsed,
  onToggle,
  paginaAtual,
  onNavigate,
}: SidebarProps) {
  return (
    <aside
      className={`
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        h-screen
        shrink-0
        bg-[var(--bg-sidebar)]
        border-r
        border-[var(--border)]
        flex
        flex-col
        text-[var(--text-primary)]
        overflow-hidden
        transition-[width,background-color,border-color,color]
        duration-200
        ease-in-out
      `}
    >
      {/* ===================================================== */}
      {/* CABEÇALHO */}
      {/* ===================================================== */}

      <div
        className={`
          flex
          items-center
          h-[100px]
          border-b
          border-[var(--border)]
          transition-colors
          ${collapsed ? 'justify-center px-2' : 'justify-between gap-2 px-4'}
        `}
      >
        {/* ================================================= */}
        {/* SIDEBAR RECOLHIDA */}
        {/* ================================================= */}

        {collapsed ? (
          <button
            type="button"
            onClick={onToggle}
            title="Expandir sidebar"
            aria-label="Expandir sidebar"
            className="
              group
              relative
              w-12
              h-12
              flex
              items-center
              justify-center
              rounded-lg
              hover:bg-[var(--hover)]
              transition-colors
            "
          >
            {/* Brasão */}
            <img
              src={brasaoMT}
              alt="Brasão do Estado de Mato Grosso"
              className="
                absolute
                w-9
                h-9
                object-contain
                transition-all
                duration-200
                opacity-100
                scale-100
                group-hover:opacity-0
                group-hover:scale-90
              "
            />

            {/* Seta */}
            <ChevronRight
              size={22}
              className="
                absolute
                text-[var(--text-secondary)]
                opacity-0
                scale-90
                transition-all
                duration-200
                group-hover:opacity-100
                group-hover:scale-100
                group-hover:text-[var(--text-primary)]
              "
            />
          </button>
        ) : (
          <>
            {/* ================================================= */}
            {/* IDENTIDADE */}
            {/* ================================================= */}

            <div className="flex items-center gap-3 min-w-0">
              <img
                src={brasaoMT}
                alt="Brasão do Estado de Mato Grosso"
                className="
                  w-12
                  h-12
                  object-contain
                  shrink-0
                "
              />

              <div className="min-w-0">
                <h1
                  className="
                    text-xl
                    font-bold
                    leading-none
                    text-[var(--text-primary)]
                  "
                >
                  DataHub
                </h1>

                <p
                  className="
                    text-[10px]
                    leading-tight
                    text-[var(--text-muted)]
                    mt-1
                  "
                >
                  Secretaria de Estado de Educação de Mato Grosso
                </p>
              </div>
            </div>

            {/* ================================================= */}
            {/* RECOLHER */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={onToggle}
              title="Recolher sidebar"
              aria-label="Recolher sidebar"
              className="
                w-7
                h-7
                shrink-0
                flex
                items-center
                justify-center
                rounded-md
                text-[var(--text-muted)]
                hover:text-[var(--text-primary)]
                hover:bg-[var(--hover)]
                transition-colors
              "
            >
              <ChevronLeft size={19} />
            </button>
          </>
        )}
      </div>

      {/* ===================================================== */}
      {/* NAVEGAÇÃO PRINCIPAL */}
      {/* ===================================================== */}

      <nav className="px-3 py-4 space-y-1">
        <SidebarItem
          icon={<House size={19} />}
          label="Início"
          active={paginaAtual === 'inicio'}
          collapsed={collapsed}
          onClick={() => onNavigate('inicio')}
        />

        <SidebarItem
          icon={<FolderCog size={19} />}
          label="Processos"
          active={
            paginaAtual === 'processos' ||
            paginaAtual === 'novo-processo' ||
            paginaAtual === 'configurar-processo'
          }
          collapsed={collapsed}
          onClick={() => onNavigate('processos')}
        />

        <SidebarItem
          icon={<Wrench size={19} />}
          label="Ferramentas"
          collapsed={collapsed}
        />

        <SidebarItem
          icon={<ShieldCheck size={19} />}
          label="Logs de Execução"
          collapsed={collapsed}
        />
      </nav>

      {/* ===================================================== */}
      {/* SEPARADOR */}
      {/* ===================================================== */}

      <div
        className="
          mx-4
          my-2
          border-t
          border-[var(--border)]
          transition-colors
        "
      />

      {/* ===================================================== */}
      {/* ÁREA INSTITUCIONAL */}
      {/* ===================================================== */}

      <nav className="px-3 py-2 space-y-1">
        <SidebarItem
          icon={<Landmark size={19} />}
          label="Sites Institucionais"
          collapsed={collapsed}
        />

        <SidebarItem
          icon={<Building2 size={19} />}
          label="Coordenadorias e Equipes"
          collapsed={collapsed}
        />
      </nav>

      {/* ===================================================== */}
      {/* CONFIGURAÇÕES */}
      {/* ===================================================== */}

      <div className="px-3 mt-2">
        <SidebarItem
          icon={<Settings size={19} />}
          label="Configurações"
          collapsed={collapsed}
        />
      </div>

      {/* Espaço para manter perfil embaixo */}
      <div className="flex-1" />

      {/* ===================================================== */}
      {/* PERFIL */}
      {/* ===================================================== */}

      <div
        className="
          h-[76px]
          px-3
          flex
          items-center
          border-t
          border-[var(--border)]
          transition-colors
        "
      >
        <button
          type="button"
          title={collapsed ? 'Meu perfil' : undefined}
          aria-label="Abrir meu perfil"
          className={`
            group
            w-full
            flex
            items-center
            rounded-lg
            hover:bg-[var(--hover)]
            transition-colors
            text-left
            ${collapsed ? 'justify-center p-1' : 'gap-3 px-2 py-2'}
          `}
        >
          {/* Avatar */}
          <div
            className="
              w-10
              h-10
              rounded-full
              bg-blue-600
              text-white
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <User size={19} />
          </div>

          {/* Dados */}
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p
                  className="
                    text-sm
                    font-medium
                    truncate
                    text-[var(--text-primary)]
                  "
                >
                  Davi Silva
                </p>

                <p
                  className="
                    text-[11px]
                    text-[var(--text-muted)]
                    truncate
                  "
                >
                  Analista de Dados
                </p>
              </div>

              <ChevronRight
                size={16}
                className="
                  shrink-0
                  text-[var(--text-muted)]
                  group-hover:text-[var(--text-primary)]
                  transition-colors
                "
              />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

/* ===================================================== */
/* ITEM DA SIDEBAR */
/* ===================================================== */

function SidebarItem({
  icon,
  label,
  active = false,
  collapsed,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={`
        w-full
        flex
        items-center
        rounded-md
        text-sm
        transition-colors
        ${collapsed ? 'justify-center h-11 px-0' : 'gap-3 px-4 py-3'}

        ${
          active
            ? `
              bg-blue-500/10
              text-blue-500
              border-l-2
              border-blue-500
            `
            : `
              text-[var(--text-secondary)]
              hover:bg-[var(--hover)]
              hover:text-[var(--text-primary)]
              border-l-2
              border-transparent
            `
        }
      `}
    >
      <span
        className={`
          shrink-0
          transition-colors

          ${active ? 'text-blue-500' : 'text-[var(--text-muted)]'}
        `}
      >
        {icon}
      </span>

      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
}

export default Sidebar;
