// Centralized API Keys Configuration
// This file provides a single source of truth for all API keys displayed in Settings

export interface APIKeyConfig {
    id: string;
    name: string;
    description: string;
    envVar: string;
    category: 'core' | 'ai' | 'integration' | 'analytics';
    sensitive: boolean;
    required: boolean;
}

export const API_KEYS_CONFIG: APIKeyConfig[] = [
    // Core
    {
        id: 'supabase_url',
        name: 'Supabase URL',
        description: 'URL del proyecto Supabase',
        envVar: 'VITE_SUPABASE_URL',
        category: 'core',
        sensitive: false,
        required: true
    },
    {
        id: 'supabase_anon',
        name: 'Supabase Anon Key',
        description: 'Clave pública para client-side',
        envVar: 'VITE_SUPABASE_ANON_KEY',
        category: 'core',
        sensitive: true,
        required: true
    },
    
    // AI
    {
        id: 'gemini',
        name: 'Gemini API Key',
        description: 'Google AI para Aureon',
        envVar: 'VITE_GEMINI_API_KEY',
        category: 'ai',
        sensitive: true,
        required: true
    },
    {
        id: 'openrouter',
        name: 'OpenRouter API Key',
        description: 'Fallback para modelos LLM',
        envVar: 'VITE_OPENROUTER_API_KEY',
        category: 'ai',
        sensitive: true,
        required: false
    },
    
    // Integrations
    {
        id: 'notion',
        name: 'Notion Token',
        description: 'Integración con Notion workspace',
        envVar: 'VITE_NOTION_TOKEN',
        category: 'integration',
        sensitive: true,
        required: true
    },
    {
        id: 'hostinger',
        name: 'Hostinger API Key',
        description: 'Monitoreo de VPS',
        envVar: 'VITE_HOSTINGER_API_KEY',
        category: 'integration',
        sensitive: true,
        required: false
    },
    
    // Vercel
    {
        id: 'vercel_token',
        name: 'Vercel Token',
        description: 'Para actualizar env vars en producción',
        envVar: 'VITE_VERCEL_TOKEN',
        category: 'analytics',
        sensitive: true,
        required: false
    },
    {
        id: 'vercel_project',
        name: 'Vercel Project ID',
        description: 'ID del proyecto en Vercel',
        envVar: 'VITE_VERCEL_PROJECT_ID',
        category: 'analytics',
        sensitive: false,
        required: false
    }
];

// Get current values from environment
export function getAPIKeyValues(): Record<string, string | undefined> {
    const values: Record<string, string | undefined> = {};
    
    API_KEYS_CONFIG.forEach(key => {
        // Only VITE_ prefixed vars are available in client
        if (key.envVar.startsWith('VITE_')) {
            values[key.id] = import.meta.env[key.envVar];
        }
    });
    
    return values;
}

// Mask sensitive values for display
export function maskAPIKey(value: string): string {
    if (!value || value.length < 8) return '••••••••';
    return `${value.slice(0, 4)}${'•'.repeat(Math.min(value.length - 8, 20))}${value.slice(-4)}`;
}

// Categories for grouping in UI
export const API_KEY_CATEGORIES = {
    core: { label: 'Core', icon: 'Database' },
    ai: { label: 'AI & LLM', icon: 'Brain' },
    integration: { label: 'Integraciones', icon: 'Plug' },
    analytics: { label: 'Analytics', icon: 'BarChart' }
};
