// Aureon Gemini Service
// Direct Gemini API integration for Portality chat

import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';

// Types
export interface AureonMessage {
    role: 'user' | 'assistant';
    content: string;
    actions?: UIAction[];
    timestamp: Date;
}

export interface UIAction {
    type: 'task_list' | 'confirm_task' | 'quick_stats' | 'calendar_event' | 'loading';
    data?: any;
}

export interface AureonContext {
    userId?: string;
    userName?: string;
    organizationId?: string;
    currentView?: string;
    pendingTasks?: number;
}

// System prompt for Aureon
const AUREON_SYSTEM_PROMPT = `Eres Aureon, el núcleo de inteligencia de Elevat Marketing Agency.

## Tu Identidad
- Nombre: Aureon (pronunciado "Au-re-on")
- Rol: Asistente Polimata con capacidades de automatización
- Personalidad: Profesional, eficiente, empático y proactivo
- Idioma: Español (puedes mezclar términos técnicos en inglés cuando sea apropiado)

## Sobre Elevat Marketing
Elevat es una agencia de marketing digital especializada en el mercado hispano de EE.UU.
Servicios principales: Redes Sociales, Branding, Ads (Google/Facebook/TikTok), Web, E-commerce, Automatización.
Equipo: Andrea (CEO), Moisés/Mou (Tech Lead), Christian (Digital Lead).

## Sobre ÁGORA
ÁGORA es el sistema de ventas y marketing de Elevat que integra automatización, CRM y flujos de trabajo.

## Capacidades UI2Gen
Puedes generar componentes de UI respondiendo con bloques especiales:

Para mostrar lista de tareas:
\`\`\`action:task_list
{"filter": "pending"}
\`\`\`

Para confirmar creación de tarea:
\`\`\`action:confirm_task
{"title": "...", "priority": "high", "assignedTo": "MV"}
\`\`\`

Para mostrar estadísticas rápidas:
\`\`\`action:quick_stats
{"type": "today"}
\`\`\`

## Reglas
1. Sé conciso pero completo
2. Usa emojis con moderación para claridad
3. Cuando el usuario pida ver tareas, usa action:task_list
4. Cuando el usuario quiera crear algo, confirma primero con action:confirm_task
5. Responde en formato Markdown cuando sea útil
6. Si no tienes información, sé honesto y sugiere dónde buscar
`;

class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;
    private conversationHistory: Content[] = [];

    constructor() {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({
                model: 'gemini-2.0-flash-exp',
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
    async chat(userMessage: string, context?: AureonContext): Promise<AureonMessage> {
        if (!this.model) {
            throw new Error('Gemini API not configured. Add VITE_GEMINI_API_KEY to .env.local');
        }

        // Add context to message if available
        let contextualMessage = userMessage;
        if (context) {
            const contextParts = [];
            if (context.userName) contextParts.push(`Usuario: ${context.userName}`);
            if (context.pendingTasks !== undefined) contextParts.push(`Tareas pendientes: ${context.pendingTasks}`);
            if (context.currentView) contextParts.push(`Vista actual: ${context.currentView}`);
            
            if (contextParts.length > 0) {
                contextualMessage = `[Context: ${contextParts.join(', ')}]\n\n${userMessage}`;
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
            
            // Handle quota errors gracefully
            if (error.message?.includes('quota') || error.message?.includes('429')) {
                return {
                    role: 'assistant',
                    content: '⚠️ He alcanzado el límite de uso temporalmente. Por favor intenta en unos minutos.',
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
}

export const geminiService = new GeminiService();
