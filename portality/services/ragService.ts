import { supabase } from '../lib/supabase';
import { NotionPage, KnowledgeSource } from '../types';

// In-Memory Vector Store Simulation for Client Side
let MEMORY_VECTOR_STORE: KnowledgeSource[] = [];

export const ragService = {
  
  /**
   * Ingests a raw content string (Clipboard or Text File)
   */
  async ingestDocument(title: string, content: string, type: KnowledgeSource['type'], format: KnowledgeSource['format'] = 'text'): Promise<KnowledgeSource> {
    console.log(`[RAG] Ingesting document: ${title} (${type})`);
    
    // 1. Simple Chunking Strategy
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

    MEMORY_VECTOR_STORE.push(newSource);
    return newSource;
  },

  /**
   * Simulates processing a File object (drag & drop)
   */
  async ingestFile(file: File): Promise<KnowledgeSource> {
      return new Promise((resolve) => {
          const isTextBased = file.type.includes('text') || file.name.endsWith('.md') || file.name.endsWith('.json');
          
          if (isTextBased) {
              const reader = new FileReader();
              reader.onload = (e) => {
                  const content = e.target?.result as string;
                  this.ingestDocument(file.name, content, 'file', 'txt').then(resolve);
              };
              reader.readAsText(file);
          } else {
              // Simulate PDF/Doc Extraction
              setTimeout(() => {
                  const mockContent = `### Metadata Extracted from ${file.name}\n\n**File Details**\n- Size: ${(file.size / 1024).toFixed(2)} KB\n- Type: \`${file.type}\`\n- Last Modified: ${new Date(file.lastModified).toLocaleDateString()}\n\n---\n\n### Content Preview\n\n> This is a simulated extraction of binary content. In a production environment, this text would be parsed from the actual PDF or DOCX file using OCR or text extraction libraries.\n\n**Key Points Detected:**\n- Document structure analyzed.\n- Metadata indexed successfully.\n- Vector embeddings generated for ${Math.floor(file.size / 500)} chunks.`;
                  
                  let fmt: KnowledgeSource['format'] = 'text';
                  if(file.name.endsWith('.pdf')) fmt = 'pdf';
                  if(file.name.includes('doc')) fmt = 'docx';

                  this.ingestDocument(file.name, mockContent, 'file', fmt).then(resolve);
              }, 800);
          }
      });
  },

  /**
   * Returns all active sources
   */
  getSources(): KnowledgeSource[] {
    return MEMORY_VECTOR_STORE;
  },

  /**
   * Retrieves relevant context based on user role and query.
   * Uses Keyword Matching + Semantic Simulation on the client.
   */
  async retrieveContext(query: string, role: string): Promise<string> {
    console.log(`[RAG] Searching knowledge base for role: ${role} query: ${query}`);
    
    let contextResults: string[] = [];

    // 1. Search in In-Memory Store (User Uploaded MDs/Files/Clipboard)
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

    // 2. Search in Mock/Supabase Static Data (System Data)
    const systemDocs = await this.getSystemDocs(role);
    systemDocs.forEach(doc => {
         if (doc.title.toLowerCase().includes(query.toLowerCase()) || doc.summary.toLowerCase().includes(query.toLowerCase())) {
             contextResults.push(`SYSTEM DOC: ${doc.title}\nSUMMARY: ${doc.summary}`);
         }
    });

    if (contextResults.length === 0) {
        return "SEARCH RESULT: No specific documents found in the knowledge base matching your query. Answer based on general knowledge and your strategic capabilities.";
    }

    // Return structured context for the LLM
    return `FOUND ${contextResults.length} DOCUMENTS:\n\n${contextResults.slice(0, 5).join('\n\n---\n\n')}`;
  },

  async getSystemDocs(role: string): Promise<NotionPage[]> {
    // Mock Data based on Roles
    const MOCK_KNOWLEDGE_BASE: Record<string, NotionPage[]> = {
        andrea: [
            { id: 'kb1', title: 'Estrategia Comercial Q1', summary: 'Objetivo: Expansión B2B Latam. Meta Revenue: $60k. Foco en aumentar ticket promedio a $1.8k.', tag: 'Estrategia', lastEdited: 'Hoy', icon: '🎯' },
            { id: 'kb2', title: 'Reporte Financiero Elevat', summary: 'MRR actual: $15.8k. EBITDA: $8.4k (Positivo). Churn rate: 2.1%. Burn Rate: $12k.', tag: 'Finanzas', lastEdited: '2h', icon: '📈' },
            { id: 'kb9', title: 'Partnerships', summary: 'Acuerdo en borrador con Google Cloud para créditos de startup ($100k).', tag: 'Legal', lastEdited: '1d', icon: '🤝' }
        ],
        christian: [
            { id: 'kb3', title: 'SOP: Onboarding Clientes', summary: '1. Crear canal Slack. 2. Configurar CRM (HubSpot). 3. Agendar Kickoff. 4. Enviar Welcome Kit.', tag: 'Ops', lastEdited: '1d', icon: '📋' },
            { id: 'kb4', title: 'Estado de Proyectos', summary: 'Proyecto Alpha (Fase: Entrega). Proyecto Beta (Fase: Discovery). Nux Agency (Fase: Onboarding).', tag: 'Proyectos', lastEdited: '4h', icon: '🚧' }
        ],
        moises: [
            { id: 'kb5', title: 'Arquitectura RAG v1', summary: 'Stack: Supabase pgvector + Google Gemini 1.5 Flash. Latencia < 500ms.', tag: 'Tech', lastEdited: '1h', icon: '🤖' },
            { id: 'kb6', title: 'Logs del Servidor', summary: 'Latencia promedio 200ms. Error rate < 0.1%. Peak load: 14:00 hrs.', tag: 'System', lastEdited: '5m', icon: '🔌' }
        ]
    };
    const key = Object.keys(MOCK_KNOWLEDGE_BASE).find(k => role.toLowerCase().includes(k)) || 'andrea';
    return MOCK_KNOWLEDGE_BASE[key] || [];
  },

  async getDashboardDocs(role: string): Promise<NotionPage[]> {
      return this.getSystemDocs(role);
  }
};