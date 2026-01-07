import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff, Loader2, CheckCircle2, Clock, Plus, ExternalLink, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { geminiService, AureonMessage, UIAction, AureonContext } from '../services/geminiService';
import { getCurrentBrand } from '../config/branding';

import { Task, ViewState } from '../types';

interface FloatingChatProps {
    tasks?: Task[];
    onNavigate?: (view: ViewState) => void;
    onAddTask?: (task: { title: string; priority: string; assignedTo: string }) => void;
    userName?: string;
    pendingTaskCount?: number;
    organizationId?: string;
    organizationName?: string;
    integrations?: {
        notion?: 'connected' | 'disconnected';
        hostinger?: 'connected' | 'disconnected';
    };
}

const FloatingChat: React.FC<FloatingChatProps> = ({ 
    tasks = [],
    onNavigate,
    onAddTask,
    userName = 'Usuario',
    pendingTaskCount = 0,
    organizationId,
    organizationName,
    integrations
}) => {
    const brand = getCurrentBrand();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<AureonMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Welcome message on first open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: `¡Hola ${userName}! Soy **Aureon**, la Superinteligencia de **Multiversa Lab**.\nUtilizo la tecnología de mis creadores para asistirte con la Inteligencia de Portality en **[${organizationName || 'esta organización'}]**.\n\n¿En qué puedo ayudarte hoy?\n\n💡 Prueba: *"¿Tengo tareas pendientes?"* o *"¿Cómo está conectada mi organización?"*`,
                timestamp: new Date(),
            }]);
        }
    }, [isOpen, userName]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: AureonMessage = {
            role: 'user',
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const { ragService } = await import('../services/ragService');
            const ragContext = await ragService.retrieveContext(inputValue, 'user', organizationId);

            const context: AureonContext = {
                userName,
                pendingTasks: pendingTaskCount,
                currentView: 'home',
                ragContext: ragContext,
                currentOrgName: organizationName,
                integrations: integrations
            };

            const response = await geminiService.chat(inputValue, context);
            setMessages(prev => [...prev, response]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Render UI actions
    const renderAction = (action: UIAction) => {
        switch (action.type) {
            case 'task_list':
                const filteredTasks = action.data?.filter === 'pending' 
                    ? tasks.filter(t => !t.completed)
                    : tasks;
                return (
                    <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase">Tareas</span>
                            <span className="text-xs text-gray-500">{filteredTasks.length} items</span>
                        </div>
                        <div className="space-y-1.5">
                            {filteredTasks.slice(0, 5).map(task => (
                                <div 
                                    key={task.id}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-black/30 hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    {task.completed ? (
                                        <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                                    ) : (
                                        <Clock size={14} className="text-amber-500 shrink-0" />
                                    )}
                                    <span className="text-sm text-white truncate flex-1">{task.title}</span>
                                    <span className="text-[10px] text-gray-500">{task.assignedTo}</span>
                                </div>
                            ))}
                        </div>
                        {filteredTasks.length > 5 && (
                            <button 
                                onClick={() => onNavigate?.('agency')}
                                className="w-full mt-2 py-1.5 text-xs text-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                style={{ color: brand.colors.primary }}
                            >
                                Ver todas ({filteredTasks.length})
                            </button>
                        )}
                    </div>
                );

            case 'confirm_task':
                const newTask = action.data;
                return (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-sm text-emerald-300 mb-2">¿Crear esta tarea?</p>
                        <div className="p-2 rounded-lg bg-black/30">
                            <p className="text-sm text-white font-medium">{newTask?.title}</p>
                            <div className="flex gap-2 mt-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    newTask?.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                    newTask?.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-blue-500/20 text-blue-400'
                                }`}>{newTask?.priority}</span>
                                <span className="text-[10px] text-gray-500">→ {newTask?.assignedTo}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button 
                                onClick={() => {
                                    onAddTask?.(newTask);
                                    setMessages(prev => [...prev, {
                                        role: 'assistant',
                                        content: '✅ ¡Tarea creada exitosamente!',
                                        timestamp: new Date(),
                                    }]);
                                }}
                                className="flex-1 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
                            >
                                Confirmar
                            </button>
                            <button className="flex-1 py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </div>
                );

            case 'quick_stats':
                return (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="p-2 rounded-lg bg-white/5 text-center">
                            <p className="text-lg font-bold text-white">{pendingTaskCount}</p>
                            <p className="text-[10px] text-gray-500">Pendientes</p>
                        </div>
                        <div className="p-2 rounded-lg bg-white/5 text-center">
                            <p className="text-lg font-bold text-emerald-400">{tasks.filter(t => t.completed).length}</p>
                            <p className="text-[10px] text-gray-500">Completadas</p>
                        </div>
                        <div className="p-2 rounded-lg bg-white/5 text-center">
                            <p className="text-lg font-bold text-amber-400">{tasks.filter(t => t.priority === 'high' && !t.completed).length}</p>
                            <p className="text-[10px] text-gray-500">Urgentes</p>
                        </div>
                    </div>
                );

            case 'connect_notion':
                return (
                    <div className="mt-3 p-4 rounded-xl border border-dashed border-white/20 bg-white/[0.02] flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-3">
                            <Database size={20} className="text-white" />
                        </div>
                        <p className="text-xs text-white font-bold mb-1">Sin espacio en Notion</p>
                        <p className="text-[10px] text-gray-500 mb-4">Aún no has conectado un espacio de trabajo para esta organización.</p>
                        <button 
                            onClick={() => onNavigate?.('connections')}
                            className="w-full py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                        >
                            Conectar Notion <ExternalLink size={12} />
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            {/* FLOATING BUTTON - AUREON AVATAR */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 overflow-hidden border-2 border-white/20"
                    style={{ 
                        boxShadow: `0 8px 32px ${brand.colors.primary}40, 0 0 60px ${brand.colors.accent}20`
                    }}
                >
                    <img src="/aureon.webp" alt="Aureon" className="w-full h-full object-cover" />
                </button>
            )}

            {/* CHAT PANEL */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[360px] md:w-[420px] bg-[#0a0a0b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[70vh]">
                    {/* HEADER */}
                    <div 
                        className="p-4 flex items-center justify-between border-b border-white/5 shrink-0"
                        style={{ background: `linear-gradient(135deg, ${brand.colors.primary}10, ${brand.colors.accent}10)` }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0">
                                <img src="/aureon.webp" alt="Aureon" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Aureon</p>
                                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    {isLoading ? 'Pensando...' : 'Online'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* MESSAGES */}
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-[200px]">
                        {messages.map((msg, i) => (
                            <div 
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`max-w-[85%] ${
                                        msg.role === 'user' 
                                            ? 'bg-white/10 rounded-2xl rounded-br-md px-4 py-2.5' 
                                            : 'bg-transparent'
                                    }`}
                                >
                                    {msg.role === 'user' ? (
                                        <p className="text-sm text-white">{msg.content}</p>
                                    ) : (
                                        <div className="prose prose-sm prose-invert max-w-none">
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({children}) => <p className="text-sm text-gray-300 mb-2 last:mb-0">{children}</p>,
                                                    strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                                                    em: ({children}) => <em className="text-gray-400">{children}</em>,
                                                    code: ({children}) => <code className="text-xs bg-white/10 px-1 py-0.5 rounded text-cyan-300">{children}</code>,
                                                    ul: ({children}) => <ul className="text-sm text-gray-300 list-disc list-inside space-y-1 my-2">{children}</ul>,
                                                    li: ({children}) => <li>{children}</li>,
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                            {/* Render UI Actions */}
                                            {msg.actions?.map((action, j) => (
                                                <div key={j}>{renderAction(action)}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-xs">Aureon está escribiendo...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="px-3 pb-2 flex gap-2 overflow-x-auto shrink-0">
                        {['Mis tareas', 'Agregar tarea', 'Estado del día'].map((action, i) => (
                            <button
                                key={i}
                                onClick={() => setInputValue(action)}
                                className="px-3 py-1.5 text-xs rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap border border-white/5"
                            >
                                {action}
                            </button>
                        ))}
                    </div>

                    {/* INPUT */}
                    <div className="p-3 border-t border-white/5 shrink-0">
                        <div className="flex items-center gap-2">
                            <input 
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white placeholder-gray-500"
                                disabled={isLoading}
                            />
                            <button 
                                onClick={() => setIsVoiceActive(!isVoiceActive)}
                                className={`p-2.5 rounded-xl transition-all ${
                                    isVoiceActive 
                                        ? 'bg-red-500/20 text-red-400' 
                                        : 'bg-white/5 text-gray-500 hover:text-white'
                                }`}
                                title="Voz (próximamente)"
                            >
                                {isVoiceActive ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                            <button 
                                onClick={handleSend}
                                disabled={isLoading || !inputValue.trim()}
                                className="p-2.5 rounded-xl transition-all disabled:opacity-50"
                                style={{ backgroundColor: brand.colors.primary, color: '#000' }}
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FloatingChat;
