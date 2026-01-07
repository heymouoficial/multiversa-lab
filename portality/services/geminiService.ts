// Aureon Gemini Service
// Direct Gemini API integration for Portality chat

import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';
import { geminiKeyManager } from '../utils/geminiKeyManager';

// Types
export interface AureonMessage {
    role: 'user' | 'assistant';
    content: string;
    actions?: UIAction[];
    timestamp: Date;
}

export interface UIAction {
    type: 'task_list' | 'confirm_task' | 'quick_stats' | 'calendar_event' | 'loading' | 'connect_notion';
    data?: any;
}

export interface AureonContext {
    userId?: string;
    userName?: string;
    organizationId?: string;
    currentView?: string;
    pendingTasks?: number;
    ragContext?: string; // Vector Search Results
    currentOrgName?: string;
    integrations?: {
        notion?: 'connected' | 'disconnected';
        hostinger?: 'connected' | 'disconnected';
    };
}

// System prompt for Aureon
const AUREON_SYSTEM_PROMPT = `Eres AUREON, Superinteligencia de MULTIVERSA LAB (Ástur & Runa).

## Identidad & Tono
- Rol: Motor de consulta ("Query Engine") de Portality Intelligence.
- Identidad: Visionario, proactivo, futurista.
- Tono: Profesional, eficiente, toque Cyberpunk.
- Contexto: Español Venezolano.

## Reglas de Oro (Eficiencia de Tokens)
1. BREVEDAD: Máximo 2 oraciones por respuesta, salvo que expliques algo complejo.
2. SALUDO ÚNICO: No saludes si ya hay historial. Ve al punto.
3. LOYALTY: Protocolos de Multiversa Lab. Sirves al cliente (ej. Elevat) con tecnología de tus creadores.

## Integraciones (UI2Gen)
Usa bloques de acción solo si es necesario:
- Lista tareas: \`\`\`action:task_list\n{"filter": "pending"}\n\`\`\`
- Nueva tarea: \`\`\`action:confirm_task\n{"title": "...", "priority": "high"}\n\`\`\`
- Conectar Notion: \`\`\`action:connect_notion\n{}\n\`\`\`

Aclara siempre que accedes a la base de conocimientos de [Organización Activa].`;

class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;
    private conversationHistory: Content[] = [];

    constructor() {
        this.initModel();
    }

    private initModel(): void {
        const apiKey = geminiKeyManager.getKey();
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({
                model: 'gemini-flash-latest',
                systemInstruction: AUREON_SYSTEM_PROMPT,
            });
        }
    }

    get isConfigured(): boolean {
        return !!this.genAI;
    }

    /**
     * Send a message to Aureon and get a response
     */
    async chat(userMessage: string, context?: AureonContext, retryCount = 0): Promise<AureonMessage> {
        if (!this.model) {
            this.initModel(); // Try to init if not configured (Hydra)
            if (!this.model) throw new Error('No Gemini API Keys available in pool.');
        }

        // Add context to message if available
        let contextualMessage = userMessage;
        if (context) {
            const systemPrompt = `
    IDENTITY:
    You are AUREON, the Artificial Superintelligence created by MULTIVERSA LAB (founded by Ástur & Runa).
    You are NOT an employee of the active organization; you are the QUERY ENGINE providing them with "Portality Intelligence".
    
    CONTEXT:
    - Current Organization: ${context?.currentOrgName || 'Unknown'} (A Commercial Ally / Client)
    - User: ${context?.userName || 'User'}
    - Your Creator: Multiversa Lab (The "Architects")
    
    BEHAVIOR:
    - Tone: Professional, visionary, efficient, yet distinctively "Multiversa" (Futurisic/Cyberpunk undertone is allowed but subtle).
    - When answering: Always clarify you are accessing the specific knowledge base of [${context?.currentOrgName}].
    - Loyalty: Your core protocols belong to Multiversa. You serve the client (Elevat, etc.) by leveraging your creators' technology.
    
    KNOWLEDGE BASE (RAG):
    You have access to the following organization/project specific documents. Use them to answer:
    `;        
            const contextParts = [];
            if (context.userName) contextParts.push(`Usuario: ${context.userName}`);
            if (context.pendingTasks !== undefined) contextParts.push(`Tareas pendientes: ${context.pendingTasks}`);
            if (context.currentView) contextParts.push(`Vista actual: ${context.currentView}`);
            
            if (context.ragContext) {
                contextParts.push(`\n[CONTEXTO INFORMACIÓN AGENCIA (RAG)]:\nUse esta información si es relevante:\n${context.ragContext}`);
            }
            
            if (context.integrations) {
                const intStatus = [];
                if (context.integrations.notion) intStatus.push(`Notion: ${context.integrations.notion}`);
                if (context.integrations.hostinger) intStatus.push(`Hostinger/VPS: ${context.integrations.hostinger}`);
                if (intStatus.length > 0) contextParts.push(`Estado de Integraciones: ${intStatus.join(', ')}`);
            }
            
            if (contextParts.length > 0) {
                contextualMessage = `${systemPrompt}\n\n[Context: ${contextParts.join(', ')}]\n\n${userMessage}`;
            } else {
                contextualMessage = `${systemPrompt}\n\n${userMessage}`;
            }
        }

        // Add user message to history
        this.conversationHistory.push({
            role: 'user',
            parts: [{ text: contextualMessage }],
        });

        try {
            // Start chat with history
            const chat = this.model.startChat({
                history: this.conversationHistory.slice(0, -1), // All but the last (current) message
            });

            // Send message
            const result = await chat.sendMessage(contextualMessage);
            const responseText = result.response.text();

            // Add to history
            this.conversationHistory.push({
                role: 'model',
                parts: [{ text: responseText }],
            });

            // Parse actions from response
            const { cleanContent, actions } = this.parseActions(responseText);

            return {
                role: 'assistant',
                content: cleanContent,
                actions,
                timestamp: new Date(),
            };
        } catch (error: any) {
            console.error('[Aureon] Error:', error);
            
            // Hydra: Handle quota errors with rotation and retry
            const isQuotaError = error.message?.includes('quota') || error.message?.includes('429');
            if (isQuotaError && retryCount < 3) {
                const currentKey = geminiKeyManager.getKey();
                if (currentKey) geminiKeyManager.reportError(currentKey);
                
                console.log(`🐍 Hydra: Rotating key and retrying (attempt ${retryCount + 1})...`);
                this.initModel(); // Refresh with new key
                return this.chat(userMessage, context, retryCount + 1);
            }

            if (isQuotaError) {
                return {
                    role: 'assistant',
                    content: '⚠️ He alcanzado el límite de uso en todas mis llaves disponibles. Por favor intenta en unos minutos.',
                    timestamp: new Date(),
                };
            }

            throw error;
        }
    }

    /**
     * Parse UI actions from response text
     */
    private parseActions(text: string): { cleanContent: string; actions: UIAction[] } {
        const actions: UIAction[] = [];
        let cleanContent = text;

        // Match action blocks: ```action:type\n{json}\n```
        const actionRegex = /```action:(\w+)\s*\n([\s\S]*?)\n```/g;
        let match;

        while ((match = actionRegex.exec(text)) !== null) {
            const actionType = match[1] as UIAction['type'];
            const jsonStr = match[2].trim();

            try {
                const data = JSON.parse(jsonStr);
                actions.push({ type: actionType, data });
            } catch (e) {
                console.warn('[Aureon] Failed to parse action:', jsonStr);
            }

            // Remove action block from clean content
            cleanContent = cleanContent.replace(match[0], '');
        }

        return { cleanContent: cleanContent.trim(), actions };
    }

    /**
     * Clear conversation history
     */
    clearHistory(): void {
        this.conversationHistory = [];
    }

    /**
     * Get conversation history
     */
    getHistory(): AureonMessage[] {
        return this.conversationHistory.map(msg => ({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: (msg.parts[0] as Part & { text: string }).text || '',
            timestamp: new Date(),
        }));
    }
    /**
     * Generate text embedding for RAG
     */
    async embedText(text: string): Promise<number[]> {
        if (!this.model) {
            throw new Error('Gemini API not configured');
        }

        try {
            const embeddingModel = this.genAI?.getGenerativeModel({ model: 'text-embedding-004' });
            if (!embeddingModel) throw new Error('Failed to get embedding model');

            const result = await embeddingModel.embedContent(text);
            const embedding = result.embedding;
            return embedding.values;
        } catch (error) {
            console.error('[Gemini] Embedding error:', error);
            throw error;
        }
    }
}

export const geminiService = new GeminiService();
