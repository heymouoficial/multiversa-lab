import React, { useState, useEffect } from 'react';
import { 
    FileText, Upload, Search, Plus, CheckCircle2, Clock, Database, Eye, 
    X, ChevronRight, BookOpen, Sparkles, RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../lib/supabase';
import { getCurrentBrand } from '../config/branding';

interface KnowledgeDoc {
    id: number;
    source: string;
    content: string;
    tenant_id: string;
    meta: { type?: string; category?: string; priority?: number };
    created_at: string;
    updated_at: string;
}

const RAGView: React.FC = () => {
    const brand = getCurrentBrand();
    const [searchQuery, setSearchQuery] = useState('');
    const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<KnowledgeDoc | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch documents from Supabase
    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('agency_knowledge')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setDocuments(data || []);
        } catch (err) {
            console.error('[RAG] Error fetching docs:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchDocuments();
        setIsRefreshing(false);
    };

    const filteredDocs = documents.filter(d => 
        d.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryColor = (category?: string) => {
        switch (category) {
            case 'identity': return brand.colors.primary;
            case 'branding': return brand.colors.accent;
            case 'system': return brand.colors.success;
            default: return '#6B7280';
        }
    };

    const getCategoryIcon = (category?: string) => {
        switch (category) {
            case 'identity': return <Sparkles size={14} />;
            case 'branding': return <BookOpen size={14} />;
            case 'system': return <Database size={14} />;
            default: return <FileText size={14} />;
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Database size={24} style={{ color: brand.colors.primary }} />
                        Base de Conocimiento
                    </h1>
                    <p className="text-sm text-gray-500">Documentos vectorizados • Aureon los recuerda siempre</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="flex items-center justify-between">
                        <Database size={18} style={{ color: brand.colors.primary }} />
                        <span className="text-xl font-bold text-white">{documents.length}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Documentos</p>
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="flex items-center justify-between">
                        <CheckCircle2 size={18} style={{ color: brand.colors.success }} />
                        <span className="text-xl font-bold text-white">{documents.filter(d => d.meta?.category === 'identity').length}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Identidad</p>
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="flex items-center justify-between">
                        <Sparkles size={18} style={{ color: brand.colors.accent }} />
                        <span className="text-xl font-bold text-white">{documents.filter(d => d.meta?.category === 'system').length}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Sistemas</p>
                </div>
            </div>

            {/* SEARCH */}
            <div className="relative mb-4">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar en el conocimiento..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white placeholder-gray-500"
                />
            </div>

            {/* DOCUMENT LIST + PREVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LIST */}
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <RefreshCw size={24} className="mx-auto mb-3 text-gray-600 animate-spin" />
                            <p className="text-sm text-gray-500">Cargando documentos...</p>
                        </div>
                    ) : filteredDocs.length > 0 ? (
                        filteredDocs.map((doc) => (
                            <div 
                                key={doc.id} 
                                onClick={() => setSelectedDoc(doc)}
                                className={`flex items-center gap-4 p-4 cursor-pointer transition-all border-b border-white/5 last:border-0 ${
                                    selectedDoc?.id === doc.id 
                                        ? 'bg-white/[0.05]' 
                                        : 'hover:bg-white/[0.02]'
                                }`}
                            >
                                <div 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ 
                                        backgroundColor: `${getCategoryColor(doc.meta?.category)}20`, 
                                        color: getCategoryColor(doc.meta?.category) 
                                    }}
                                >
                                    {getCategoryIcon(doc.meta?.category)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{doc.source}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span 
                                            className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                                            style={{ 
                                                backgroundColor: `${getCategoryColor(doc.meta?.category)}20`,
                                                color: getCategoryColor(doc.meta?.category)
                                            }}
                                        >
                                            {doc.meta?.category || 'general'}
                                        </span>
                                        <span className="text-[9px] text-gray-600">
                                            {new Date(doc.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-600 shrink-0" />
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-600">
                            <Database size={40} className="mx-auto mb-4 opacity-30" />
                            <p className="text-sm font-medium mb-2">Sin documentos</p>
                            <p className="text-xs">La base de conocimiento está vacía</p>
                        </div>
                    )}
                </div>

                {/* PREVIEW - NOTION STYLE */}
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden">
                    {selectedDoc ? (
                        <div className="h-full flex flex-col">
                            {/* Preview Header */}
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Eye size={16} style={{ color: brand.colors.primary }} />
                                    <span className="text-sm font-medium text-white">{selectedDoc.source}</span>
                                </div>
                                <button 
                                    onClick={() => setSelectedDoc(null)}
                                    className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            {/* Preview Content - Notion Style */}
                            <div className="flex-1 p-6 overflow-y-auto max-h-[60vh]">
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({children}) => <h1 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">{children}</h1>,
                                            h2: ({children}) => <h2 className="text-lg font-bold text-white mt-6 mb-3">{children}</h2>,
                                            h3: ({children}) => <h3 className="text-base font-semibold text-white mt-4 mb-2">{children}</h3>,
                                            p: ({children}) => <p className="text-sm text-gray-300 mb-3 leading-relaxed">{children}</p>,
                                            strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                                            ul: ({children}) => <ul className="text-sm text-gray-300 list-disc list-inside space-y-1 my-3">{children}</ul>,
                                            ol: ({children}) => <ol className="text-sm text-gray-300 list-decimal list-inside space-y-1 my-3">{children}</ol>,
                                            li: ({children}) => <li className="mb-1">{children}</li>,
                                            code: ({children}) => <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-cyan-300 font-mono">{children}</code>,
                                            blockquote: ({children}) => <blockquote className="border-l-2 border-white/20 pl-4 my-4 text-gray-400 italic">{children}</blockquote>,
                                        }}
                                    >
                                        {selectedDoc.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center p-12 text-center">
                            <div>
                                <BookOpen size={48} className="mx-auto mb-4 text-gray-700" />
                                <p className="text-sm text-gray-500 mb-1">Selecciona un documento</p>
                                <p className="text-xs text-gray-600">Vista previa estilo Notion</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RAGView;
