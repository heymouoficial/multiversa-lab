import React, { useState } from 'react';
import { 
    Database, Search, Zap, Target, BookOpen, 
    ChevronRight, ArrowRight, MessageSquare, 
    CheckCircle2, Globe, Shield, Rocket,
    Book, FileText, Layout, PlayCircle
} from 'lucide-react';

interface DataViewProps {
    notionDocs: any[];
}

const DataView: React.FC<DataViewProps> = ({ notionDocs }) => {
    const [activeTab, setActiveTab] = useState<'agora' | 'notion'>('agora');

    const sections = [
        {
            title: "¿Qué es ÁGORA?",
            icon: <Globe className="text-indigo-400" />,
            content: "ÁGORA es un sistema simple de marketing y ventas, creado para que pequeños y medianos negocios puedan tener internamente un área funcional de atracción de clientes y cierre de ventas, sin depender de agencias externas.",
            bullets: [
                "No es un curso ni una academia, es una fórmula práctica.",
                "Enfoque en atraer → contactar → dar seguimiento → vender.",
                "Genera tráfico y ventas de forma estructurada desde el día uno."
            ]
        },
        {
            title: "Fases de Implementación",
            icon: <Rocket className="text-emerald-400" />,
            phases: [
                { id: 1, name: "Origen de Prospectos", desc: "Identificar quién es el cliente ideal y dónde se encuentra." },
                { id: 2, name: "Canal de Venta", desc: "Elegir entre FB Ads, Google Ads, TikTok o LinkedIn." },
                { id: 3, name: "Activación de Tráfico", desc: "Crear campañas intencionales para generar leads interesados." },
                { id: 4, name: "Sistema de Seguimiento", desc: "Instalar CRM (GoHighLevel) con automatización de mensajes." },
                { id: 5, name: "Cierre de Ventas", desc: "Convertir conversaciones en ingresos consistentes." }
            ]
        }
    ];

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* HUB HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AGORA HUB</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">v2.4 SYNC</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic">
                        CEREBRO <span className="text-indigo-500">OP</span>
                    </h1>
                    <p className="text-gray-400 font-medium max-w-xl text-lg leading-relaxed">
                        El centro de comando cognitivo de Elevat & Agora. Sincroniza procesos, activos y conocimiento en un solo ecosistema LiquidGlass.
                    </p>
                </div>

                <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 shadow-2xl">
                    <button 
                        onClick={() => setActiveTab('agora')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'agora' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-500 hover:text-white'}`}
                    >
                        ÁGORA System
                    </button>
                    <button 
                        onClick={() => setActiveTab('notion')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'notion' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-500 hover:text-white'}`}
                    >
                        Notion Vault
                    </button>
                </div>
            </div>

            {activeTab === 'agora' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* SYSTEM OVERVIEW */}
                    <div className="lg:col-span-8 space-y-8">
                        {sections.map((section, idx) => (
                            <section key={idx} className="liquid-glass bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-all"></div>
                                
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                            {section.icon}
                                        </div>
                                        <h3 className="text-2xl font-black text-white tracking-tight">{section.title}</h3>
                                    </div>

                                    {section.content && (
                                        <p className="text-gray-400 text-lg leading-relaxed font-medium italic border-l-4 border-indigo-500/30 pl-6 py-2 bg-indigo-500/[0.02]">
                                            "{section.content}"
                                        </p>
                                    )}

                                    {section.bullets && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {section.bullets.map((bullet, i) => (
                                                <div key={i} className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                    <CheckCircle2 size={18} className="text-emerald-500 mt-1 shrink-0" />
                                                    <span className="text-xs font-bold text-gray-300 leading-normal">{bullet}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {section.phases && (
                                        <div className="space-y-4">
                                            {section.phases.map((phase) => (
                                                <div key={phase.id} className="group/phase flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all cursor-pointer">
                                                    <div className="w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-2xl text-white font-black text-xl italic shadow-lg shadow-indigo-600/20 group-hover/phase:scale-110 transition-transform">
                                                        {phase.id}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-black text-white uppercase tracking-wider">{phase.name}</h4>
                                                        <p className="text-[11px] text-gray-500 mt-1 group-hover/phase:text-gray-300 transition-colors uppercase font-bold tracking-widest">{phase.desc}</p>
                                                    </div>
                                                    <ArrowRight size={20} className="text-white/10 group-hover/phase:text-indigo-400 group-hover/phase:translate-x-2 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* SIDE PANEL: CORE ASSETS */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="liquid-glass bg-indigo-600 border border-indigo-400/30 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-[0_20px_50px_rgba(79,70,229,0.3)]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[60px] rounded-full group-hover:bg-white/30 transition-all"></div>
                            <Shield size={32} className="mb-6 opacity-80" />
                            <h3 className="text-xl font-black italic mb-2 tracking-tight">PROTECCIÓN ÁGORA</h3>
                            <p className="text-indigo-100 text-xs font-bold leading-relaxed mb-6 uppercase tracking-wider">
                                Instala el sistema que convierte el esfuerzo en resultados medibles y predecibles.
                            </p>
                            <button className="w-full py-4 bg-white text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-50 transition-all active:scale-95">
                                Desplegar en GHL
                            </button>
                        </div>

                        <div className="liquid-glass bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Neural Assets</h4>
                            <div className="space-y-4">
                                {[
                                    { name: 'Guía de Implementación', icon: <FileText size={18} className="text-blue-400" /> },
                                    { name: 'Masterclass ÁGORA', icon: <PlayCircle size={18} className="text-emerald-400" /> },
                                    { name: 'Scripts de Seguimiento', icon: <MessageSquare size={18} className="text-purple-400" /> },
                                    { name: 'Templates de Ads', icon: <Layout size={18} className="text-amber-400" /> }
                                ].map((asset, i) => (
                                    <button key={i} className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group active:scale-95">
                                        <div className="flex items-center gap-3">
                                            {asset.icon}
                                            <span className="text-[11px] font-bold text-gray-300 group-hover:text-white transition-colors">{asset.name}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-600 group-hover:text-white" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 space-y-6">
                        <div className="liquid-glass p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
                            <Database size={24} className="text-indigo-500 mb-4" />
                            <h5 className="text-white font-black text-xs uppercase tracking-widest mb-2">Supabase Sync</h5>
                            <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-widest">
                                {notionDocs.length} documentos indexados en el vector store secundario.
                            </p>
                        </div>
                    </div>

                    <div className="md:col-span-3 space-y-6">
                        <div className="liquid-glass rounded-[2.5rem] bg-white/[0.01] border border-white/5 p-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {notionDocs.map((doc, i) => (
                                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                                                <Book size={16} />
                                            </div>
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">v2.4</span>
                                        </div>
                                        <h5 className="text-sm font-bold text-white mb-1 truncate">{doc.title}</h5>
                                        <p className="text-[10px] text-gray-500 line-clamp-2 uppercase font-black tracking-tighter">Última edición: {doc.lastEdited || '2026.01.04'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataView;
