import React from 'react';
import { Client, Task } from '../types';
import { getCurrentBrand } from '../config/branding';
import { Activity, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface ClientSummaryCardProps {
    client: Client;
    activeTasks: Task[];
}

const ClientSummaryCard: React.FC<ClientSummaryCardProps> = ({ client, activeTasks }) => {
    const brand = getCurrentBrand();

    // Calculate stats
    const highPriorityTasks = activeTasks.filter(t => t.priority === 'high').length;
    const completedTasks = activeTasks.filter(t => t.completed).length;
    const totalTasks = activeTasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return brand.colors.success;
            case 'risk': return brand.colors.accent; // Usually pink/red for risk
            case 'paused': return '#fbbf24'; // Amber
            default: return '#9ca3af';
        }
    };

    return (
        <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-white/20">
            {/* LIQUID GLASS BACKGROUND */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-black/40"></div>
            <div 
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-20 animate-pulse"
                style={{ backgroundColor: getStatusColor(client.status) }}
            ></div>

            <div className="relative p-6">
                {/* HEADER */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight mb-1">{client.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/70 border border-white/5">
                                {client.type}
                            </span>
                            <span 
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                                style={{ 
                                    backgroundColor: `${getStatusColor(client.status)}20`, 
                                    color: getStatusColor(client.status),
                                    border: `1px solid ${getStatusColor(client.status)}40`
                                }}
                            >
                                <Activity size={10} />
                                {client.status}
                            </span>
                        </div>
                    </div>
                    {/* LOGO PLACEHOLDER */}
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-white/20">
                        {client.name.substring(0, 2).toUpperCase()}
                    </div>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-black/20 border border-white/5 flex flex-col justify-between">
                        <span className="text-xs text-gray-500 font-medium">Tareas Activas</span>
                        <div className="flex items-end gap-2 mt-1">
                            <span className="text-xl font-bold text-white">{totalTasks - completedTasks}</span>
                            <span className="text-[10px] text-gray-500 mb-1">pendientes</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-black/20 border border-white/5 flex flex-col justify-between">
                        <span className="text-xs text-gray-500 font-medium">Prioridad Alta</span>
                        <div className="flex items-end gap-2 mt-1">
                            <span className="text-xl font-bold text-rose-400">{highPriorityTasks}</span>
                            {highPriorityTasks > 0 && <AlertTriangle size={14} className="text-rose-400 mb-1 animate-bounce" />}
                        </div>
                    </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="mb-2 flex justify-between text-xs font-medium text-gray-400">
                    <span>Progreso del Ciclo</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                            width: `${progress}%`,
                            backgroundColor: getStatusColor(client.status),
                            boxShadow: `0 0 10px ${getStatusColor(client.status)}`
                        }}
                    ></div>
                </div>

                {/* NEXT ACTIONS */}
                {activeTasks.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Próximas Entregas</p>
                        <div className="space-y-2">
                            {activeTasks.slice(0, 2).map(task => (
                                <div key={task.id} className="flex items-center gap-3 group/task">
                                    <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'high' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                    <span className="text-sm text-gray-300 truncate group-hover/task:text-white transition-colors">
                                        {task.title}
                                    </span>
                                    {task.deadline && (
                                        <span className="ml-auto text-[10px] text-gray-600 flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
                                            <Clock size={10} />
                                            {new Date(task.deadline).getDate()}/{new Date(task.deadline).getMonth()+1}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientSummaryCard;
