import React from 'react';
import { Task } from '../types';
import { CheckCircle2, Clock, AlertTriangle, User } from 'lucide-react';

interface TaskCardProps {
    task: Task;
    onToggle?: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle }) => {
    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    return (
        <div className={`p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md transition-all hover:bg-white/[0.05] group ${task.completed ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3">
                <button 
                    onClick={() => onToggle?.(task.id)}
                    className={`mt-1 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.completed 
                            ? 'bg-emerald-500 border-emerald-500 text-black' 
                            : 'border-white/20 hover:border-emerald-500/50'
                    }`}
                >
                    {task.completed && <CheckCircle2 size={12} strokeWidth={3} />}
                </button>
                
                <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium text-white mb-2 leading-snug ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getPriorityStyles(task.priority)}`}>
                            {task.priority}
                        </span>
                        
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium bg-white/5 px-2 py-0.5 rounded-full">
                            <User size={10} />
                            {task.assignedTo || 'Unassigned'}
                        </div>

                        {task.deadline && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium bg-white/5 px-2 py-0.5 rounded-full">
                                <Clock size={10} />
                                {new Date(task.deadline).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
