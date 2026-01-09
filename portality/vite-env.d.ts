/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: string;
    readonly VITE_GEMINI_API_KEY: string;
    readonly VITE_TELEGRAM_BOT_TOKEN: string;
    readonly VITE_NOTION_TOKEN: string;
    readonly VITE_NOTION_DB_CLIENTS: string;
    readonly VITE_NOTION_DB_SERVICES: string;
    readonly VITE_NOTION_DB_TASKS: string;
    readonly VITE_NOTION_DB_TEAM: string;
    readonly VITE_NOTION_DB_CALENDAR: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
