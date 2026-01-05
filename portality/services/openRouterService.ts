import { GoogleGenAI, FunctionDeclaration, Type, Tool, Content, Part } from "@google/genai";
import { ChatMessage } from '../types';
import { ragService } from './ragService';
import { SYSTEM_INSTRUCTION, GEMINI_SEARCH_MODEL } from '../constants';

// --- CONFIGURATION ---
const MODEL_ID = GEMINI_SEARCH_MODEL;

// Define Tools
const queryKnowledgeBaseTool: FunctionDeclaration = {
    name: 'query_knowledge_base',
    description: 'Search the internal Elevat/Multiversa knowledge base for specific information, documents, or strategic context.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: { type: Type.STRING, description: "The search term or question." }
        },
        required: ['query']
    }
};

const createTaskTool: FunctionDeclaration = {
    name: 'create_task',
    description: 'Create a new task in the user\'s todo list.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The title of the task." },
            priority: { type: Type.STRING, enum: ["high", "medium", "low"], description: "Priority level." }
        },
        required: ['title']
    }
};

const toolsConfig: Tool[] = [
    { functionDeclarations: [queryKnowledgeBaseTool, createTaskTool] }
];

export const openRouterService = {

    async transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error("MISSING_API_KEY");

            const ai = new GoogleGenAI({ apiKey });

            const response = await ai.models.generateContent({
                model: MODEL_ID,
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { inlineData: { mimeType, data: base64Audio } },
                            { text: "Transcribe el siguiente audio exactamente como se escucha. Si hay pausas largas o ruido, ignoralo. Solo devuelve el texto transcrito sin comentarios adicionales." }
                        ]
                    }
                ]
            });

            return response.text || "";
        } catch (error) {
            console.error("Transcription Error:", error);
            throw new Error("No se pudo transcribir el audio.");
        }
    },

    async streamChat(
        messages: ChatMessage[],
        userContext: string,
        onChunk: (content: string) => void,
        onToolCall?: (toolName: string, args: any) => Promise<string>
    ): Promise<string> {

        console.group("🚀 [Gemini Service] Request Start");

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error("MISSING_API_KEY");

            const ai = new GoogleGenAI({ apiKey });

            // --- 1. Construct Initial History ---
            const validHistory = messages.slice(0, -1).filter(m => {
                const txt = m.content || m.text;
                return txt && txt.trim().length > 0;
            });

            const contents: Content[] = validHistory.map(m => ({
                role: (m.role === 'model' || m.role === 'assistant') ? 'model' : 'user',
                parts: [{ text: m.content || m.text || '.' }]
            }));

            const lastMsgObj = messages[messages.length - 1];
            const currentText = lastMsgObj.content || lastMsgObj.text || ".";

            // Add current user message
            contents.push({
                role: 'user',
                parts: [{ text: currentText }]
            });

            const now = new Date();
            const dateTimeStr = now.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' });

            const finalSystemInstruction = `
${SYSTEM_INSTRUCTION}

--- CONTEXTO ACTUAL ---
FECHA Y HORA: ${dateTimeStr}
USUARIO ACTUAL: ${userContext}
`.trim();

            // --- 2. First Pass: Call Model ---
            let finalResponseText = "";

            const resultStream = await ai.models.generateContentStream({
                model: MODEL_ID,
                contents: contents,
                config: {
                    systemInstruction: finalSystemInstruction,
                    temperature: 0.7,
                    tools: toolsConfig
                }
            });

            let toolCalls: any[] = [];
            let hasToolCall = false;

            // Process First Stream
            for await (const chunk of resultStream) {
                // Check for Function Calls
                if (chunk.functionCalls && chunk.functionCalls.length > 0) {
                    hasToolCall = true;
                    toolCalls.push(...chunk.functionCalls);
                }

                // Check for Text
                if (chunk.text) {
                    finalResponseText += chunk.text;
                    onChunk(chunk.text);
                }
            }

            // --- 3. Handle Tool Execution (If any) ---
            if (hasToolCall && toolCalls.length > 0) {

                // A. Append Model's Turn (Text + Tool Calls) to History
                const modelParts: Part[] = [];

                // If text exists, append it. If not, some models allow just functionCall.
                // Gemini 2.0 Flash is robust here.
                if (finalResponseText) {
                    modelParts.push({ text: finalResponseText });
                }

                toolCalls.forEach(fc => {
                    modelParts.push({
                        functionCall: {
                            name: fc.name,
                            args: fc.args
                        }
                    });
                });

                contents.push({
                    role: 'model',
                    parts: modelParts
                });

                // B. Execute Tools and Collect Responses
                const functionResponseParts: Part[] = [];

                for (const call of toolCalls) {
                    const name = call.name;
                    const args = call.args as any;
                    console.log(`⚡ Tool Triggered: ${name}`, args);

                    let toolResultString = "";

                    if (name === 'query_knowledge_base') {
                        // UI Feedback
                        onChunk(`\n\n> 🔍 *Analizando Base de Conocimiento...* \n\n`);

                        // Actual Logic
                        toolResultString = await ragService.retrieveContext(args.query, userContext);
                    }
                    else if (name === 'create_task') {
                        if (onToolCall) await onToolCall(name, args);
                        toolResultString = JSON.stringify({ status: "success", message: `Task '${args.title}' created.` });
                        onChunk(`\n> ✅ *Tarea Agendada: ${args.title}*\n\n`);
                    }
                    else {
                        toolResultString = JSON.stringify({ error: "Unknown tool" });
                    }

                    functionResponseParts.push({
                        functionResponse: {
                            name: name,
                            response: { result: toolResultString }
                        }
                    });
                }

                // C. Append Function Responses to History (User Turn)
                contents.push({
                    role: 'user',
                    parts: functionResponseParts
                });

                // --- 4. Second Pass: Get Final Answer ---
                console.log("🔄 Sending Tool Results back to Model...");

                // We disable tools for the final answer to prevent loops and ensure a text summary
                const finalStream = await ai.models.generateContentStream({
                    model: MODEL_ID,
                    contents: contents,
                    config: {
                        systemInstruction: finalSystemInstruction,
                        temperature: 0.7,
                        tools: [] // Disable tools for final response
                    }
                });

                for await (const chunk of finalStream) {
                    if (chunk.text) {
                        finalResponseText += chunk.text;
                        onChunk(chunk.text);
                    }
                }
            }

            console.log("✅ Request Complete");
            console.groupEnd();
            return finalResponseText;

        } catch (error: any) {
            console.error("❌ Gemini API Error:", error);
            console.groupEnd();

            let friendlyError = `Error: ${error.message || 'Desconocido'}`;
            if (error.message?.includes("API key")) friendlyError = "Falta la API Key en el entorno.";
            if (error.message?.includes("404")) friendlyError = "Modelo no disponible.";
            if (error.message?.includes("thought signature")) friendlyError = "Error de sincronización (Thought Signature). Reintentando...";

            const uiError = `\n\n⚠️ **Sistema Offline:** ${friendlyError}`;
            onChunk(uiError);
            return uiError;
        }
    }
};