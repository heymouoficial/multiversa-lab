import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareText, Mic, Send, Bot, User, Sparkles, Command, TrendingUp, Zap, FileText, Search, ShieldCheck, BrainCircuit, Link2, Loader2, Activity, Square, Paperclip, ChevronDown, X } from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { openRouterService } from '../services/openRouterService';
import { MetricWidget, TaskWidget, AlertWidget, CitationWidget, WidgetData } from './ChatWidgets';

interface FlowViewProps {
  messages: ChatMessage[]; // Initial history
  user: UserProfile;
  onClose?: () => void;
}

type ProcessingState = 'idle' | 'thinking' | 'grounding' | 'streaming' | 'transcribing';

const STRATEGIC_TRIGGERS = [
    { icon: <TrendingUp size={12} />, text: "Analizar MRR y Proyecciones" },
    { icon: <Zap size={12} />, text: "Estrategia Go-To-Market Q3" },
    { icon: <FileText size={12} />, text: "Redactar Update Inversores" },
    { icon: <ShieldCheck size={12} />, text: "Auditoría de Seguridad" },
    { icon: <Search size={12} />, text: "Investigar Competencia Latam" },
    { icon: <Command size={12} />, text: "Optimizar Flujo de Ventas" },
    { icon: <Sparkles size={12} />, text: "Brainstorming Campaña Ads" },
    { icon: <Bot size={12} />, text: "Generar Script de Ventas" },
    { icon: <User size={12} />, text: "Revisar Carga Operativa" },
    { icon: <MessageSquareText size={12} />, text: "Resumir reunión de hoy" }
];

// --- Enhanced Markdown Renderer with GenUI Support ---
const ContentRenderer = ({ content, isThinking }: { content: string, isThinking?: boolean }) => {
    // RENDER: Loading State (Ghost Bubble)
    if (isThinking && !content) {
        return (
            <div className="flex flex-col gap-2 min-w-[200px]">
                <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
                    <BrainCircuit size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Aureon Procesando</span>
                </div>
                <div className="space-y-2 opacity-50">
                    <div className="h-2 bg-emerald-500/20 rounded-full w-3/4 animate-[pulse_1s_ease-in-out_infinite]"></div>
                    <div className="h-2 bg-emerald-500/20 rounded-full w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                </div>
            </div>
        );
    }

    if (!content) return null;

    // SPLIT CONTENT BY WIDGET BLOCKS
    // Regex matches ```json:widget ... ```
    const parts = content.split(/(```json:widget[\s\S]*?```)/g);

    return (
        <div className="space-y-2">
            {parts.map((part, index) => {
                if (part.startsWith('```json:widget')) {
                    try {
                        // Extract JSON content
                        const jsonString = part.replace(/^```json:widget\s*/, '').replace(/```$/, '');
                        const widgetData = JSON.parse(jsonString) as WidgetData;
                        
                        switch (widgetData.type) {
                            case 'metric': return <React.Fragment key={index}><MetricWidget data={widgetData.data} /></React.Fragment>;
                            case 'task': return <React.Fragment key={index}><TaskWidget data={widgetData.data} /></React.Fragment>;
                            case 'alert': return <React.Fragment key={index}><AlertWidget data={widgetData.data} /></React.Fragment>;
                            case 'citation': return <React.Fragment key={index}><CitationWidget data={widgetData.data} /></React.Fragment>;
                            default: return null;
                        }
                    } catch (e) {
                        console.error("Failed to parse widget JSON", e);
                        return <div key={index} className="text-xs text-red-500 hidden">Widget Error</div>;
                    }
                } else {
                    // Render Standard Markdown for text parts
                    return <React.Fragment key={index}><MarkdownText text={part} /></React.Fragment>;
                }
            })}
        </div>
    );
};

// Helper component for standard text rendering
const MarkdownText = ({ text }: { text: string }) => {
    if (!text.trim()) return null;
    
    const rawLines = text.split(/\r?\n/);
    const elements: React.ReactNode[] = [];
    
    let currentTableRows: string[][] = [];
    let inTable = false;
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    
    const formatRichText = (t: string): React.ReactNode => {
        const parts = t.split(/(\*\*.*?\*\*|`.*?`)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-white drop-shadow-sm">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return <span key={i} className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded text-emerald-300 border border-white/5 mx-0.5">{part.slice(1, -1)}</span>;
            }
            return part;
        });
    };

    const renderTable = (rows: string[][], key: string) => (
        <div key={key} className="my-5 overflow-x-auto rounded-xl border border-white/10 shadow-lg bg-[#0A0A0A]/50 backdrop-blur-sm animate-in fade-in duration-500">
            <table className="w-full border-collapse text-left text-xs">
                <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                        {rows[0]?.map((head, hIdx) => (
                            <th key={hIdx} className="p-3 font-semibold text-gray-200 uppercase tracking-wider">{formatRichText(head)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {rows.slice(1).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                            {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-3 text-gray-400 align-top leading-relaxed">{formatRichText(cell)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const trimmed = line.trim();
        
        // Code Blocks
        if (trimmed.startsWith('```') && !trimmed.startsWith('```json:widget')) {
            if (inCodeBlock) {
                inCodeBlock = false;
                elements.push(
                    <div key={`code-${i}`} className="my-4 p-4 rounded-xl bg-[#050505] border border-white/10 shadow-inner overflow-x-auto">
                        <pre className="font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap">{codeBlockContent.join('\n')}</pre>
                    </div>
                );
                codeBlockContent = [];
            } else {
                inCodeBlock = true;
            }
            continue;
        }
        if (inCodeBlock) {
            codeBlockContent.push(line);
            continue;
        }

        // Tables
        if (trimmed.startsWith('|')) {
            if (!inTable) { inTable = true; currentTableRows = []; }
            if (!trimmed.includes('---')) { 
                currentTableRows.push(trimmed.split('|').filter(c => c.trim().length > 0 || c === '').map(c => c.trim()));
            }
            const nextLine = i + 1 < rawLines.length ? rawLines[i + 1].trim() : '';
            if (!nextLine.startsWith('|')) {
                inTable = false;
                elements.push(renderTable(currentTableRows, `table-${i}`));
                currentTableRows = [];
            }
            continue;
        }

        // Headers
        if (trimmed.startsWith('### ')) {
            elements.push(<h3 key={`h3-${i}`} className="text-sm font-bold text-emerald-400 mt-6 mb-3 flex items-center gap-2">{formatRichText(trimmed.replace('### ', ''))}</h3>);
            continue;
        }
        
        // Blockquotes
        if (trimmed.startsWith('> ')) {
            elements.push(
                <div key={`quote-${i}`} className="my-4 pl-4 border-l-2 border-emerald-500 bg-emerald-500/5 py-3 pr-4 rounded-r-xl text-xs italic text-gray-300">
                    {formatRichText(trimmed.replace('> ', ''))}
                </div>
            );
            continue;
        }

        // Paragraphs
        if (trimmed.length > 0) {
            elements.push(<p key={`p-${i}`} className="text-sm text-gray-300 leading-7 mb-2">{formatRichText(trimmed)}</p>);
        }
    }

    return <>{elements}</>;
};

const FlowView: React.FC<FlowViewProps> = ({ messages: initialMessages, user, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length, messages[messages.length - 1]?.content]);

  // --- TRANSCRIPTION HELPERS ---
  const handleTranscriptionResult = (text: string) => {
      setInput((prev) => prev ? `${prev} ${text}` : text);
      setProcessingState('idle');
  };

  const processAudioBlob = async (blob: Blob) => {
      setProcessingState('transcribing');
      try {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
              const base64data = reader.result as string;
              // Extract base64 part
              const base64Content = base64data.split(',')[1];
              const mimeType = blob.type || 'audio/webm';
              
              const text = await openRouterService.transcribeAudio(base64Content, mimeType);
              handleTranscriptionResult(text);
          };
      } catch (e) {
          console.error("Transcription failed", e);
          setProcessingState('idle');
      }
  };

  // --- RECORDING HANDLERS ---
  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
              }
          };

          mediaRecorder.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              processAudioBlob(audioBlob);
              // Stop tracks
              stream.getTracks().forEach(track => track.stop());
          };

          mediaRecorder.start();
          setIsRecording(true);
      } catch (err) {
          console.error("Error accessing microphone:", err);
          alert("No se pudo acceder al micrófono.");
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  // --- FILE UPLOAD HANDLERS ---
  const handleFileClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          processAudioBlob(file);
      }
  };

  // --- SEND HANDLER ---
  const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();
    const textToSend = overrideText || input;

    if (!textToSend.trim() || processingState !== 'idle') return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: textToSend,
        timestamp: new Date()
    };
    
    // 2. Add "Ghost" Assistant Message IMMEDIATELY
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsgPlaceholder: ChatMessage = {
        id: aiMsgId,
        role: 'assistant',
        content: '', // Empty content triggers the loading Skeleton in ContentRenderer
        timestamp: new Date()
    };

    // Update State
    setMessages(prev => [...prev, userMsg, aiMsgPlaceholder]);
    setInput('');
    setProcessingState('thinking');

    try {
        // 3. Artificial "Life" Delay
        await new Promise(resolve => setTimeout(resolve, 600)); 
        setProcessingState('streaming');

        // 4. Call Service
        const userContext = `${user.name} (${user.role})`;
        
        await openRouterService.streamChat(
            [...messages, userMsg], // Pass updated history
            userContext, 
            (chunk) => {
                setMessages(prev => prev.map(m => 
                    m.id === aiMsgId ? { ...m, content: m.content + chunk } : m
                ));
            }
        );
    } catch (e) {
        console.error("FlowView Error:", e);
        setMessages(prev => prev.map(m => 
            m.id === aiMsgId ? { ...m, content: "⚠️ Error de conexión con Aureon Core." } : m
        ));
    } finally {
        setProcessingState('idle');
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] relative">
        
        {/* Chat Header - Improved for Fullscreen Overlay */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-[#020204] to-[#020204]/90 backdrop-blur-xl border-b border-white/5 relative z-30">
             <div className="flex items-center gap-3">
                <div className={`p-2 bg-gradient-to-br from-theme-primary/20 to-theme-secondary/20 rounded-xl text-theme-primary border border-white/10 shadow-glass ${processingState !== 'idle' ? 'animate-pulse' : ''}`}>
                    {processingState === 'idle' ? <Sparkles size={20} className="icon-duotone" /> : <Activity size={20} className="animate-spin" />}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        Polimata Flow 
                    </h2>
                    <p className="text-xs text-emerald-400 font-medium tracking-wide flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${processingState !== 'idle' ? 'animate-ping' : 'animate-pulse'}`}></span>
                        {processingState === 'idle' ? 'Aureon Core Online' : processingState === 'transcribing' ? 'Transcribiendo...' : 'Procesando...'}
                    </p>
                </div>
            </div>

            {/* Close Button - Explicit "Minimize" UI */}
            {onClose && (
                <button 
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95 group"
                >
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Minimizar</span>
                    <ChevronDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
                </button>
            )}
        </div>

        {/* Message List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-6 flex flex-col gap-6 py-4 pb-4">
            {messages.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 opacity-60">
                    <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mb-6 rotate-3 shadow-glass border border-white/5">
                        <Bot size={48} className="text-gray-400 icon-duotone" />
                    </div>
                    <p className="text-sm font-medium">Sistema en línea. Esperando comando.</p>
                 </div>
            )}

            {messages.map((msg, idx) => {
                const isLatestAssistant = idx === messages.length - 1 && msg.role === 'assistant';
                const isThinking = isLatestAssistant && processingState !== 'idle' && !msg.content;

                return (
                    <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300 group flex-shrink-0`}>
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10 ${
                            msg.role === 'user' 
                            ? 'bg-gray-800 text-gray-300' 
                            : 'bg-gradient-to-tr from-emerald-600 to-teal-700 text-white shadow-[0_0_15px_var(--primary-dim)]'
                        }`}>
                            {msg.role === 'user' ? <User size={18} /> : <Bot size={18} className={isThinking ? 'animate-pulse' : ''} />}
                        </div>

                        <div className={`max-w-[92%] p-5 rounded-[24px] shadow-sm relative overflow-visible ${
                            msg.role === 'user'
                            ? 'bg-white/10 text-white border border-white/10 rounded-tr-sm backdrop-blur-md'
                            : 'liquid-glass text-gray-100 rounded-tl-sm border-white/5 min-w-[240px]'
                        }`}>
                            <div className="relative z-10 overflow-x-hidden">
                                <ContentRenderer content={msg.content || msg.text || ''} isThinking={isThinking} />
                            </div>
                            
                            <span className="block text-[9px] text-gray-500 mt-3 text-right opacity-50 font-mono tracking-wider uppercase">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Input Section - Solid Background to cover any underlying elements */}
        <div className="z-20 flex flex-col gap-3 pb-6 pt-2 px-4 bg-[#020204] border-t border-white/5">
            
            <div className="w-full relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
                <div className="flex gap-2 overflow-x-auto no-scrollbar px-2 py-1">
                    {STRATEGIC_TRIGGERS.map((trigger, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleSend(undefined, trigger.text)}
                            disabled={processingState !== 'idle'}
                            className="liquid-glass px-4 py-1.5 rounded-full flex-shrink-0 flex items-center gap-2 whitespace-nowrap text-[10px] font-bold uppercase tracking-wide text-gray-400 hover:text-white hover:bg-white/10 hover:border-theme-primary/40 transition-all active:scale-95 group disabled:opacity-50"
                        >
                            <span className="text-theme-secondary group-hover:text-theme-primary transition-colors">{trigger.icon}</span>
                            {trigger.text}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative w-full max-w-2xl mx-auto">
                {/* Recording Overlay */}
                {isRecording && (
                    <div className="absolute inset-x-0 inset-y-0 z-30 bg-[#151515] rounded-[28px] border border-red-500/50 flex items-center justify-between px-4 animate-in fade-in duration-200 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                            <span className="text-sm font-bold text-white">Grabando audio...</span>
                            <div className="flex gap-1 h-3 items-center">
                                <div className="w-1 bg-red-500 h-2 animate-[bounce_1s_infinite]"></div>
                                <div className="w-1 bg-red-500 h-3 animate-[bounce_1.2s_infinite]"></div>
                                <div className="w-1 bg-red-500 h-1 animate-[bounce_0.8s_infinite]"></div>
                            </div>
                        </div>
                        <button 
                            onClick={stopRecording} 
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full border border-red-500/30 transition-colors"
                        >
                            <Square size={16} fill="currentColor" />
                        </button>
                    </div>
                )}

                <form onSubmit={(e) => handleSend(e)} className="relative group">
                    <div className="absolute inset-0 bg-theme-primary/20 rounded-[28px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    
                    <div className="liquid-glass rounded-[28px] flex items-center p-2 relative z-10 bg-[#050505] backdrop-blur-xl border-white/10 transition-colors focus-within:border-theme-primary/50 gap-2">
                        {/* Audio Tools Left */}
                        <div className="flex items-center gap-1 shrink-0">
                             <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="audio/*"
                                onChange={handleFileChange}
                             />
                             <button 
                                type="button"
                                onClick={handleFileClick}
                                disabled={processingState !== 'idle' || isRecording}
                                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-50"
                                title="Adjuntar Audio"
                             >
                                <Paperclip size={20} className="icon-duotone" />
                             </button>
                             
                             <button 
                                type="button"
                                onClick={startRecording}
                                disabled={processingState !== 'idle' || isRecording}
                                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all disabled:opacity-50 ${isRecording ? 'text-red-500 bg-red-500/10' : 'text-gray-500 hover:text-red-400 hover:bg-white/10'}`}
                                title="Grabar Voz"
                             >
                                <Mic size={20} className={isRecording ? 'animate-pulse' : 'icon-duotone'} />
                             </button>
                        </div>
                        
                        <div className="w-[1px] h-6 bg-white/10 shrink-0"></div>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={processingState !== 'idle' && processingState !== 'transcribing'}
                            placeholder={processingState === 'transcribing' ? "Transcribiendo..." : isRecording ? "" : "Escribe tu comando estratégico..."}
                            className="flex-1 bg-transparent border-none text-white placeholder:text-gray-500 focus:outline-none text-base py-3 disabled:text-gray-600 px-2 min-w-0"
                        />
                        
                        <button 
                            type="submit"
                            disabled={!input.trim() || processingState !== 'idle'}
                            className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-theme-primary to-theme-secondary flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            {(processingState !== 'idle' && processingState !== 'transcribing') ? <Loader2 size={20} className="animate-spin text-white" /> : <Send size={18} className="relative left-[1px]" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default FlowView;