/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: string;
    readonly VITE_GEMINI_API_KEY: string;
    readonly VITE_TELEGRAM_BOT_TOKEN: string;
    readonly VITE_NOTION_TOKEN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
