/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase (login, perfil e logs). Sem os dois, o app roda no modo local, sem login. */
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** "true": Entrada sem autenticação nem validação, só para conferir o fluxo (temporário). */
  readonly VITE_ACESSO_SIMULADO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
