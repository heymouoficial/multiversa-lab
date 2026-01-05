import React, { useState, useEffect, useRef } from 'react';
import { Database, FileText, Upload, RefreshCw, Server, Plus, Check, FileCode, Search, Clipboard, FileType, Zap, ChevronRight } from 'lucide-react';
import { ragService } from '../services/ragService';
import { KnowledgeSource } from '../types';

const KnowledgeBaseView: React.FC = () => {
    const [sources, setSources] = useState<KnowledgeSource[]>([]);
    const [activeTab, setActiveTab] = useState<'files' | 'clipboard' | 'databases'>('files');

    const [clipboardContent, setClipboardContent] = useState('');
    const [clipboardTitle, setClipboardTitle] = useState('');

    const [isUploading, setIsUploading] = useState(false);
    const [statusLog, setStatusLog] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadSources();
    }, []);

    const loadSources = async () => {
        const data = await ragService.getSources();
        setSources(data);
    };

    const handleClipboardIngest = async () => {
        if (!clipboardContent || !clipboardTitle) return;
        setIsUploading(true);

        setTimeout(async () => {
            await ragService.ingestDocument(clipboardTitle, clipboardContent, 'clipboard', 'text', (status) => setStatusLog(status));
            setClipboardTitle('');
            setClipboardContent('');
            setIsUploading(false);
            setStatusLog('');
            loadSources();
        }, 500);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            const file = e.target.files[0];
            setStatusLog('Initializing upload stream...');
            await ragService.ingestFile(file, (status) => setStatusLog(status));
            setIsUploading(false);
            setStatusLog('');
            loadSources();
        }
    };

    const getIconForSource = (source: KnowledgeSource) => {
        if (source.type === 'clipboard') return <Clipboard size={16} className="text-amber-400 icon-duotone" />;
        if (source.format === 'pdf') return <FileType size={16} className="text-red-400 icon-duotone" />;
        if (source.format === 'docx') return <FileText size={16} className="text-blue-400 icon-duotone" />;
        return <FileCode size={16} className="text-emerald-400 icon-duotone" />;
    };

    return (
        <div className="flex flex-col w-full min-h-screen px-6 pb-40">

            {/* Header */}
            <div className="flex flex-col gap-1 mb-6 pt-2 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#0A0A0A] rounded-xl text-emerald-500 border border-emerald-500/20 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <Database size={24} className="icon-duotone" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Neural Knowledge Base</h2>
                        <p className="text-xs text-emerald-500 font-medium tracking-wide uppercase">RAG Engine • Vercel AI Core</p>
                    </div>
                </div>
            </div>

            {/* Sticky Tabs */}
            <div className="sticky top-[-1px] z-30 bg-[#020204]/95 backdrop-blur-xl border-b border-white/10 mb-6 -mx-6 px-6 pt-2">
                <div className="flex gap-4 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap group ${activeTab === 'files' ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <span className="flex items-center gap-2"><Upload size={16} className="icon-duotone group-hover:scale-110 transition-transform" /> Subir Archivos</span>
                        {activeTab === 'files' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_10px_var(--primary)]"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('clipboard')}
                        className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap group ${activeTab === 'clipboard' ? 'text-amber-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <span className="flex items-center gap-2"><Clipboard size={16} className="icon-duotone group-hover:scale-110 transition-transform" /> Portapapeles Virtual</span>
                        {activeTab === 'clipboard' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 shadow-[0_0_10px_orange]"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('databases')}
                        className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap group ${activeTab === 'databases' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <span className="flex items-center gap-2"><Server size={16} className="icon-duotone group-hover:scale-110 transition-transform" /> Conectores</span>
                        {activeTab === 'databases' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_10px_cyan]"></div>}
                    </button>
                </div>
            </div>

            <div className="w-full">

                {/* VIRTUAL CLIPBOARD TAB */}
                {activeTab === 'clipboard' && (
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="p-1 rounded-[24px] bg-gradient-to-br from-amber-500/20 via-white/5 to-transparent">
                            <div className="p-6 rounded-[22px] bg-[#050505] border border-white/10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] pointer-events-none"></div>

                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold uppercase text-gray-300 flex items-center gap-2">
                                        <Zap size={16} className="text-amber-400 fill-amber-400" />
                                        Vectorización Instantánea
                                    </h3>
                                    <span className="text-[10px] text-gray-500 border border-white/10 px-2 py-1 rounded-full uppercase tracking-wider">AI Parsing Active</span>
                                </div>

                                <div className="flex flex-col gap-4 relative z-10">
                                    <input
                                        type="text"
                                        placeholder="Título del contexto (ej: Notas Reunión Cliente X)"
                                        value={clipboardTitle}
                                        onChange={(e) => setClipboardTitle(e.target.value)}
                                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500/50 focus:bg-[#1A1A1A] transition-all text-white placeholder:text-gray-600 font-medium"
                                    />
                                    <textarea
                                        placeholder="Pega aquí emails, JSON, CSV, notas rápidas o fragmentos de código. Aureon los indexará automáticamente..."
                                        value={clipboardContent}
                                        onChange={(e) => setClipboardContent(e.target.value)}
                                        className="w-full h-48 bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500/50 focus:bg-[#1A1A1A] transition-all font-mono resize-none text-gray-300 leading-relaxed custom-scrollbar placeholder:text-gray-600"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleClipboardIngest}
                                            disabled={isUploading || !clipboardTitle || !clipboardContent}
                                            className="px-6 py-3 bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale shadow-lg shadow-black/40 active:scale-[0.98]"
                                        >
                                            {isUploading ? <RefreshCw size={18} className="animate-spin" /> : <><Plus size={18} /> Ingestar Datos</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FILES TAB */}
                {activeTab === 'files' && (
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">

                        {/* Dropzone Area */}
                        {/* Dropzone Area or Log Terminal */}
                        {isUploading ? (
                            <div className="p-10 rounded-[28px] bg-[#0A0A0A] border border-emerald-500/20 relative overflow-hidden flex flex-col items-center justify-center min-h-[240px]">
                                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none"></div>
                                <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">Procesando Conocimiento</h3>
                                <div className="w-full max-w-md bg-[#121212] rounded-lg border border-white/10 p-3 font-mono text-xs text-emerald-400/80 shadow-inner">
                                    <span className="mr-2 text-gray-500">user@aureon:~$</span>
                                    <span className="typing-effect">{statusLog}</span>
                                    <span className="animate-blink ml-1">_</span>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="group cursor-pointer p-10 rounded-[28px] bg-[#0A0A0A] border-2 border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all relative overflow-hidden shadow-inner"
                            >
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none"></div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.txt,.md,.json"
                                />

                                <div className="flex flex-col items-center justify-center gap-4 relative z-10 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-[#121212] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                                        <Upload size={28} className="text-gray-400 group-hover:text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">Importar Documentos</h3>
                                        <p className="text-xs text-gray-500">Arrastra o haz click para vectorizar.</p>
                                        <div className="flex gap-2 justify-center mt-3 opacity-60">
                                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-gray-400">PDF</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-gray-400">DOCX</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-gray-400">MD</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Source List */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between pl-2 pr-2">
                                <h3 className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                                    <Database size={12} className="icon-duotone" /> Base de Conocimiento Activa
                                </h3>
                                <span className="text-[10px] text-gray-600">{sources.length} vectores</span>
                            </div>

                            {sources.length === 0 ? (
                                <div className="p-8 rounded-[20px] bg-white/5 border border-dashed border-white/5 flex flex-col items-center justify-center text-gray-500">
                                    <span className="text-xs italic">La base de conocimiento está vacía.</span>
                                </div>
                            ) : (
                                sources.map((source, index) => (
                                    <div key={source.id} className="group p-4 rounded-xl bg-[#0A0A0A] border border-white/5 flex justify-between items-center hover:border-emerald-500/30 hover:bg-white/[0.02] transition-all cursor-default animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#121212] flex items-center justify-center border border-white/5 group-hover:border-emerald-500/20 transition-colors">
                                                {getIconForSource(source)}
                                            </div>
                                            <div className="flex flex-col">
                                                <h4 className="text-sm font-bold text-gray-200 truncate max-w-[180px] group-hover:text-emerald-400 transition-colors">{source.name}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] font-bold text-gray-500 uppercase bg-white/5 px-1.5 rounded">{source.format || source.type}</span>
                                                    <span className="text-[9px] text-gray-600">• {source.chunks?.length || 0} chunks</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-gray-600 hover:text-white">
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* DATABASES TAB */}
                {activeTab === 'databases' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 rounded-[2rem] bg-[#0A0A0A] flex items-center justify-center mb-6 shadow-2xl border border-white/5 rotate-12">
                            <Server size={40} className="text-blue-500/50 icon-duotone" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Conectores Enterprise</h3>
                        <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                            Conecta PostgreSQL (Supabase), MySQL o MongoDB directamente a PolimataOS para consultas RAG sobre datos estructurados en tiempo real.
                        </p>

                        <div className="mt-8 flex gap-3">
                            <button className="px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-2 cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                Supabase
                            </button>
                            <button className="px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-2 cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                Notion
                            </button>
                            <button className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:border-white/30 transition-all opacity-50 cursor-not-allowed">
                                Stripe
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default KnowledgeBaseView;