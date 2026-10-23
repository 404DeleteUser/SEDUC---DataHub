/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase (login, perfil e logs). Sem os dois, o app roda no modo local, sem login. */
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
