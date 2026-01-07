import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { type AureonMessage } from '../services/geminiService';

interface HeroChatProps {
  messages: AureonMessage[];
  input: string;
  setInput: (value: string) => void;
  isThinking: boolean;
  onSend: (e?: React.FormEvent) => void;
  isFloating?: boolean;
}

const HeroChat: React.FC<HeroChatProps> = ({ messages, input, setInput, isThinking, onSend, isFloating = false }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // If floating, start minimized by default, otherwise expanded
    const [isExpanded, setIsExpanded] = React.useState(!isFloating);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Auto-expand if new assistant message arrives and it's floating
        const lastMsg = messages[messages.length - 1];
        if (isFloating && lastMsg?.role === 'assistant' && !isExpanded) {
           // Optional: uncomment to auto-open on response
           // setIsExpanded(true); 
        }
        if (isExpanded) scrollToBottom();
    }, [messages, isExpanded]);

    // MINIMIZED STATE (Floating Avatar)
    if (!isExpanded) {
        return (
            <button 
                onClick={() => setIsExpanded(true)}
                className="group relative flex items-center gap-3 p-2 pr-6 rounded-full bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:bg-black/80 hover:scale-105 transition-all cursor-pointer ml-auto"
            >
                 <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center ring-2 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] overflow-hidden relative">
                    <img src="/aureon.webp" alt="Aureon" className="w-full h-full object-cover" />
                    {isThinking && (
                        <div className="absolute inset-0 bg-emerald-500/20 animate-pulse"></div>
                    )}
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-xs font-black text-white uppercase tracking-widest">Aureon</span>
                    <span className="text-[9px] font-bold text-emerald-400 animate-pulse">Online</span>
                </div>
                
                {/* Notification Badge if unread? Simplified for now */}
            </button>
        );
    }

    // EXPANDED STATE
    return (
        <div className={`p-6 md:p-8 rounded-[48px] bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col w-full mx-auto group ring-1 ring-white/5 hover:ring-white/10 transition-all ${
            isFloating ? 'h-[400px] rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-in slide-in-from-bottom-10 fade-in duration-300' : 'h-[500px] max-w-md'
        }`}>
            {/* Header */}
            <div className={`flex items-center justify-between border-b border-white/5 ${isFloating ? 'mb-3 pb-3' : 'mb-6 pb-4'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center ring-2 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] overflow-hidden">
                        <img src="/aureon.webp" alt="Aureon" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="text-xs font-black text-white tracking-widest uppercase">AUREON <span className="text-emerald-500">CORE</span></div>
                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Public Access v2.0</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                     <div className="px-2 py-1 rounded bg-white/5 border border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                    </div>
                    {/* Close/Minimize Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                    >
                        <div className="w-4 h-0.5 bg-current rounded-full"></div>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 no-scrollbar">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                             msg.role === 'assistant' ? 'bg-black/50 border border-emerald-500/20' : 'bg-white/10 text-white border border-white/10'
                         }`}>
                             {msg.role === 'assistant' ? <img src="/aureon.webp" alt="Aureon" className="w-full h-full object-cover opacity-80" /> : <span className="text-[10px] font-black">TÚ</span>}
                         </div>
                         <div className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed max-w-[80%] ${
                             msg.role === 'assistant' 
                                ? 'bg-white/[0.03] border border-white/5 text-gray-300 rounded-tl-none' 
                                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-100 rounded-tr-none'
                         }`}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                         </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center shrink-0 border border-emerald-500/20 overflow-hidden">
                             <img src="/aureon.webp" alt="Thinking" className="w-full h-full object-cover opacity-60 animate-pulse" />
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 rounded-tl-none flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce"></span>
                            <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce delay-100"></span>
                            <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={onSend} className="relative group/input">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder="Pregúntale a Aureon..." 
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3.5 pl-4 pr-12 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/40 focus:bg-white/[0.02] transition-all font-mono shadow-inner"
                    disabled={isThinking}
                />
                <button 
                    type="submit" 
                    disabled={!input.trim() || isThinking}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={14} />
                </button>
            </form>
        </div>
    );
};

export default HeroChat;
