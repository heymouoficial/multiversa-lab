import { supabase } from '../lib/supabase';
import { NotionPage, KnowledgeSource } from '../types';

// In-Memory Vector Store - User uploaded content only
let MEMORY_VECTOR_STORE: KnowledgeSource[] = [];

// Simple Embedding Cache to save API calls
const EMBEDDING_CACHE = new Map<string, number[]>();

// Training Mode State
let TRAINING_MODE_ACTIVE = false;
let TRAINING_MODE_REASON = '';

export const ragService = {

    /**
     * Returns whether the system is in training mode
     */
    isTrainingMode(): { active: boolean; reason: string } {
        return { active: TRAINING_MODE_ACTIVE, reason: TRAINING_MODE_REASON };
    },

    /**
     * Returns all available sources
     */
    async getSources(): Promise<KnowledgeSource[]> {
        return MEMORY_VECTOR_STORE;
    },

    /**
     * Ingests a raw content string
     */
    async ingestDocument(
        title: string, 
        content: string, 
        type: KnowledgeSource['type'], 
        organizationId: string | undefined,
        format: KnowledgeSource['format'] = 'text', 
        onStatus?: (status: string) => void
    ): Promise<KnowledgeSource> {
        console.log(`[RAG] Ingesting document: ${title} (${type}) for Org: ${organizationId}`);

        if (!organizationId) {
            onStatus?.('⚠️ Error: No Organization Selected.');
            throw new Error('Organization ID is required for vectorization.');
        }

        onStatus?.(`Analyzing content: ${title}...`);
        await new Promise(r => setTimeout(r, 300));

        const chunks = content.split(/\n\n+/).filter(c => c.length > 20);
        
        const newSource: KnowledgeSource = {
            id: Date.now().toString(),
            name: title,
            type: type,
            format: format,
            status: 'active',
            content: content,
            chunks: chunks,
            lastSynced: new Date(),
            metadata: { chunkCount: chunks.length }
        };

        try {
            onStatus?.(`Persisting Source...`);
            const { error: sourceError } = await supabase.from('knowledge_sources').insert({
                id: newSource.id,
                name: newSource.name,
                type: newSource.type,
                format: newSource.format,
                content: newSource.content,
                metadata: newSource.metadata,
                organization_id: organizationId,
                created_at: new Date().toISOString()
            });

            if (sourceError) throw sourceError;

            onStatus?.(`Vectorizing ${chunks.length} chunks...`);
            const { geminiService } = await import('./geminiService');
            
            // Vectorize in small batches to avoid rate limits
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                try {
                    const embedding = await geminiService.embedText(chunk);
                    await supabase.from('document_chunks').insert({
                        source_id: newSource.id,
                        organization_id: organizationId,
                        content: chunk,
                        embedding: embedding,
                        metadata: { source: title, index: i }
                    });
                } catch (embError) {
                    console.error('Embedding failed for chunk', i, embError);
                }
            }

            onStatus?.('✅ Vectorization complete.');
        } catch (err) {
            onStatus?.('⚠️ Supabase sync failed. Using local backup.');
            MEMORY_VECTOR_STORE.push(newSource);
        }

        return newSource;
    },

    async ingestFile(file: File, organizationId: string | undefined, onStatus?: (status: string) => void): Promise<KnowledgeSource> {
        console.log(`[RAG] Processing file: ${file.name} (${file.type})`);
        onStatus?.(`Reading file: ${file.name}...`);

        return new Promise(async (resolve, reject) => {
            try {
                const extension = file.name.split('.').pop()?.toLowerCase();
                const arrayBuffer = await file.arrayBuffer();

                let content = '';
                let format: KnowledgeSource['format'] = 'text';

                if (extension === 'pdf' || file.type === 'application/pdf') {
                    onStatus?.(`Extracting text from PDF binary...`);
                    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
                    // Use a CDN for the worker to avoid Vite build complexity for now
                    GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;
                    
                    const loadingTask = getDocument({ data: arrayBuffer });
                    const pdf = await loadingTask.promise;
                    let fullText = '';
                    
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map((item: any) => item.str).join(' ');
                        fullText += pageText + '\n\n';
                        onStatus?.(`Processing PDF: page ${i}/${pdf.numPages}...`);
                    }
                    content = fullText;
                    format = 'text';
                } 
                else if (extension === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    onStatus?.(`Extracting text from DOCX binary...`);
                    const mammoth = await import('mammoth');
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    content = result.value;
                    format = 'text';
                }
                else if (file.type.includes('text') || extension === 'md' || extension === 'json' || extension === 'txt') {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const text = e.target?.result as string;
                        this.ingestDocument(file.name, text, 'file', organizationId, 'text', onStatus).then(resolve);
                    };
                    reader.readAsText(file);
                    return; // Early return as FileReader is async
                } 
                else {
                    onStatus?.(`⚠️ Unsupported format: ${extension}. Indexing as metadata only.`);
                    content = `### File: ${file.name}\nFormat: ${extension}\nUnsupported binary content. High-level indexing only.`;
                    format = 'text';
                }

                if (content) {
                    const source = await this.ingestDocument(file.name, content, 'file', organizationId, format, onStatus);
                    resolve(source);
                } else {
                    reject(new Error('Failed to extract content from file.'));
                }
            } catch (error) {
                console.error('[RAG] File ingestion error:', error);
                onStatus?.(`❌ Error indexing ${file.name}`);
                reject(error);
            }
        });
    },

    /**
     * Retrieves relevant context using optimized parallel search.
     */
    async retrieveContext(query: string, role: string, organizationId?: string): Promise<string> {
        console.log(`🚀 [RAG] Optimizing retrieval for query: "${query}"`);
        const startTime = Date.now();

        try {
            // 1. Parallelize all search sources
            const [vectorResults, keywordResults, notionDocs, flowiseResult] = await Promise.all([
                this.performVectorSearch(query, organizationId),
                this.performKeywordSearch(query),
                this.getNotionDocs(role),
                this.queryFlowise(query, organizationId)
            ]);

            const contextResults: string[] = [...vectorResults];

            // 2. Add Flowise if available
            if (flowiseResult) {
                contextResults.push(`[FLOWISE INTEL]: ${flowiseResult}`);
            }

            // 3. Supplement with keyword matches if vector is sparse
            if (contextResults.length < 3) {
                contextResults.push(...keywordResults.slice(0, 3));
            }

            // 4. Add relevant Notion context
            notionDocs.forEach(doc => {
                if (doc.title.toLowerCase().includes(query.toLowerCase()) || doc.summary.toLowerCase().includes(query.toLowerCase())) {
                    contextResults.push(`[NOTION]: ${doc.title} - ${doc.summary}`);
                }
            });

            const duration = Date.now() - startTime;
            console.log(`✅ [RAG] Context retrieved in ${duration}ms (${contextResults.length} matches)`);

            if (contextResults.length === 0) {
                return "SEARCH RESULT: No specific context found. System in training mode.";
            }

            return `CONTEXT DATA (${contextResults.length} matches):\n\n${contextResults.slice(0, 5).join('\n\n---\n\n')}`;

        } catch (err) {
            console.error('[RAG] Retrieval failed:', err);
            return "SEARCH RESULT: Technical error during context retrieval.";
        }
    },

    /**
     * Semantic Search via Supabase Vector
     */
    async performVectorSearch(query: string, organizationId?: string): Promise<string[]> {
        if (!organizationId) return [];

        try {
            let embedding = EMBEDDING_CACHE.get(query);
            if (!embedding) {
                const { geminiService } = await import('./geminiService');
                embedding = await geminiService.embedText(query);
                EMBEDDING_CACHE.set(query, embedding);
            }

            const { data, error } = await supabase.rpc('match_documents', {
                query_embedding: embedding,
                match_threshold: 0.5,
                match_count: 5,
                filter_organization_id: organizationId
            });

            if (error) throw error;
            return (data || []).map((res: any) => `SOURCE: ${res.metadata?.source || 'Neural DB'} (Vector)\nCONTENT: ${res.content}`);
        } catch (err) {
            console.warn('[RAG] Vector search failed:', err);
            return [];
        }
    },

    /**
     * Keyword Search via Supabase + Memory
     */
    async performKeywordSearch(query: string): Promise<string[]> {
        const results: string[] = [];
        const terms = query.toLowerCase().split(' ').filter(t => t.length > 3);
        if (terms.length === 0) return [];

        try {
            const { data } = await supabase.from('knowledge_sources').select('name, content').limit(10);
            if (data) {
                data.forEach(s => {
                    if (terms.some(t => s.content?.toLowerCase().includes(t))) {
                        results.push(`SOURCE: ${s.name} (Keyword)\nCONTENT: ${s.content.substring(0, 500)}...`);
                    }
                });
            }
        } catch {} // Ignore errors for this fallback

        return results;
    },

    /**
     * Flowise Integration Placeholder
     */
    async queryFlowise(query: string, organizationId?: string): Promise<string | null> {
        const flowiseUrl = import.meta.env.VITE_FLOWISE_API_URL || 'https://rag.elevatmarketing.com/api/v1/prediction/YOUR-ID';
        // In Alpha, we might just log or do a dry-run fetch
        // For now, returning null until specific API ID is provided in .env
        return null; 
    },

    /**
     * Notion Cache Retrieval
     */
    async getNotionDocs(role: string): Promise<NotionPage[]> {
        const token = import.meta.env.VITE_NOTION_TOKEN;
        if (!token) return [];

        try {
            const { data } = await supabase.from('notion_cache').select('*').eq('role', role).limit(5);
            return (data || []).map(doc => ({
                id: doc.notion_id,
                title: doc.title,
                summary: doc.summary || '',
                tag: doc.tag || 'General',
                lastEdited: new Date(doc.last_synced).toLocaleDateString(),
                icon: doc.icon || '📄'
            }));
        } catch { // Ignore errors for this fallback
            return [];
        }
    }
};
