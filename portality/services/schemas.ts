/**
 * Definición de Esquemas para Function Calling (Tools)
 * Compatible con OpenAI Standard y Vercel AI SDK
 */

export const tools = [
  {
    type: "function",
    function: {
      name: "query_knowledge_base",
      description: "Search the internal Elevat/Multiversa knowledge base for specific information, documents, uploaded markdown files, or strategic context. Use this whenever the user asks about internal data.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The semantic search term or question to look up in the vector database."
          },
          filter_type: {
            type: "string",
            enum: ["all", "finance", "legal", "tech"],
            description: "Optional filter to narrow down the search scope."
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a new task in the user's Todoist/Kanban system.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The content or title of the task."
          },
          priority: {
            type: "string",
            enum: ["high", "medium", "low"],
            description: "Priority level of the task."
          }
        },
        required: ["title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_financial_report",
      description: "Get the current real-time financial status (MRR, Burn Rate, EBITDA).",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            enum: ["current_month", "last_month", "ytd"],
            description: "The time period for the report."
          }
        }
      }
    }
  }
];

// Helper to get tool definition by name for client-side execution
export const getToolByName = (name: string) => {
    return tools.find(t => t.function.name === name);
};