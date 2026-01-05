import React, { useState } from 'react';
import { 
    CheckSquare, Plus, Filter, Clock, 
    AlertTriangle, CheckCircle2, Circle, ArrowRight, Users
} from 'lucide-react';
import { Task } from '../types';

interface OpsViewProps {
    tasks: Task[];
    onToggleTask?: (id: string) => void;
}

const TEAM_FILTERS = [
    { id: 'all', label: 'Todos', avatar: null },
    { id: 'AC', label: 'Andrea', avatar: 'AC', color: 'from-emerald-500 to-teal-600' },
    { id: 'CM', label: 'Christian', avatar: 'CM', color: 'from-blue-500 to-indigo-600' },
    { id: 'MV', label: 'Moisés', avatar: 'MV', color: 'from-purple-500 to-pink-600' }
];

const OpsView: React.FC<OpsViewProps> = ({ tasks, onToggleTask }) => {
    const [activeFilter, setActiveFilter] = useState('all');

    const columns = [
        { id: 'todo', label: 'Por Hacer', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
        { id: 'inProgress', label: 'En Proceso', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        { id: 'done', label: 'Completado', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
    ];

    const filteredTasks = activeFilter === 'all' 
        ? tasks 
        : tasks.filter(t => t.assignedTo === activeFilter);

    const getTasksByStatus = (status: string) => {
        if (status === 'done') return filteredTasks.filter(t => t.completed);
        if (status === 'inProgress') return filteredTasks.filter(t => !t.completed && t.priority === 'high');
        return filteredTasks.filter(t => !t.completed && t.priority !== 'high');
    };

    const getAvatarColor = (avatar: string) => {
        const member = TEAM_FILTERS.find(m => m.avatar === avatar);
        return member?.color || 'from-gray-500 to-gray-600';
    };

    return (
        <div className="p-4 md:p-10 max-w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">OPERACIONES</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic">
                        Tareas <span className="text-amber-500">Ops</span>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-lg">
                        Tablero Kanban sincronizado con Notion y Supabase.
                    </p>
                </div>

                <button className="px-5 py-3 bg-amber-600 hover:bg-amber-500 rounded-2xl text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all active:scale-95">
                    <Plus size={16} />
                    Nueva Tarea
                </button>
            </div>

            {/* TEAM FILTER */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {TEAM_FILTERS.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeFilter === filter.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 border border-white/5'
                        }`}
                    >
                        {filter.avatar ? (
                            <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${filter.color} flex items-center justify-center text-[8px] font-black text-white`}>
                                {filter.avatar}
                            </div>
                        ) : (
                            <Users size={14} />
                        )}
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* KANBAN BOARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[60vh]">
                {columns.map((column) => (
                    <div key={column.id} className="liquid-glass bg-white/[0.01] border border-white/5 rounded-[2rem] p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${column.bg} ${column.border} border`}></div>
                                <h3 className={`text-sm font-black uppercase tracking-widest ${column.color}`}>{column.label}</h3>
                            </div>
                            <span className="text-[10px] font-black text-gray-600 bg-white/5 px-2.5 py-1 rounded-full">
                                {getTasksByStatus(column.id).length}
                            </span>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto">
                            {getTasksByStatus(column.id).map((task) => (
                                <div 
                                    key={task.id} 
                                    className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.06] transition-all cursor-grab active:cursor-grabbing group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{task.title}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {task.priority === 'high' && (
                                                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-red-500/20 flex items-center gap-1">
                                                        <AlertTriangle size={10} />
                                                        Urgente
                                                    </span>
                                                )}
                                                {task.assignedTo && (
                                                    <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${getAvatarColor(task.assignedTo)} flex items-center justify-center text-[8px] font-black text-white`}>
                                                        {task.assignedTo}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => onToggleTask?.(task.id)}
                                            className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all active:scale-90"
                                        >
                                            {task.completed ? (
                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                            ) : (
                                                <Circle size={14} className="text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                    {task.dueDate && (
                                        <div className="flex items-center gap-1.5 mt-3 text-gray-500">
                                            <Clock size={10} />
                                            <span className="text-[10px] font-bold">{new Date(task.dueDate).toLocaleDateString('es-VE')}</span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {getTasksByStatus(column.id).length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                    <Circle size={24} className="mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Sin tareas</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OpsView;
