
export interface Client {
  id: string;
  name: string;
  type: 'fixed' | 'project';
  status: 'active' | 'paused' | 'risk';
  logo?: string;
  company?: string;
  email?: string;
  startDate?: string;
  notion_id?: string;
}

export interface Service {
  id: string;
  name: string;
  clientId: string;
  responsibleId?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  completed: boolean;
  assignedTo?: string; // User ID or Initials
  assignedToId?: string; // Notion User UUID for robust filtering
  tags?: string[]; // For Kanban context
  clientId?: string;
  serviceId?: string;
  deadline?: Date;
  dueDate?: string | Date;
  organizationId?: string; // For privacy filtering (e.g. 'ELEVAT/AGORA')
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  type: 'meeting' | 'deadline' | 'reminder';
  link?: string;
  description?: string;
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
  id: 'andrea' | 'christian' | 'moises' | 'astursadeth';
  name: string;
  role: string;
  avatar: string; // Initials or Image URL
  theme: string; // Each user can have a preferred accent
  openRouterKey?: string; // Optional: User provided key
  organizationId?: string;
  notionId?: string; // Linked Notion Team Member ID
  lastActivity?: number; // Timestamp for 90-min session expiry
  layoutConfig?: string[]; // IDs of widgets to display in order
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

export type ViewState = 'home' | 'agency' | 'flow' | 'profile' | 'connections' | 'team' | 'board' | 'notion' | 'chat';

export enum AudioState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  LISTENING = 'listening',
  THINKING = 'thinking',
  SPEAKING = 'speaking',
  ERROR = 'error'
}
