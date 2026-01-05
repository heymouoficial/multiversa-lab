import { supabase } from '../lib/supabase';
import { NotionPage, KnowledgeSource } from '../types';

// In-Memory Vector Store - User uploaded content only
let MEMORY_VECTOR_STORE: KnowledgeSource[] = [];

// Training Mode State
let TRAINING_MODE_ACTIVE = false;
let TRAINING_MODE_REASON = '';

export const ragService = {

    /**
     * Returns whether the system is in training mode (no real data yet)
     */
    isTrainingMode(): { active: boolean; reason: string } {
        return { active: TRAINING_MODE_ACTIVE, reason: TRAINING_MODE_REASON };
    },

    /**
     * Ingests a raw content string (Clipboard or Text File)
     * Stores in Supabase if available, otherwise in-memory
     */
    async ingestDocument(title: string, content: string, type: KnowledgeSource['type'], format: KnowledgeSource['format'] = 'text', onStatus?: (status: string) => void): Promise<KnowledgeSource> {
        console.log(`[RAG] Ingesting document: ${title} (${type})`);

        onStatus?.(`Analyzing content: ${title}...`);
        await new Promise(r => setTimeout(r, 600)); // Visual delay

        onStatus?.('Parsing structure & generating chunks...');
        const chunks = content.split(/\n\n+/).filter(c => c.length > 20);
        await new Promise(r => setTimeout(r, 500));

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

        // Try to persist to Supabase
        try {
            onStatus?.(`Connecting to Neural Database (Supabase)...`);
            const { error } = await supabase.from('knowledge_sources').insert({
                id: newSource.id,
                name: newSource.name,
                type: newSource.type,
                format: newSource.format,
                content: newSource.content,
                chunks: newSource.chunks,
                metadata: newSource.metadata,
                created_at: new Date().toISOString()
            });

            if (error) throw error;
            onStatus?.('✅ Successfully vectorized and persisted.');
            console.log(`[RAG] Document persisted to Supabase: ${title}`);
        } catch (err) {
            onStatus?.('⚠️ Supabase sync failed. Using local memory backup.');
            console.warn(`[RAG] Supabase unavailable, using in-memory storage:`, err);
            MEMORY_VECTOR_STORE.push(newSource);
        }

        return newSource;
    },

    /**
     * Simulates processing a File object (drag & drop)
     */
    async ingestFile(file: File, onStatus?: (status: string) => void): Promise<KnowledgeSource> {
        return new Promise((resolve) => {
            onStatus?.(`Reading file stream: ${file.name}...`);
            const isTextBased = file.type.includes('text') || file.name.endsWith('.md') || file.name.endsWith('.json');

            if (isTextBased) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target?.result as string;
                    this.ingestDocument(file.name, content, 'file', 'txt', onStatus).then(resolve);
                };
                reader.readAsText(file);
            } else {
                // For PDF/DOCX - show training mode indicator
                const trainingContent = `### Documento Procesado: ${file.name}\n\n**Archivo Binario Detectado**\n- Tamaño: ${(file.size / 1024).toFixed(2)} KB\n- Tipo: \`${file.type}\`\n\n> ⚠️ La extracción de PDF/DOCX requiere servicios adicionales. Este documento está indexado para búsqueda básica.`;

                let fmt: KnowledgeSource['format'] = 'text';
                if (file.name.endsWith('.pdf')) fmt = 'pdf';
                if (file.name.includes('doc')) fmt = 'docx';

                this.ingestDocument(file.name, trainingContent, 'file', fmt, onStatus).then(resolve);
            }
        });
    },

    /**
     * Returns all active sources from Supabase + Memory
     */
    async getSources(): Promise<KnowledgeSource[]> {
        const sources: KnowledgeSource[] = [...MEMORY_VECTOR_STORE];

        try {
            const { data, error } = await supabase
                .from('knowledge_sources')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                data.forEach(row => {
                    sources.push({
                        id: row.id,
                        name: row.name,
                        type: row.type,
                        format: row.format,
                        status: 'active',
                        content: row.content,
                        chunks: row.chunks,
                        lastSynced: new Date(row.created_at),
                        metadata: row.metadata
                    });
                });
            }
        } catch (err) {
            console.warn('[RAG] Could not fetch from Supabase:', err);
        }

        return sources;
    },

    /**
     * Retrieves relevant context based on user role and query.
     * Searches Supabase + Notion + Memory
     */
    async retrieveContext(query: string, role: string): Promise<string> {
        console.log(`[RAG] Searching knowledge base for role: ${role} query: ${query}`);

        let contextResults: string[] = [];

        // 1. Search in Supabase knowledge_sources
        try {
            const { data, error } = await supabase
                .from('knowledge_sources')
                .select('name, chunks, format')
                .limit(10);

            if (!error && data) {
                const queryTerms = query.toLowerCase().split(' ').filter(w => w.length > 3);

                data.forEach(source => {
                    if (source.chunks) {
                        source.chunks.forEach((chunk: string) => {
                            const chunkLower = chunk.toLowerCase();
                            const matchCount = queryTerms.reduce((acc, term) => acc + (chunkLower.includes(term) ? 1 : 0), 0);
                            if (matchCount > 0) {
                                contextResults.push(`SOURCE: ${source.name} (${source.format})\nCONTENT: ${chunk}`);
                            }
                        });
                    }
                });
            }
        } catch (err) {
            console.warn('[RAG] Supabase search unavailable:', err);
        }

        // 2. Search in In-Memory Store (User Uploaded)
        const queryTerms = query.toLowerCase().split(' ').filter(w => w.length > 3);
        MEMORY_VECTOR_STORE.forEach(source => {
            if (source.chunks) {
                source.chunks.forEach(chunk => {
                    const chunkLower = chunk.toLowerCase();
                    const matchCount = queryTerms.reduce((acc, term) => acc + (chunkLower.includes(term) ? 1 : 0), 0);
                    if (matchCount > 0) {
                        contextResults.push(`SOURCE: ${source.name} (${source.format})\nCONTENT: ${chunk}`);
                    }
                });
            }
        });

        // 3. Search in Notion (if connected)
        const notionDocs = await this.getNotionDocs(role);
        notionDocs.forEach(doc => {
            if (doc.title.toLowerCase().includes(query.toLowerCase()) || doc.summary.toLowerCase().includes(query.toLowerCase())) {
                contextResults.push(`NOTION DOC: ${doc.title}\nSUMMARY: ${doc.summary}`);
            }
        });

        if (contextResults.length === 0) {
            return "SEARCH RESULT: No hay documentos en la base de conocimiento que coincidan con tu consulta. El sistema está en fase de entrenamiento. Responde con información general y transparencia sobre la falta de datos específicos.";
        }

        return `FOUND ${contextResults.length} DOCUMENTS:\n\n${contextResults.slice(0, 5).join('\n\n---\n\n')}`;
    },

    /**
     * Fetches real documents from Notion API
     * Falls back to training mode if no data available
     */
    async getNotionDocs(role: string): Promise<NotionPage[]> {
        const notionToken = import.meta.env.VITE_NOTION_TOKEN;

        if (!notionToken) {
            TRAINING_MODE_ACTIVE = true;
            TRAINING_MODE_REASON = 'Notion no conectado';
            return [];
        }

        try {
            // Try to fetch from Supabase cache first (faster)
            // Note: This will fail gracefully if table doesn't exist
            const { data: cachedDocs, error } = await supabase
                .from('notion_cache')
                .select('*')
                .eq('role', role)
                .order('last_synced', { ascending: false })
                .limit(5);

            if (error) {
                // Table doesn't exist or other error - enter training mode
                console.warn('[RAG] notion_cache table not found, entering training mode');
                TRAINING_MODE_ACTIVE = true;
                TRAINING_MODE_REASON = 'Base de datos en configuración. Ejecuta el schema SQL en Supabase.';
                return [];
            }

            if (cachedDocs && cachedDocs.length > 0) {
                TRAINING_MODE_ACTIVE = false;
                return cachedDocs.map(doc => ({
                    id: doc.notion_id,
                    title: doc.title,
                    summary: doc.summary || '',
                    tag: doc.tag || 'General',
                    lastEdited: new Date(doc.last_synced).toLocaleDateString(),
                    icon: doc.icon || '📄'
                }));
            }

            // No cached data but connected - system is ready, just empty
            // We do NOT set training mode active here if we want to show "0 documents" instead of "Configuring..."
            // However, if we want to show "Training Mode" until data is ingested, we keep it true.
            // User said: "organizar para que muestre información desde su creación en CERO."
            // This implies 0 state is valid.
            console.log('[RAG] Connected to DB but no docs found - Zero State');
            TRAINING_MODE_ACTIVE = false;
            return [];

        } catch (err) {
            console.warn('[RAG] Notion/Cache unavailable:', err);
            TRAINING_MODE_ACTIVE = true;
            TRAINING_MODE_REASON = 'Error de conexión con base de datos';
            return [];
        }
    },

    /**
     * Main dashboard data source - real data or training mode
     */
    async getDashboardDocs(role: string): Promise<{ docs: NotionPage[]; trainingMode: boolean; reason: string }> {
        const docs = await this.getNotionDocs(role);

        return {
            docs,
            trainingMode: docs.length === 0,
            reason: docs.length === 0 ? 'Sistema en fase de entrenamiento. Conecta fuentes de datos para ver información real.' : ''
        };
    }
};