import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, AlertCircle, Database, Globe, Layers, Clock, Loader2, CheckCircle2, Zap, ArrowRight as ArrowRightIcon, Cpu, Activity, HardDrive, Bell, Network } from 'lucide-react';
import { getCurrentBrand } from '../config/branding';
import { notionService } from '../services/notionService';
import { supabase } from '../lib/supabase';

interface Connection {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    type: 'productivity' | 'infrastructure' | 'marketing';
}

interface IntegrationStatus {
    status: 'connected' | 'disconnected' | 'pending' | 'active';
    lastSynced?: string;
    metadata?: Record<string, any>;
}

const ConnectionSkeleton = () => (
    <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-5 animate-pulse">
        <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/5"></div>
            <div className="flex gap-2">
                <div className="w-16 h-6 rounded-lg bg-white/5"></div>
                <div className="w-8 h-8 rounded-lg bg-white/5"></div>
            </div>
        </div>
        <div className="w-32 h-6 rounded bg-white/5 mb-2"></div>
        <div className="w-full h-10 rounded bg-white/5 mb-6"></div>
        <div className="flex justify-between pt-4 border-t border-white/5">
            <div className="w-20 h-4 rounded bg-white/5"></div>
            <div className="w-24 h-8 rounded-lg bg-white/5"></div>
        </div>
    </div>
);

const ConnectionsView: React.FC<{ organizationId: string }> = ({ organizationId }) => {
    const brand = getCurrentBrand();
    const [searchQuery, setSearchQuery] = useState('');
    const [connectingId, setConnectingId] = useState<string | null>(null);
    const [integrationStates, setIntegrationStates] = useState<Record<string, IntegrationStatus>>({});
    const [loading, setLoading] = useState(true);

    // Fetch Integrations from DB
    useEffect(() => {
        const fetchIntegrations = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('organizations')
                    .select('settings')
                    .eq('id', organizationId)
                    .single();

                if (data?.settings?.integrations) {
                    setIntegrationStates(data.settings.integrations);
                }
            } catch (err) {
                console.error('Error fetching integrations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchIntegrations();
    }, [organizationId]);

    const updateIntegrationStatus = async (id: string, newStatus: IntegrationStatus) => {
        const newStates = { ...integrationStates, [id]: newStatus };
        setIntegrationStates(newStates);

        try {
            const { data: currentData } = await supabase
                .from('organizations')
                .select('settings')
                .eq('id', organizationId)
                .single();
            
            const updatedSettings = {
                ...(currentData?.settings || {}),
                integrations: newStates
            };

            await supabase
                .from('organizations')
                .update({ settings: updatedSettings })
                .eq('id', organizationId);

        } catch (err) {
            console.error('Error persisting integration status:', err);
        }
    };

    const handleConnect = async (id: string, name: string) => {
        setConnectingId(id);
        
        // Optimistic pending
        await updateIntegrationStatus(id, { status: 'pending' });

        try {
            if (id === 'notion') {
                // await notionService.provisionWorkspace(organizationId, organizationId);
                // Simulate delay for effect
                await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
                 await new Promise(resolve => setTimeout(resolve, 1500));
            }

            // Success
            await updateIntegrationStatus(id, { 
                status: 'active' as const,
                lastSynced: 'Ahora mismo'
            });

        } catch (error) {
            console.error('Failed to connect:', error);
            await updateIntegrationStatus(id, { status: 'disconnected' });
        } finally {
            setConnectingId(null);
        }
    };

    const AVAILABLE_CONNECTIONS: Connection[] = [
        { 
            id: 'notion', 
            name: 'Notion', 
            description: 'Sincronización bidireccional de tareas y documentación.',
            icon: <Database size={24} />,
            type: 'productivity'
        },
        { 
            id: 'ghl', 
            name: 'Go High Level', 
            description: 'Gestión de leads y automatización de marketing.',
            icon: <Layers size={24} />,
            type: 'marketing'
        },
        { 
            id: 'hostinger', 
            name: 'Hostinger VPS', 
            description: 'Infraestructura y hosting dedicado de la organización.',
            icon: <Globe size={24} />,
            type: 'infrastructure'
        },
        { 
            id: 'asana', 
            name: 'Asana', 
            description: 'Gestión de flujos de trabajo externos.',
            icon: <Zap size={24} />,
            type: 'productivity'
        }
    ];

    const filteredConnections = AVAILABLE_CONNECTIONS.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Conexiones</h1>
                    <p className="text-gray-500 text-sm max-w-md">
                        Gestiona las integraciones y la infraestructura de <span className="text-white font-bold">{organizationId.toUpperCase()}</span>.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Buscar integración..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            {/* INTEGRATIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    // SKELETONS LOADERS
                    <>
                        <ConnectionSkeleton />
                        <ConnectionSkeleton />
                        <ConnectionSkeleton />
                    </>
                ) : (
                    filteredConnections.map((conn) => {
                        const integration = integrationStates[conn.id];
                        const status = integration?.status || 'disconnected';
                        const isConnecting = connectingId === conn.id;
                        
                        // Override for persistence check visual
                        const effectiveStatus = isConnecting ? 'pending' : status;

                        return (
                            <div 
                                key={conn.id}
                                className="group relative bg-[#0A0A0B] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all overflow-hidden"
                            >
                                {/* Status Bar */}
                                <div className={`absolute top-0 left-0 right-0 h-1 ${
                                    effectiveStatus === 'connected' ? 'bg-emerald-500/50' : 
                                    effectiveStatus === 'pending' ? 'bg-amber-500/50' : 'bg-transparent'
                                }`} />

                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-white/5 text-white group-hover:scale-110 transition-transform duration-500 flex flex-col items-center justify-center gap-1 min-w-[3rem]">
                                        {conn.icon}
                                        {/* Mobile Label */}
                                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-50 md:hidden">{conn.type.slice(0,3)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${
                                            effectiveStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-400' :
                                            effectiveStatus === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                            'bg-white/5 text-gray-500'
                                        }`}>
                                            {effectiveStatus === 'connected' ? 'Activo' : 
                                             effectiveStatus === 'pending' ? 'Configurando' : 'Desconectado'}
                                        </span>
                                        <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/5 transition-all">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-1">{conn.name}</h3>
                                <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                                    {conn.description}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    {effectiveStatus === 'connected' ? (
                                        <div className="flex items-center gap-2 text-[10px] font-medium text-gray-500">
                                            <Clock size={12} />
                                            {integration?.lastSynced || 'Sincronizado'}
                                        </div>
                                    ) : (
                                        <div className="text-[10px] font-medium text-gray-600 uppercase tracking-widest flex items-center gap-1">
                                            <AlertCircle size={10} /> {effectiveStatus === 'pending' ? 'Procesando...' : 'Requiere acción'}
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => handleConnect(conn.id, conn.name)}
                                        disabled={isConnecting || effectiveStatus === 'connected'}
                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            effectiveStatus === 'connected' 
                                                ? 'bg-emerald-500/10 text-emerald-400 cursor-default' 
                                                : 'bg-white text-black hover:bg-gray-200 disabled:opacity-50'
                                        }`}
                                    >
                                        {isConnecting ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <>
                                                {effectiveStatus === 'connected' ? 'Listo' : 'Conectar'}
                                                {effectiveStatus === 'connected' ? <CheckCircle2 size={14} /> : <ArrowRightIcon size={14} />}
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Liquid Visual Element */}
                                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-colors duration-700 pointer-events-none"></div>
                            </div>
                        );
                    })
                )}

                {/* ADD NEW CARD - Always visible or potentially conditionally if admin */}
                <button className="flex flex-col items-center justify-center p-8 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all group">
                    <div className="p-3 rounded-full bg-white/5 text-gray-500 mb-3 group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                    </div>
                    <p className="text-sm font-bold text-gray-500 group-hover:text-white transition-colors">Añadir Integración</p>
                    <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest">SDK Marketplace</p>
                </button>
            </div>

            {/* HOSTINGER / VPS SPECIAL SECTION */}
            <div className="mt-12 p-6 rounded-[28px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Globe size={120} />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1">
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Estatus de Infraestructura</h2>
                        <p className="text-sm text-gray-400 max-w-xl mb-6 leading-relaxed">
                            Cada organización en Portality opera sobre su propia instancia dedicada. 
                            Garantiza la soberanía de tus datos y el rendimiento óptimo de Aureon.
                        </p>
                        
                        <div className="flex flex-wrap gap-4">
                            <div className="flex flex-col gap-1 p-3 rounded-xl bg-black/40 border border-white/5 min-w-[140px]">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Server Location</span>
                                <span className="text-sm text-white font-mono">FIN-HEL-01</span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 rounded-xl bg-black/40 border border-white/5 min-w-[140px]">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">CPU Usage</span>
                                <span className="text-sm text-emerald-400 font-mono">12%</span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 rounded-xl bg-black/40 border border-white/5 min-w-[140px]">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Memory</span>
                                <span className="text-sm text-indigo-400 font-mono">4.2GB / 8GB</span>
                            </div>
                        </div>
                    </div>
                    
                    <a 
                        href="https://hpanel.hostinger.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-8 py-3 rounded-xl bg-white text-black font-black text-sm tracking-wide hover:scale-105 active:scale-95 transition-all shadow-indigo-500/20 shadow-2xl"
                    >
                        Gestionar VPS
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ConnectionsView;
