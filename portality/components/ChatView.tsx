import React from 'react';
import { Send, Mic, Sparkles, Paperclip, MoreHorizontal } from 'lucide-react';

const ChatView: React.FC = () => {
    return (
        <div className="h-[calc(100vh-80px)] flex flex-col p-4 md:p-8 animate-in fade-in duration-700">
            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 px-2 md:px-0">
                <div className="flex justify-center mb-10">
                    <div className="px-4 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] animate-pulse">
                        Aureon Core Connected: Stability 99.9%
                    </div>
                </div>

                {/* ASSISTANT MESSAGE */}
                <div className="flex gap-4 max-w-3xl">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 border border-white/20 flex items-center justify-center text-white shadow-lg">
                        <Sparkles size={18} />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="liquid-glass p-5 rounded-3xl rounded-tl-none border border-white/5 bg-white/[0.03] text-sm leading-relaxed text-gray-200">
                            Hola Moisés, estoy lista para ayudarte a optimizar Elevat Marketing. He cargado el contexto del Knowledge Base y los últimos leads de Notion. ¿En qué trabajamos hoy?
                        </div>
                        <span className="text-[10px] text-gray-600 font-bold uppercase ml-1">Aureon • Ahora</span>
                    </div>
                </div>

                {/* USER MESSAGE */}
                <div className="flex gap-4 max-w-3xl ml-auto flex-row-reverse">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500 border border-white/20 flex items-center justify-center text-white shadow-lg font-black text-xs">
                        MV
                    </div>
                    <div className="flex-1 space-y-2 text-right">
                        <div className="p-5 rounded-3xl rounded-tr-none bg-indigo-500 text-white text-sm leading-relaxed shadow-xl shadow-indigo-500/20">
                            Resúmeme los leads de esta semana y dime cuáles necesitan atención inmediata.
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase mr-1">Tú • hace 1 min</span>
                    </div>
                </div>
            </div>

            {/* INPUT AREA */}
            <div className="mt-6 max-w-4xl mx-auto w-full relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-25 transition-opacity duration-500"></div>
                <div className="relative liquid-glass bg-[#020205] border border-white/10 rounded-[2.2rem] p-2 flex items-center gap-2">
                    <button className="p-4 text-gray-500 hover:text-indigo-400 transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <input 
                        type="text" 
                        placeholder="Pregúntale algo a Aureon..." 
                        className="flex-1 bg-transparent border-none text-white text-sm focus:ring-0 placeholder:text-gray-600 px-2"
                    />
                    <div className="flex gap-2 pr-2">
                        <button className="w-11 h-11 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all">
                            <Mic size={20} />
                        </button>
                        <button className="w-11 h-11 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all">
                            <Send size={20} className="ml-0.5" />
                        </button>
                    </div>
                </div>
                <div className="flex justify-center gap-4 mt-3">
                    {['Resumen Ejecutivo', 'Pendientes Notion', 'Status Servidores'].map((hint) => (
                        <button key={hint} className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-indigo-400 transition-colors">
                            {hint}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatView;
