
export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  completed: boolean;
  assignedTo?: string; // User ID or Initials
  tags?: string[]; // For Kanban context
}

export interface Lead {
  id: string;
  initials: string;
  name: string;
  status: 'Hot' | 'New' | 'Cold' | 'Won';
  detail: string;
  color: string;
  value?: string;
}

export interface NotionPage {
  id: string;
  title: string;
  summary: string; // Simulates MCP summarization
  tag: string;
  lastEdited: string;
  icon: string; // Emoji
}

// New RAG Types
export interface KnowledgeSource {
  id: string;
  name: string;
  type: 'markdown' | 'database' | 'api' | 'file' | 'clipboard';
  format?: 'pdf' | 'docx' | 'txt' | 'md' | 'text';
  status: 'active' | 'indexing' | 'error';
  content?: string; // Raw text content for client-side RAG
  chunks?: string[]; // Processed chunks
  metadata?: Record<string, any>;
  lastSynced: Date;
}

export interface UserProfile {
  id: 'andrea' | 'christian' | 'moises';
  name: string;
  role: string;
  avatar: string; // Initials or Image URL
  theme: string; // Each user can have a preferred accent
  openRouterKey?: string; // Optional: User provided key
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system' | 'assistant'; // 'assistant' for OpenRouter/OpenAI std
  content: string; // Unified content field
  text?: string; // Legacy support
  timestamp: Date;
  toolInvocations?: any[]; // Vercel AI SDK style tool calls
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  blob1: string;
  blob2: string;
}

export type ViewState = 'home' | 'board' | 'flow' | 'report' | 'knowledge' | 'profile';

export enum AudioState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  LISTENING = 'listening',
  THINKING = 'thinking',
  SPEAKING = 'speaking',
  ERROR = 'error'
}
