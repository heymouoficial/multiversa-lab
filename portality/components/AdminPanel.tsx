import React, { useState } from 'react';
import { 
    Users, Clock, CheckCircle2, Circle, Plus, 
    ArrowRight, Calendar, Target, Activity,
    MessageSquare, Zap, Filter
} from 'lucide-react';
import { Task, UserProfile } from '../types';

interface AdminPanelProps {
    tasks: Task[];
    currentUser: UserProfile;
    onNavigate: (view: any) => void;
    onAddTask: (title: string, priority: 'high' | 'medium' | 'low', assignedTo: string) => void;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
    color: string;
    focus: string[];
    organization: 'ELEVAT' | 'AGORA';
}

const TEAM: TeamMember[] = [
    { 
        id: 'andrea', 
        name: 'Andrea Chimaras', 
        role: 'CEO (Strategic)', 
        avatar: 'AC',
        color: 'from-emerald-500 to-teal-600',
        focus: ['Clientes', 'Estrategia', 'Ventas'],
        organization: 'ELEVAT'
    },
    { 
        id: 'christian', 
        name: 'Christian Moreno', 
        role: 'Ops Lead', 
        avatar: 'CM',
        color: 'from-blue-500 to-indigo-600',
        focus: ['Operaciones', 'Entregas', 'QA'],
        organization: 'ELEVAT'
    },
    { 
        id: 'moises', 
        name: 'Moisés D Vera', 
        role: 'Tech Lead', 
        avatar: 'MV',
        color: 'from-purple-500 to-pink-600',
        focus: ['Desarrollo', 'Automatización', 'AI'],
        organization: 'ELEVAT'
    }
];

const AdminPanel: React.FC<AdminPanelProps> = ({ tasks, currentUser, onNavigate, onAddTask }) => {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState('moises');

    const getTasksForMember = (memberId: string) => {
        const avatar = TEAM.find(m => m.id === memberId)?.avatar || memberId.toUpperCase().slice(0, 2);
        return tasks.filter(t => t.assignedTo === avatar);
    };

    const getCompletedCount = (memberId: string) => {
        return getTasksForMember(memberId).filter(t => t.completed).length;
    };

    const getPendingCount = (memberId: string) => {
        return getTasksForMember(memberId).filter(t => !t.completed).length;
    };

    const handleQuickAddTask = () => {
        if (!newTaskTitle.trim()) return;
        onAddTask(newTaskTitle, 'medium', newTaskAssignee);
        setNewTaskTitle('');
    };

    const recentActivity = [
        { id: 1, user: 'MV', action: 'creó', item: 'Configurar n8n en VPS', time: 'hace 5 min', type: 'task' },
        { id: 2, user: 'AC', action: 'completó', item: 'Llamada Clínica Pro Salud', time: 'hace 1h', type: 'call' },
        { id: 3, user: 'CM', action: 'actualizó', item: 'Dashboard QA', time: 'hace 2h', type: 'update' },
        { id: 4, user: 'MV', action: 'vectorizó', item: 'Elevat DNA', time: 'hace 3h', type: 'ai' }
    ];

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">ADMIN PANEL</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic">
                        Equipo <span className="text-purple-500">Elevat</span>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-lg">
                        Vista global del equipo. Asigna tareas, monitorea actividad y mantén el pulso operativo.
                    </p>
                </div>

                <button 
                    onClick={() => onNavigate('board')}
                    className="px-5 py-3 bg-purple-600 hover:bg-purple-500 rounded-2xl text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all active:scale-95"
                >
                    <Target size={16} />
                    Ver Kanban
                </button>
            </div>

            {/* TEAM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {TEAM.map((member) => (
                    <div 
                        key={member.id}
                        className="liquid-glass bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-all"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${member.color} opacity-10 blur-[60px] group-hover:opacity-20 transition-all`}></div>
                        
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-black text-sm shadow-lg`}>
                                        {member.avatar}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white">{member.name}</h3>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{member.role}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                    getPendingCount(member.id) > 0 
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                    {getPendingCount(member.id)} pendientes
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {member.focus.map((area, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-full text-[9px] font-bold text-gray-400">
                                        {area}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-3 border-t border-white/5 space-y-2">
                                {getTasksForMember(member.id).slice(0, 3).map((task) => (
                                    <div key={task.id} className="flex items-center gap-2 text-[11px]">
                                        {task.completed ? (
                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                        ) : (
                                            <Circle size={12} className="text-gray-600" />
                                        )}
                                        <span className={task.completed ? 'text-gray-500 line-through' : 'text-gray-300'}>{task.title}</span>
                                    </div>
                                ))}
                                {getTasksForMember(member.id).length === 0 && (
                                    <div className="text-[10px] text-gray-600 italic">Sin tareas asignadas</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* QUICK ADD TASK + ACTIVITY FEED */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* QUICK ADD */}
                <div className="lg:col-span-5 liquid-glass bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-4">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Asignación Rápida</h4>
                    
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuickAddTask()}
                            placeholder="Nueva tarea..." 
                            className="flex-1 px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                        <select 
                            value={newTaskAssignee}
                            onChange={(e) => setNewTaskAssignee(e.target.value)}
                            className="px-3 py-3 bg-white/5 rounded-xl border border-white/10 text-sm text-gray-300 focus:outline-none"
                        >
                            {TEAM.map(m => (
                                <option key={m.id} value={m.id}>{m.avatar}</option>
                            ))}
                        </select>
                        <button 
                            onClick={handleQuickAddTask}
                            className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white transition-all active:scale-95"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {['Alta Prioridad', 'Seguimiento', 'Reunión'].map((tag) => (
                            <button 
                                key={tag}
                                onClick={() => setNewTaskTitle(prev => prev ? `${prev} - ${tag}` : tag)}
                                className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ACTIVITY TIMELINE */}
                <div className="lg:col-span-7 liquid-glass bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Actividad Reciente</h4>
                        <Activity size={14} className="text-gray-600" />
                    </div>

                    <div className="space-y-3">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                    activity.user === 'AC' ? 'bg-emerald-500/20 text-emerald-400' :
                                    activity.user === 'CM' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-purple-500/20 text-purple-400'
                                }`}>
                                    {activity.user}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-300">
                                        <span className="font-bold">{activity.user}</span> {activity.action} <span className="text-white font-medium">{activity.item}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-600">
                                    <Clock size={10} />
                                    {activity.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
