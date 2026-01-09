import React from 'react';
import { Task } from '../types';
import { CheckCircle2, Trash2, Clock, AlertTriangle } from 'lucide-react';

interface TaskActionCardProps {
    task: Task;
    onComplete: (id: string) => void;
    onDelete: (id: string) => void;
}

const TaskActionCard: React.FC<TaskActionCardProps> = ({ task, onComplete, onDelete }) => {
    const getPriorityColor = () => {
        switch (task.priority) {
            case 'high': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <div className="mt-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2 mb-3">
                <div className={`p-1 rounded bg-white/5 ${task.priority === 'high' ? 'text-rose-400' : 'text-gray-400'}`}>
                    <AlertTriangle size={12} />
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Acción Requerida</span>
            </div>

            <h4 className="text-sm font-bold text-white mb-1">{task.title}</h4>
            <div className="flex items-center gap-3 text-[10px] mb-5">
                <span className={`px-2 py-0.5 rounded border uppercase font-bold ${getPriorityColor()}`}>
                    {task.priority}
                </span>
                {task.deadline && (
                    <span className="text-gray-500 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(task.deadline).toLocaleDateString()}
                    </span>
                )}
            </div>

            <div className="flex gap-2">
                <button 
                    onClick={() => onComplete(task.id)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                >
                    <CheckCircle2 size={14} strokeWidth={3} />
                    Completar
                </button>
                <button 
                    onClick={() => onDelete(task.id)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

export default TaskActionCard;