import React from 'react';
import { 
    Calendar, CheckCircle2, Circle, Clock, 
    Folder, Users, FileText, TrendingUp,
    ChevronRight, Layout
} from 'lucide-react';
import { Task, UserProfile, Client } from '../types';
import { getCurrentBrand } from '../config/branding';

interface HomeViewProps {
    user: UserProfile;
    tasks: Task[];
    clients: Client[];
    onNavigate: (view: any) => void;
    onToggleTask: (id: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ user, tasks, clients, onNavigate, onToggleTask }) => {
    const brand = getCurrentBrand();
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    const myTasks = tasks.filter(t => t.assignedTo === user.avatar);
    const pendingTasks = myTasks.filter(t => !t.completed);
    const completedToday = myTasks.filter(t => t.completed).length;

    const stats = [
        { label: 'Clientes Activos', value: clients.length, icon: <Users size={18} />, color: brand.colors.primary },
        { label: 'Tareas Operativas', value: pendingTasks.length, icon: <Layout size={18} />, color: brand.colors.warning },
        { label: 'Eficiencia', value: '94%', icon: <TrendingUp size={18} />, color: brand.colors.success },
    ];

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* GREETING */}
            <div className="mb-8">
                <p className="text-sm text-gray-500 mb-1">{getGreeting()},</p>
                <h1 className="text-3xl font-bold text-white tracking-tight">{user.name}</h1>
                <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <span className="text-2xl font-bold text-white">{stat.value}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

             {/* CRM SUMMARY WIDGET */}
             <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="p-1 rounded bg-purple-500/20 text-purple-400">🎲</span>
                        Resumen Agencia
                    </h2>
                    <button 
                        onClick={() => onNavigate('agency')}
                        className="text-xs font-medium flex items-center gap-1 hover:text-white transition-colors"
                        style={{ color: brand.colors.primary }}
                    >
                        Ir al Hub <ChevronRight size={14} />
                    </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                     {/* MINI CLIENTS LIST */}
                    <div className="p-5 rounded-2xl bg-[#09090b] border border-white/5">
                        <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase">Estado de Clientes</h3>
                        <div className="space-y-3">
                            {clients.slice(0, 3).map(client => (
                                <div key={client.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-white">
                                            {client.name.substr(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">{client.name}</p>
                                            <p className="text-[10px] text-gray-500">{client.company || 'Retainer'}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400 border border-green-500/20">
                                        Al día
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RECENT ACTIVITY / UPDATES */}
                    <div className="p-5 rounded-2xl bg-[#09090b] border border-white/5">
                        <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase">Actualizaciones Recientes</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <div>
                                    <p className="text-xs text-white leading-relaxed">
                                        <span className="font-bold text-blue-400">@Andrea</span> actualizó el reporte de <span className="text-gray-300">Clinica Pro Salud</span>.
                                    </p>
                                    <p className="text-[10px] text-gray-600 mt-1">Hace 2 horas</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                                <div>
                                    <p className="text-xs text-white leading-relaxed">
                                        Nuevo lead calificado en <span className="font-bold text-purple-400">Hostinger VPS</span> (vía Web).
                                    </p>
                                    <p className="text-[10px] text-gray-600 mt-1">Hace 5 horas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>

            {/* TODAY'S FOCUS (Simplified) */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Mis Tareas Hoy</h2>
                </div>

                <div className="space-y-1">
                    {pendingTasks.slice(0, 5).map((task) => (
                        <div 
                            key={task.id}
                            className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.04] transition-all group"
                        >
                            <button 
                                onClick={() => onToggleTask(task.id)}
                                className="shrink-0 transition-transform active:scale-90"
                            >
                                {task.completed ? (
                                    <CheckCircle2 size={18} style={{ color: brand.colors.success }} />
                                ) : (
                                    <Circle size={18} className="text-gray-600 group-hover:text-white/50" />
                                )}
                            </button>
                            <div className="flex-1 min-w-0 flex items-center justify-between">
                                <p className={`text-sm font-medium truncate ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                    {task.title}
                                </p>
                                <span className="text-[10px] text-gray-600 font-mono px-2">
                                     {task.tags?.[0] || 'General'}
                                </span>
                            </div>
                        </div>
                    ))}

                    {pendingTasks.length === 0 && (
                        <div className="text-center py-8 text-gray-600">
                            <CheckCircle2 size={32} className="mx-auto mb-3 opacity-50" />
                            <p className="text-sm">¡Todo al día!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => onNavigate('agency')}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-left hover:bg-white/[0.04] transition-all group"
                >
                    <Folder size={20} className="mb-2" style={{ color: brand.colors.primary }} />
                    <p className="text-sm font-medium text-white">Hub Operativo</p>
                    <p className="text-xs text-gray-500">Gestión de Clientes y Proyectos</p>
                </button>
                <button 
                    onClick={() => onNavigate('flow')}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-left hover:bg-white/[0.04] transition-all group"
                >
                    <FileText size={20} className="mb-2" style={{ color: brand.colors.accent }} />
                    <p className="text-sm font-medium text-white">Base de Conocimiento</p>
                    <p className="text-xs text-gray-500">Documentos vectorizados</p>
                </button>
            </div>
        </div>
    );
};

export default HomeView;
