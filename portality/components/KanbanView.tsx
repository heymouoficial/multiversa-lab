import React, { useState } from 'react';
import { Plus, MoreHorizontal, Kanban, Circle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Task } from '../types';

interface KanbanViewProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, newStatus: Task['status']) => void;
  onAddTask: (title: string, priority: 'high' | 'medium' | 'low', status: Task['status']) => void;
}

const COLUMNS: { id: Task['status']; title: string; color: string; icon: React.ReactNode }[] = [
  { id: 'todo', title: 'Por hacer', color: 'bg-gray-500', icon: <Circle size={14} /> },
  { id: 'in-progress', title: 'En Progreso', color: 'bg-blue-500', icon: <Clock size={14} className="text-blue-500" /> },
  { id: 'review', title: 'Revisión', color: 'bg-amber-500', icon: <AlertCircle size={14} className="text-amber-500" /> },
  { id: 'done', title: 'Completado', color: 'bg-green-500', icon: <CheckCircle2 size={14} className="text-green-500" /> },
];

const KanbanView: React.FC<KanbanViewProps> = ({ tasks, onUpdateTaskStatus, onAddTask }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    if (draggedTaskId) {
      onUpdateTaskStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 mb-4 pt-2">
        <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0A0A0A] border border-white/10 rounded-xl text-theme-primary shadow-sm">
                <Kanban size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Tablero</h2>
                <p className="text-xs text-gray-500 font-medium">Notion Sync • Elevat Workspace</p>
            </div>
        </div>
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <MoreHorizontal size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Board Scroll Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-24 snap-x snap-mandatory flex gap-4 no-scrollbar">
        
        {COLUMNS.map((col) => {
            const colTasks = tasks.filter(t => t.status === col.id);
            
            return (
                <div 
                    key={col.id}
                    className="flex-shrink-0 w-[85vw] sm:w-72 h-full flex flex-col snap-center"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-white/5 border border-white/5 text-gray-300 flex items-center gap-1.5`}>
                                {col.icon}
                                {col.title}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold bg-[#0A0A0A] px-1.5 py-0.5 rounded border border-white/5">{colTasks.length}</span>
                        </div>
                        <button onClick={() => onAddTask('Nueva tarea', 'medium', col.id)} className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded">
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Column Content */}
                    <div className={`flex-1 rounded-2xl bg-[#050505]/50 border border-white/5 p-2 flex flex-col gap-2.5 overflow-y-auto no-scrollbar transition-colors ${draggedTaskId ? 'bg-white/[0.02] border-dashed border-white/10' : ''}`}>
                        
                        {colTasks.length === 0 && (
                            <div className="h-32 flex flex-col items-center justify-center text-gray-600 gap-2 opacity-50">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                    <Plus size={16} />
                                </div>
                                <span className="text-xs font-medium">Vacío</span>
                            </div>
                        )}

                        {colTasks.map(task => (
                            <div
                                key={task.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, task.id)}
                                className="group relative bg-[#121212] p-3.5 rounded-xl border border-white/5 shadow-sm hover:shadow-lg hover:border-white/10 hover:bg-[#161616] transition-all cursor-grab active:cursor-grabbing animate-in zoom-in-95 duration-200"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-sm font-medium text-gray-200 leading-snug group-hover:text-white transition-colors">{task.title}</h4>
                                </div>
                                
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex gap-1.5">
                                        {task.priority === 'high' && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                                                URGENTE
                                            </span>
                                        )}
                                        {task.tags?.map(tag => (
                                            <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-gray-500 border border-white/5">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    {/* Avatar */}
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 text-[8px] flex items-center justify-center text-white font-bold border border-[#121212] shadow-sm">
                                        {task.assignedTo || 'ME'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}
        {/* Spacer */}
        <div className="w-4 flex-shrink-0"></div>
      </div>
    </div>
  );
};

export default KanbanView;