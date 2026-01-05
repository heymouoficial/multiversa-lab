import React from 'react';
import { 
    Calendar, CheckCircle2, Circle, Clock, 
    Folder, Users, FileText, TrendingUp,
    ChevronRight
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
        { label: 'Clientes', value: clients.length, icon: <Users size={18} />, color: brand.colors.primary },
        { label: 'Pendientes', value: pendingTasks.length, icon: <Clock size={18} />, color: brand.colors.warning },
        { label: 'Completadas', value: completedToday, icon: <CheckCircle2 size={18} />, color: brand.colors.success },
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

            {/* TODAY'S FOCUS */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Hoy</h2>
                    <button 
                        onClick={() => onNavigate('agency')}
                        className="text-xs font-medium flex items-center gap-1 hover:text-white transition-colors"
                        style={{ color: brand.colors.primary }}
                    >
                        Ver todo <ChevronRight size={14} />
                    </button>
                </div>

                <div className="space-y-2">
                    {pendingTasks.slice(0, 5).map((task) => (
                        <div 
                            key={task.id}
                            className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all group"
                        >
                            <button 
                                onClick={() => onToggleTask(task.id)}
                                className="shrink-0 transition-transform active:scale-90"
                            >
                                {task.completed ? (
                                    <CheckCircle2 size={20} style={{ color: brand.colors.success }} />
                                ) : (
                                    <Circle size={20} className="text-gray-600 group-hover:text-white/50" />
                                )}
                            </button>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                    {task.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    {task.priority === 'high' && (
                                        <span 
                                            className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                                            style={{ backgroundColor: `${brand.colors.danger}15`, color: brand.colors.danger }}
                                        >
                                            Urgente
                                        </span>
                                    )}
                                    {task.tags?.[0] && (
                                        <span className="text-[9px] font-medium text-gray-500">{task.tags[0]}</span>
                                    )}
                                </div>
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
                    <p className="text-sm font-medium text-white">Ver Datos</p>
                    <p className="text-xs text-gray-500">Clientes y tareas en Notion</p>
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
