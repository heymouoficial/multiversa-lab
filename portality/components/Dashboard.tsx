import React from 'react';
import { 
    Database, Zap, Check, Users, Target, CheckSquare, 
    Calendar, Clock, LayoutGrid, Plus, ArrowUpRight, 
    Mic, MessageSquare, Briefcase, Activity, AlertTriangle,
    FileText as FileIcon
} from 'lucide-react';
import { Task, Lead, NotionPage, UserProfile, ViewState, CalendarEvent, Client } from '../types';
import { getCurrentBrand } from '../config/branding';

const brand = getCurrentBrand();

interface DashboardProps {
    user: UserProfile;
    tasks: Task[];
    leads: Lead[];
    notionDocs: NotionPage[];
    events: CalendarEvent[];
    clients: Client[];
    trainingMode?: { active: boolean; reason: string };
    onNavigate: (view: ViewState) => void;
    onToggleTask?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, tasks, leads, notionDocs, events, clients, trainingMode, onNavigate, onToggleTask }) => {
    
    const activeTasks = tasks.filter(t => !t.completed);
    
    // WIDGET REGISTRY
    const WIDGETS: Record<string, React.ReactNode> = {
        status: (
            <div key="status" className="col-span-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem] liquid-glass">
                <div className="flex-1 w-full md:w-auto">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl" style={{ backgroundColor: `${brand.colors.primary}1a`, borderColor: `${brand.colors.primary}33` }}>
                        <div className="flex items-center gap-2 mb-1">
                            <Database size={24} style={{ color: brand.colors.primary }} />
                            <h2 className="text-sm font-bold text-white">EST. DEL SISTEMA</h2>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="text-[10px] text-gray-400">STATUS</div>
                                <div className="w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]" style={{ backgroundColor: brand.colors.primary, color: brand.colors.primary }}></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: brand.colors.primary }}>{brand.tagline}</span>
                            </div>
                            <div className="text-[10px] font-mono text-gray-500">
                                {new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                        <Activity size={14} className="text-blue-400" />
                        <span className="text-xs font-bold text-gray-300">Health: Quantum Stable</span>
                    </div>
                </div>
            </div>
        ),
        hub: (
            <div key="hub" className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Hub Operativo', icon: <Target size={18} />, status: 'Online', color: 'text-emerald-400', view: 'agency' as ViewState },
                    { label: 'Clientes 2026', icon: <Users size={18} />, status: `${clients.length} Activos`, color: 'text-blue-400', view: 'agency' as ViewState },
                    { label: 'Tareas Ops', icon: <CheckSquare size={18} />, status: `${activeTasks.length} Pendientes`, color: 'text-amber-400', view: 'board' as ViewState },
                    { label: 'Aureon Brain', icon: <Zap size={18} />, status: 'Syncing', color: 'text-purple-400', view: 'flow' as ViewState }
                ].map((item, i) => (
                    <button 
                        key={i} 
                        onClick={() => onNavigate(item.view)}
                        className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-5 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-2xl transition-all cursor-pointer group liquid-glass text-left w-full active:scale-95"
                    >
                        <div className={`mb-4 transition-colors ${item.color}`}>{item.icon}</div>
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-gray-300 tracking-tight group-hover:text-white transition-colors">{item.label}</div>
                            <div className="text-[10px] text-gray-600 uppercase tracking-widest">{item.status}</div>
                        </div>
                    </button>
                ))}
            </div>
        ),
        tasks: (
            <section key="tasks" className="lg:col-span-8 bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-8 space-y-6 liquid-glass">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        <CheckSquare size={18} className="text-amber-400" />
                        Foco Vital
                    </h3>
                    <button onClick={() => onNavigate('board')} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Ver Kanban</button>
                </div>
                <div className="space-y-3">
                    {activeTasks.length === 0 ? (
                        <div className="text-center py-10 text-gray-600 text-sm italic">Sin tareas pendientes para hoy.</div>
                    ) : (
                        activeTasks.slice(0, 4).map(task => (
                            <div key={task.id} className="group bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.04] hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'high' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-gray-600'}`}></div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{task.title}</div>
                                        <div className="flex gap-2 mt-1">
                                            {task.priority === 'high' && <span className="text-[9px] font-black text-red-500/70 uppercase tracking-widest">Alta Prioridad</span>}
                                            {task.organizationId && <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-widest">{task.organizationId}</span>}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onToggleTask?.(task.id)}
                                    className="w-8 h-8 rounded-full border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all flex items-center justify-center group/check active:scale-90"
                                >
                                    <Check size={14} className="text-emerald-500 opacity-0 group-hover/check:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </section>
        ),
        portfolio: (
            <section key="portfolio" className="lg:col-span-4 bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-6 liquid-glass">
                <div className="flex justify-between items-center mb-6 px-2">
                    <div className="flex items-center gap-2">
                        <Briefcase size={18} className="text-blue-500" />
                        <h3 className="text-lg font-bold text-white tracking-tight">Cartera 2026</h3>
                    </div>
                </div>
                <div className="space-y-3">
                    {clients.slice(0, 4).map((client) => (
                        <button 
                            key={client.id} 
                            onClick={() => onNavigate('agency')}
                            className="w-full text-left group bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer flex justify-between items-center relative overflow-hidden active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-tr from-white/5 to-white/10 border border-white/10 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-blue-400 transition-colors">
                                    {client.logo || <LayoutGrid size={18} />}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{client.name}</div>
                                    <div className="text-[10px] text-gray-600 uppercase tracking-widest">{client.type}</div>
                                </div>
                            </div>
                            <ArrowUpRight size={14} className="text-gray-700 group-hover:text-white transition-colors" />
                        </button>
                    ))}
                </div>
                <button className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 border border-blue-400/30 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2">
                    <Plus size={14} /> Nuevo Cliente
                </button>
            </section>
        ),
        links: (
            <section key="links" className="lg:col-span-8 bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-8 liquid-glass">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white tracking-tight">Neural Links</h3>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">Active Hub</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { name: 'Supabase', icon: <Database size={16} />, color: 'text-emerald-500' },
                        { name: 'Notion', icon: <FileIcon size={16} />, color: 'text-white' },
                        { name: 'Google', icon: <Zap size={16} />, color: 'text-blue-500' },
                        { name: 'n8n', icon: <Activity size={16} />, color: 'text-orange-500' },
                        { name: 'Flowise', icon: <Mic size={16} />, color: 'text-purple-500' }
                    ].map((app, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
                            <div className={`p-3 rounded-2xl bg-black/40 ${app.color}`}>{app.icon}</div>
                            <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 transition-colors">{app.name}</span>
                        </div>
                    ))}
                </div>
            </section>
        ),
        chronos: (
            <section key="chronos" className="lg:col-span-4 bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-6 liquid-glass flex flex-col">
                <div className="flex justify-between items-center mb-6 px-2">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={18} />
                        <h3 className="text-lg font-bold tracking-tight text-white">Chronos</h3>
                    </div>
                </div>
                <div className="flex-1 space-y-4">
                    {events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-40 py-10">
                            <Clock size={32} />
                            <div className="text-[10px] font-black uppercase tracking-widest">Sin eventos próximos</div>
                        </div>
                    ) : (
                        events.map(event => (
                            <div key={event.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                <div className="text-xs font-bold text-white">{event.title}</div>
                                <div className="text-[10px] text-gray-500 flex justify-between items-center">
                                    <span>{event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {event.link && <ArrowUpRight size={10} className="text-blue-400" />}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        ),
        voice: (
            <section key="voice" className="lg:col-span-8 relative overflow-hidden bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-8 group liquid-glass">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
                <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Aureon Brain</h3>
                                <p className="text-sm text-gray-500">Inteligencia Generativa Activa</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-500 animate-pulse">Live</div>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                        <p className="text-sm text-gray-400 leading-relaxed italic">"Analizando tendencias de la Cartera 2026. Sugiero priorizar el onboarding de Clínica Pro Salud para optimizar el flujo de caja del Q1."</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['Planear Día', 'Resumen Clientes', 'Nueva Tarea'].map(cmd => (
                            <button 
                                key={cmd} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    alert(`Aureon Voice Command: "${cmd}" inicializado.`);
                                }}
                                className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500/20 transition-all active:scale-95"
                            >
                                {cmd}
                            </button>
                        ))}
                    </div>
                </div>
            </section>
        ),
        training: trainingMode?.active ? (
            <section key="training" className="lg:col-span-4 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-4 liquid-glass">
                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 animate-bounce">
                    <Activity size={24} />
                </div>
                <div className="space-y-1">
                    <h4 className="text-lg font-bold text-amber-500 tracking-tight">Modo Entrenamiento</h4>
                    <p className="text-xs text-amber-500/60 uppercase tracking-widest font-black leading-tight">{trainingMode.reason}</p>
                </div>
                <button className="px-6 py-2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-amber-400 transition-all">Finalizar Sesión</button>
            </section>
        ) : null
    };

    const layout = user.layoutConfig || ['status', 'hub', 'tasks', 'portfolio', 'links', 'chronos'];

    return (
        <main className="px-4 sm:px-6 lg:px-8 pb-32 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {layout.map(widgetId => WIDGETS[widgetId] || null)}
            </div>

            {/* BRANDING FOOTER */}
            <div className="flex flex-col items-center justify-center pt-10 pb-6 space-y-4 opacity-30 mt-12">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">{brand.name}</div>
                <div className="flex gap-4">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-700"></div>
                    <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse delay-1000"></div>
                </div>
            </div>
        </main>
    );
};

export default Dashboard;