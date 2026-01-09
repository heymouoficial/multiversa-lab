import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles, Paperclip, MoreHorizontal, Loader2, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { geminiService, type AureonMessage, type UIAction, type AureonContext } from '../services/geminiService';
import { MetricWidget, TaskWidget, AlertWidget, CitationWidget } from './ChatWidgets';
import { getCurrentBrand } from '../config/branding';
import { ragService } from '../services/ragService';

interface ChatViewProps {
    user?: {
        name: string;
        avatar?: string;
    };
    organization?: {
        id: string;
        name: string;
    };
}

const ChatView: React.FC<ChatViewProps> = ({ user, organization }) => {
    const brand = getCurrentBrand(organization?.id);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<AureonMessage[]>([
        {
            role: 'assistant',
            content: brand.defaultAssistantMessage.replace('Arquitecto', user?.name || 'Moisés'),
            timestamp: new Date()
        }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isThinking) return;

        const userMsg = input;
        setInput('');
        
        // Add User Message
        setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
        setIsThinking(true);

        try {
            // Retrieve RAG Context if available
            let ragContext = '';
            try {
                ragContext = await ragService.retrieveContext(userMsg, 'admin', organization?.id);
            } catch (ragError) {
                console.warn('RAG Context retrieval failed:', ragError);
            }

            const response = await geminiService.chat(userMsg, {
                currentOrgName: organization?.name || 'Elevat Marketing',
                userName: user?.name || 'Moisés',
                organizationId: organization?.id,
                ragContext: ragContext || `
                    MODE: FULL DASHBOARD AGENT.
                    GOAL: Assist user with daily operations, summaries, and complex queries.
                    CONTEXT: User is authenticated in Portality.
                `
            });
            setMessages(prev => [...prev, response]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: '⚠️ Lo siento, he perdido la conexión con el servidor Alpha. Por favor intenta más tarde.', 
                timestamp: new Date() 
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-8 animate-in fade-in duration-700">
            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 px-2 md:px-0 pb-10">
                <div className="flex justify-center mb-10">
                    <div className="px-4 py-2 bg-indigo-500/5 border border-white/10 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                        {brand.name} Intelligence Core: Stability 100%
                    </div>
                </div>

                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-2xl border border-white/20 flex items-center justify-center text-white shadow-lg shrink-0 overflow-hidden ${
                            msg.role === 'assistant' 
                                ? 'bg-emerald-500' 
                                : 'bg-indigo-500 font-black text-xs'
                        }`}>
                            {msg.role === 'assistant' ? (
                                <img src="/aureon.webp" alt="Aureon" className="w-full h-full object-cover" />
                            ) : (user?.avatar || <User size={18} />)}
                        </div>
                        <div className={`flex-1 space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                            <div className={`p-5 rounded-3xl border border-white/5 text-sm leading-relaxed ${
                                msg.role === 'assistant' 
                                    ? 'liquid-glass bg-white/[0.03] text-gray-200 rounded-tl-none prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10' 
                                    : 'bg-indigo-500 text-white rounded-tr-none shadow-xl shadow-indigo-500/20'
                            }`}>
                                {msg.role === 'assistant' ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                ) : msg.content}

                                {/* AGENT2GEN WIDGETS */}
                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-2">
                                        {msg.actions.map((action, actionIdx) => {
                                            if (!action.data) return null;
                                            
                                            switch (action.type) {
                                                case 'quick_stats':
                                                    // Handle single metric or array of metrics
                                                    if (Array.isArray(action.data)) {
                                                        return action.data.map((m, i) => <MetricWidget key={i} data={m} />);
                                                    }
                                                    return <MetricWidget key={actionIdx} data={action.data} />;
                                                
                                                case 'task_list':
                                                    if (Array.isArray(action.data)) {
                                                        return (
                                                            <div key={actionIdx} className="w-full space-y-1">
                                                                {action.data.map((t, i) => <TaskWidget key={i} data={t} />)}
                                                            </div>
                                                        );
                                                    }
                                                    return <TaskWidget key={actionIdx} data={action.data} />;

                                                case 'client_summary':
                                                    // Usually a detailed object, can use AlertWidget for now or specific summary
                                                    return <AlertWidget key={actionIdx} data={{ type: 'info', title: 'Resumen de Cliente', message: action.data.summary || 'Información procesada.' }} />;

                                                default:
                                                    return null;
                                            }
                                        })}
                                    </div>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold uppercase ${msg.role === 'assistant' ? 'text-gray-600 ml-1' : 'text-gray-500 mr-1'}`}>
                                {msg.role === 'assistant' ? 'Aureon' : 'Tú'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div className="flex gap-4 max-w-3xl animate-in fade-in duration-300">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-400/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse">
                            <Sparkles size={18} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="liquid-glass p-5 rounded-3xl rounded-tl-none border border-white/5 bg-white/[0.01] flex items-center gap-1.5 h-14">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-bounce"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-bounce delay-150"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-bounce delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <form onSubmit={handleSend} className="mt-auto mb-10 md:mb-4 max-w-4xl mx-auto w-full relative group px-2">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-25 transition-opacity duration-500"></div>
                <div className="relative liquid-glass bg-[#020205] border border-white/10 rounded-[2.2rem] p-2 flex items-center gap-2">
                    <button type="button" className="p-4 text-gray-500 hover:text-indigo-400 transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pregúntale algo a Aureon..." 
                        className="flex-1 bg-transparent border-none text-white text-sm focus:ring-0 placeholder:text-gray-600 px-2"
                        disabled={isThinking}
                    />
                    <div className="flex gap-2 pr-1.5">
                        <button 
                            type="submit"
                            disabled={!input.trim() || isThinking}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                                !input.trim() || isThinking 
                                    ? 'bg-gray-800 text-gray-500 opacity-50 cursor-not-allowed' 
                                    : 'bg-indigo-600 shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-105 active:scale-95'
                            }`}
                        >
                            {isThinking ? <Loader2 size={20} className="animate-spin" /> : <Send size={22} className="ml-0.5" />}
                        </button>
                    </div>
                </div>
                <div className="flex justify-center gap-4 mt-3">
                    {['Resumen Ejecutivo', 'Pendientes Notion', 'Status Servidores'].map((hint) => (
                        <button 
                            key={hint} 
                            type="button"
                            onClick={() => setInput(hint)}
                            className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-indigo-400 transition-colors"
                        >
                            {hint}
                        </button>
                    ))}
                </div>
            </form>
        </div>
    );
};

export default ChatView;
