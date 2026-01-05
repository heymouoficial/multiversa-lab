export interface BrandConfig {
    id: 'elevat' | 'astursadeth' | 'multiversa' | 'runa';
    name: string;
    tagline: string;
    logo?: string;
    // Elevat Palette
    colors: {
        primary: string;    // Cyan - CTAs, active states
        accent: string;     // Indigo - Secondary actions
        success: string;    // Emerald - Online, completed
        warning: string;    // Amber - In progress
        danger: string;     // Red - Urgent, errors
        bg: string;         // Deep black background
        surface: string;    // Card backgrounds
        border: string;     // Borders
        text: string;       // Primary text
        muted: string;      // Secondary text
    };
    fontFamily: string;
    defaultAssistantMessage: string;
}

export const BRANDS: Record<string, BrandConfig> = {
    elevat: {
        id: 'elevat',
        name: 'Elevat Agency',
        tagline: 'Potencia tu Presencia Digital',
        colors: {
            primary: '#00D9FF',
            accent: '#6366F1',
            success: '#10B981',
            warning: '#F59E0B',
            danger: '#EF4444',
            bg: '#020203',
            surface: 'rgba(255,255,255,0.02)',
            border: 'rgba(255,255,255,0.05)',
            text: '#FFFFFF',
            muted: '#6B7280'
        },
        fontFamily: 'Inter, system-ui, sans-serif',
        defaultAssistantMessage: "¡Hola! Soy Aureon, el núcleo de inteligencia de Elevat. ¿Qué necesitas hoy?"
    },
    multiversa: {
        id: 'multiversa',
        name: 'Multiversa Lab',
        tagline: 'Architecting the Future',
        colors: {
            primary: '#8B5CF6',     // Violet
            accent: '#D946EF',      // Fuchsia
            success: '#10B981',
            warning: '#F59E0B',
            danger: '#EF4444',
            bg: '#080808',          // Slightly lighter dark
            surface: 'rgba(255,255,255,0.03)',
            border: 'rgba(255,255,255,0.08)',
            text: '#E5E7EB',
            muted: '#9CA3AF'
        },
        fontFamily: 'JetBrains Mono, monospace',
        defaultAssistantMessage: "Conectado al Lab. Sistemas operativos. Escuchando, Arquitecto."
    },
    runa: {
        id: 'runa',
        name: 'Runa Script',
        tagline: 'Project Management & Harmony',
        colors: {
            primary: '#EC4899',     // Pink
            accent: '#F472B6',      // Light Pink
            success: '#34D399',     // Tea Green
            warning: '#FBBF24',
            danger: '#F87171',
            bg: '#18181B',          // Zinc 900
            surface: 'rgba(255,255,255,0.04)',
            border: 'rgba(255,255,255,0.1)',
            text: '#FCE7F3',
            muted: '#FBCFE8'
        },
        fontFamily: 'Outfit, sans-serif',
        defaultAssistantMessage: "Runa Script activo. ¿Qué proyecto gestionaremos hoy?"
    }
};

export const getCurrentBrand = (orgId?: string): BrandConfig => {
    // Basic mapping from orgId/slug to brandId
    const map: Record<string, string> = {
        'multiversa-lab': 'multiversa',
        'multiversa': 'multiversa',
        'elevat-agora': 'elevat',
        'elevat': 'elevat',
        'runa-script': 'runa',
        'runa': 'runa'
    };

    const target = orgId ? map[orgId] : (import.meta.env.VITE_APP_BRAND || 'elevat');
    return BRANDS[target] || BRANDS.elevat;
};

// CSS Variable helper
export const applyBrandColors = (brand: BrandConfig) => {
    const root = document.documentElement.style;
    root.setProperty('--color-primary', brand.colors.primary);
    root.setProperty('--color-accent', brand.colors.accent);
    root.setProperty('--color-success', brand.colors.success);
    root.setProperty('--color-warning', brand.colors.warning);
    root.setProperty('--color-danger', brand.colors.danger);
    root.setProperty('--color-bg', brand.colors.bg);
    root.setProperty('--color-surface', brand.colors.surface);
    root.setProperty('--color-border', brand.colors.border);
    root.setProperty('--color-text', brand.colors.text);
    root.setProperty('--color-muted', brand.colors.muted);
};
