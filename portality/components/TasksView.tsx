import React, { useState } from 'react';
import { Plus, Check, Trash2, CheckSquare } from 'lucide-react';
import { Task } from '../types';

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (title: string, priority: 'high' | 'medium' | 'low') => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, onAddTask, onToggleTask, onDeleteTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle, priority);
    setNewTaskTitle('');
  };

  return (
    <div className="flex flex-col h-full px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        <div className="p-2.5 bg-[#0A0A0A] border border-white/10 rounded-xl text-theme-primary shadow-sm">
            <CheckSquare size={24} />
        </div>
        <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Mis Tareas</h2>
            <p className="text-xs text-gray-500 font-medium">Lista Maestra • Elevat Workspace</p>
        </div>
      </div>

      {/* Add Task Input */}
      <form onSubmit={handleAdd} className="mb-6 relative z-10">
        <div className="flex gap-2 mb-3">
            <input 
                type="text" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Nueva tarea..."
                className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-base outline-none focus:border-theme-primary transition-colors text-white placeholder:text-gray-600 focus:bg-[#111]"
            />
            <button 
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="bg-theme-primary text-white w-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-primary/90 transition-colors flex items-center justify-center"
            >
                <Plus size={24} />
            </button>
        </div>
        
        {/* Priority Selector */}
        <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map(p => (
                <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all uppercase tracking-wider ${
                        priority === p 
                        ? 'bg-theme-primary text-white border-theme-primary' 
                        : 'bg-transparent border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
                    }`}
                >
                    {p === 'high' ? 'Alta' : p === 'medium' ? 'Media' : 'Baja'}
                </button>
            ))}
        </div>
      </form>

      {/* Task List */}
      <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar pb-10">
        {tasks.length === 0 && (
            <div className="text-center py-10 text-gray-600">
                <p>No hay tareas pendientes.</p>
                <p className="text-sm mt-1">Usa a Aureon o agrega una manualmente.</p>
            </div>
        )}

        {tasks.map(task => (
            <div 
                key={task.id}
                className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                    task.completed 
                    ? 'bg-[#050505] border-transparent opacity-50' 
                    : 'bg-[#121212] border-white/5 hover:border-white/10 shadow-sm'
                }`}
            >
                <button 
                    onClick={() => onToggleTask(task.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.completed 
                        ? 'bg-theme-secondary border-theme-secondary' 
                        : 'border-gray-600 hover:border-theme-primary'
                    }`}
                >
                    {task.completed && <Check size={14} className="text-black" strokeWidth={3} />}
                </button>
                
                <div className="flex-1 min-w-0">
                    <p className={`text-base font-medium transition-all ${
                        task.completed 
                        ? 'text-gray-600 line-through' 
                        : 'text-gray-200'
                    }`}>
                        {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                            task.priority === 'high' 
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                            : task.priority === 'medium'
                            ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                            : 'text-gray-400 bg-white/5 border-white/5'
                        }`}>
                            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                        </span>
                    </div>
                </div>

                <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};

export default TasksView;