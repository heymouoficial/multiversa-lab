import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../lib/supabase';
import { notionService } from '../services/notionService';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
      select: vi.fn(() => ({ 
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        eq: vi.fn(() => ({ limit: vi.fn().mockResolvedValue({ data: [], error: null }) }))
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
  },
}));

// Mock environment variables
vi.stubEnv('VITE_NOTION_TOKEN', 'fake-token');
vi.stubEnv('VITE_NOTION_DB_CLIENTS', 'db-clients');
vi.stubEnv('VITE_NOTION_DB_SERVICES', 'db-services');
vi.stubEnv('VITE_NOTION_DB_TASKS', 'db-tasks');
vi.stubEnv('VITE_NOTION_DB_TEAM', 'db-team');
vi.stubEnv('VITE_NOTION_DB_CALENDAR', 'db-calendar');

describe('NotionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch clients from Notion via Edge Function', async () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: {
        results: [
          {
            id: 'client-1',
            properties: {
              Nombre: { title: [{ plain_text: 'Client Name' }] },
              'Tipo de servicio': { select: { name: 'project' } },
              Estado: { select: { name: 'risk' } },
            },
          },
        ],
      },
      error: null,
    });

    const clients = await notionService.getClients();
    expect(supabase.functions.invoke).toHaveBeenCalledWith('notion-api', expect.objectContaining({
      body: expect.objectContaining({ action: 'query_database' })
    }));
    expect(clients.length).toBe(1);
    expect(clients[0].name).toBe('Client Name');
  });

  it('should fetch tasks from Notion via Edge Function', async () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: {
        results: [
          {
            id: 'task-1',
            properties: {
              'Nombre de tarea': { title: [{ plain_text: 'Task 1' }] },
              Estado: { status: { name: 'Listo' } },
            },
          },
        ],
      },
      error: null,
    });

    const tasks = await notionService.getTasks();
    expect(tasks.length).toBe(1);
    expect(tasks[0].status).toBe('done');
  });

  it('should create a task in Notion', async () => {
    (supabase.functions.invoke as any).mockResolvedValueOnce({ data: { results: [] }, error: null }); // get_users
    (supabase.functions.invoke as any).mockResolvedValueOnce({ data: { id: 'new-task-id' }, error: null }); // create_page

    const result = await notionService.createTask({
      title: 'New Task',
      priority: 'high',
    });

    expect(supabase.functions.invoke).toHaveBeenCalledWith('notion-api', expect.objectContaining({
      body: expect.objectContaining({ action: 'create_page' })
    }));
    expect(result.id).toBe('new-task-id');
  });

  it('should update task status in Notion', async () => {
    (supabase.functions.invoke as any).mockResolvedValue({ data: { id: 'task-1' }, error: null });

    await notionService.updateTaskStatus('task-1', 'done');

    expect(supabase.functions.invoke).toHaveBeenCalledWith('notion-api', expect.objectContaining({
      body: expect.objectContaining({
        action: 'update_page',
        payload: expect.objectContaining({
          page_id: 'task-1',
          properties: expect.objectContaining({
            'Estado': { status: { name: 'Listo' } }
          })
        })
      })
    }));
  });

  it('should sync from Notion (syncFromNotion)', async () => {
    // Mock getTasks (query_database)
    (supabase.functions.invoke as any).mockResolvedValueOnce({
        data: {
          results: [{ id: 'task-1', properties: { 'Nombre de tarea': { title: [{ plain_text: 'T1' }] } } }]
        },
        error: null
    });
    // Mock getClients (query_database)
    (supabase.functions.invoke as any).mockResolvedValueOnce({
        data: {
          results: [{ id: 'client-1', properties: { 'Nombre': { title: [{ plain_text: 'C1' }] } } }]
        },
        error: null
    });

    await notionService.syncFromNotion();

    expect(supabase.from).toHaveBeenCalledWith('tasks');
    expect(supabase.from).toHaveBeenCalledWith('clients');
  });
});
