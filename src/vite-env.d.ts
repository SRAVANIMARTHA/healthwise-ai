/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUTER_AI_MODEL: string;
  readonly VITE_ENABLE_MOCK_AI: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_DEFAULT_LANGUAGE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
