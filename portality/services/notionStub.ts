import { Client, Task, Service } from '../types';

// Hardcoded IDs for now - User must replace via Env Vars eventually
// But for the "Show me" phase, we use Mocks.

export class NotionService {
  private static instance: NotionService;
  
  // Real implementation would use fetch('/api/notion/...') or n8n webhook
  // For now: Mock Data simulating the 4 Databases
  
  constructor() {}

  public static getInstance(): NotionService {
    if (!NotionService.instance) {
      NotionService.instance = new NotionService();
    }
    return NotionService.instance;
  }

  async getClients(): Promise<Client[]> {
    // RETURNS MOCK CLIENTS MATCHING NOTION DB
    return [
      { id: '1', name: 'Clínica Pro Salud', type: 'fixed', status: 'active', notion_id: 'page_1' },
      { id: '2', name: 'Your Sign World', type: 'project', status: 'active', notion_id: 'page_2' },
      { id: '3', name: 'D Mart Parts', type: 'fixed', status: 'risk', notion_id: 'page_3' },
      { id: '4', name: 'Torres Cabrera Law Firm', type: 'fixed', status: 'paused', notion_id: 'page_4' }
    ];
  }

  async getTasks(filterUser?: string): Promise<Task[]> {
    // RETURNS MOCK TASKS - Focused on Andrea & Christian
    return [
      { id: 't1', title: 'Reporte Mensual Google Ads - Clínica Pro Salud', priority: 'high', status: 'todo', assignedTo: 'AC', clientId: '1', serviceId: 's1', deadline: new Date(), completed: false },
      { id: 't2', title: 'Reporte Facebook Ads - Your Sign World', priority: 'high', status: 'todo', assignedTo: 'AC', clientId: '2', serviceId: 's1', completed: false },
      { id: 't3', title: 'Revisión Técnica de Embudos', priority: 'medium', status: 'in-progress', assignedTo: 'CM', clientId: '3', serviceId: 's3', completed: false },
      { id: 't4', title: 'Configuración n8n para Lead Magnets', priority: 'high', status: 'done', assignedTo: 'CM', clientId: '2', serviceId: 's2', deadline: new Date(Date.now() - 86400000), completed: true },
      { id: 't5', title: 'Estrategia Q1 2026', priority: 'high', status: 'todo', assignedTo: 'AC', clientId: '4', serviceId: 's4', deadline: new Date(Date.now() + 86400000 * 5), completed: false }
    ];
  }

  async getTeam(): Promise<any[]> {
    return [
      { id: 'christian', name: 'Christian Moreno', role: 'Ops Lead', avatar: 'https://ui-avatars.com/api/?name=Christian+Moreno&background=10b981&color=fff' },
      { id: 'zab', name: 'Zabdiel Valenzuela', role: 'Media Buyer', avatar: 'https://ui-avatars.com/api/?name=Zabdiel+Valenzuela&background=6366f1&color=fff' },
      { id: 'andrea', name: 'Andrea', role: 'CEO', avatar: 'https://ui-avatars.com/api/?name=Andrea&background=ec4899&color=fff' },
      { id: 'mou', name: 'Mou', role: 'Tech Lead', avatar: 'https://ui-avatars.com/api/?name=Mou&background=14b8a6&color=fff' },
      { id: 'nae', name: 'Nae', role: 'Content', avatar: 'https://ui-avatars.com/api/?name=Nae&background=8b5cf6&color=fff' }
    ];
  }

  async getStats() {
    return {
      activeClients: 4,
      pendingTasks: 3, // For current user context
      revenueRisk: '$0',
      nextReportDue: 'Hoy'
    };
  }
}

export const notionService = NotionService.getInstance();
