import React, { useState, useMemo } from 'react';
import { 
    Sun, Moon, Monitor, X, Users, Shield, Key, Copy, Plus, Building2,
    Eye, EyeOff, Database, Brain, Plug, BarChart, Check, AlertCircle
} from 'lucide-react';
import { THEMES } from '../constants';
import { API_KEYS_CONFIG, getAPIKeyValues, maskAPIKey, API_KEY_CATEGORIES } from '../config/apiKeys';
import { getCurrentBrand } from '../config/branding';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: string;
    onThemeChange: (theme: string) => void;
    currentColor: string;
    onColorChange: (colorKey: string) => void;
    currentProfileId: string;
    onProfileChange: (id: string) => void;
}

type Tab = 'general' | 'organization' | 'apikeys';

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    isOpen, onClose, currentTheme, onThemeChange, currentColor, onColorChange, currentProfileId, onProfileChange
}) => {
    const brand = getCurrentBrand();
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const apiKeyValues = useMemo(() => getAPIKeyValues(), []);

    const toggleKeyVisibility = (keyId: string) => {
        setVisibleKeys(prev => {
            const next = new Set(prev);
            if (next.has(keyId)) {
                next.delete(keyId);
            } else {
                next.add(keyId);
            }
            return next;
        });
    };

    const copyToClipboard = async (keyId: string, value: string) => {
        await navigator.clipboard.writeText(value);
        setCopiedKey(keyId);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'core': return <Database size={14} />;
            case 'ai': return <Brain size={14} />;
            case 'integration': return <Plug size={14} />;
            case 'analytics': return <BarChart size={14} />;
            default: return <Key size={14} />;
        }
    };

    const teamMembers = [
        { id: 'andrea', name: 'Andrea', role: 'CEO & Strategy', email: 'andreachimarasonlinebusiness@gmail.com', status: 'Active', avatar: 'AC' },
        { id: 'moises', name: 'Moisés (Mou)', role: 'Head of Tech & AI', email: 'moshequantum@gmail.com', status: 'Active', avatar: 'MV' },
        { id: 'christian', name: 'Christian', role: 'Head of Digital & Ecom', email: 'christomoreno6@gmail.com', status: 'Active', avatar: 'CM' },
    ];

    // Group keys by category
    const keysByCategory = useMemo(() => {
        return API_KEYS_CONFIG.reduce((acc, key) => {
            if (!acc[key.category]) acc[key.category] = [];
            acc[key.category].push(key);
            return acc;
        }, {} as Record<string, typeof API_KEYS_CONFIG>);
    }, []);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 backdrop-blur-sm ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            />

            {/* Panel */}
            <div className={`fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-white/10 rounded-t-[30px] z-[70] transition-transform duration-300 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] h-[85vh] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield size={20} style={{ color: brand.colors.primary }} />
                        Configuración Aureon
                    </h3>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mb-8">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-center gap-2 ${activeTab === 'general' ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Monitor size={16} />
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('organization')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-center gap-2 ${activeTab === 'organization' ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Building2 size={16} />
                        Equipo
                    </button>
                    <button
                        onClick={() => setActiveTab('apikeys')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-center gap-2 ${activeTab === 'apikeys' ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Key size={16} />
                        API Keys
                    </button>
                </div>

                <div className="overflow-y-auto h-[calc(100%-180px)] pr-2 space-y-8">

                    {activeTab === 'general' && (
                        <>
                            {/* Theme Toggle */}
                            <div>
                                <span className="text-xs font-bold text-gray-500 mb-3 block uppercase tracking-wider">Apariencia</span>
                                <div className="flex p-1 bg-black rounded-xl border border-white/10">
                                    {(['light', 'dark', 'system'] as const).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => onThemeChange(mode)}
                                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-center gap-2 ${currentTheme === mode ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:bg-white/5'}`}
                                        >
                                            {mode === 'light' && <Sun size={16} />}
                                            {mode === 'dark' && <Moon size={16} />}
                                            {mode === 'system' && <Monitor size={16} />}
                                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Accents */}
                            <div>
                                <span className="text-xs font-bold text-gray-500 mb-3 block uppercase tracking-wider">Acento Visual</span>
                                <div className="grid grid-cols-4 gap-3">
                                    {Object.keys(THEMES).map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => onColorChange(key)}
                                            style={{ backgroundColor: THEMES[key].primary }}
                                            className={`h-12 rounded-full border-2 border-transparent hover:scale-105 active:scale-95 transition-transform relative ring-offset-2 ring-offset-[#0A0A0A] focus:ring-2 ${currentColor === key ? 'ring-2 ring-white' : ''}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'organization' && (
                        <>
                            {/* Organization Banner */}
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-12 h-12 rounded-xl flex items-center justify-center border"
                                        style={{ backgroundColor: `${brand.colors.primary}20`, borderColor: `${brand.colors.primary}30`, color: brand.colors.primary }}
                                    >
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">{brand.name}</h4>
                                        <span 
                                            className="text-xs font-medium px-2 py-0.5 rounded-full border"
                                            style={{ backgroundColor: `${brand.colors.primary}10`, color: brand.colors.primary, borderColor: `${brand.colors.primary}20` }}
                                        >
                                            PRO PLAN
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Team Members */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Equipo Elevat</span>
                                    <button 
                                        className="text-xs flex items-center gap-1 transition-colors"
                                        style={{ color: brand.colors.primary }}
                                    >
                                        <Plus size={14} /> Invitar
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {teamMembers.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-sm font-bold text-white border border-white/10">
                                                    {member.avatar}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{member.name}</p>
                                                    <p className="text-xs text-gray-500">{member.role}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                                                Activo
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'apikeys' && (
                        <>
                            {/* Info Banner */}
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                                <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-amber-200 font-medium">Secure Enclave</p>
                                    <p className="text-xs text-amber-400/70 mt-1">
                                        Las claves sensibles están enmascaradas. Usa el icono 👁 para revelar temporalmente.
                                        En producción, Aureon puede actualizar estas claves vía Vercel API.
                                    </p>
                                </div>
                            </div>

                            {Object.entries(keysByCategory).map(([category, keys]) => (
                                <div key={category}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span style={{ color: brand.colors.primary }}>
                                            {getCategoryIcon(category)}
                                        </span>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            {API_KEY_CATEGORIES[category as keyof typeof API_KEY_CATEGORIES]?.label || category}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {(keys as typeof API_KEYS_CONFIG).map((keyConfig) => {
                                            const value = apiKeyValues[keyConfig.id];
                                            const isVisible = visibleKeys.has(keyConfig.id);
                                            const isCopied = copiedKey === keyConfig.id;
                                            const hasValue = !!value;

                                            return (
                                                <div 
                                                    key={keyConfig.id}
                                                    className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Key size={14} className="text-gray-500" />
                                                            <span className="text-sm font-medium text-white">{keyConfig.name}</span>
                                                            {keyConfig.required && !hasValue && (
                                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                                                                    FALTA
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {hasValue && (
                                                                <>
                                                                    <button 
                                                                        onClick={() => toggleKeyVisibility(keyConfig.id)}
                                                                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
                                                                        title={isVisible ? 'Ocultar' : 'Mostrar'}
                                                                    >
                                                                        {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => copyToClipboard(keyConfig.id, value!)}
                                                                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
                                                                        title="Copiar"
                                                                    >
                                                                        {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="h-8 bg-black/40 rounded-lg flex items-center px-3 font-mono text-xs">
                                                        {hasValue ? (
                                                            <span className={isVisible ? 'text-white' : 'text-gray-500'}>
                                                                {isVisible ? value : maskAPIKey(value!)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-600 italic">No configurada</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-gray-600 mt-1.5">{keyConfig.description}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Vercel Sync Info */}
                            <div className="p-4 rounded-xl border border-dashed border-white/10 bg-black/40 text-center">
                                <Shield size={24} className="mx-auto mb-2 text-gray-600" />
                                <p className="text-xs text-gray-500">
                                    Para modificar claves en producción, Aureon usará la Vercel API.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};