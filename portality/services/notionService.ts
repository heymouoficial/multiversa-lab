// import { Client as NotionClient } from '@notionhq/client';
import { supabase } from '../lib/supabase';
import { Client, Task, Service, CalendarEvent } from '../types';

/**
 * Notion Service - Core Integration
 * Handles synchronization between Notion databases and Portality OS.
 */
// Notion Service - Core Integration
// Handles synchronization between Notion databases and Portality OS via Supabase Edge Functions.

class NotionService {
    private syncSubscription: any = null;

    /**
     * Helper to call the Supabase Edge Function
     */
    private async callEdgeFunction(action: string, payload: any = {}): Promise<any> {
        const { data, error } = await supabase.functions.invoke('notion-api', {
            body: { action, payload }
        });

        if (error) {
            console.error(`[NotionService] Edge Function Error (${action}):`, error);
            throw error;
        }
        return data;
    }

    /**
     * Pulls latest data from Notion and updates Supabase.
     */
    async syncFromNotion() {
        console.log('🔄 [Notion Sync] Pulling updates from Notion...');
        try {
            const tasks = await this.getTasks();
            
            for (const task of tasks) {
                const sbTask = {
                    notion_id: task.id,
                    title: task.title,
                    status: task.status,
                    priority: task.priority,
                    completed: task.completed,
                    assigned_to: task.assignedTo,
                    deadline: task.deadline ? new Date(task.deadline).toISOString() : null,
                };

                const { error } = await supabase.from('tasks').upsert(sbTask, { onConflict: 'notion_id' });
                if (error) console.error('Error syncing task to Supabase:', error);
            }
            console.log(`✅ [Notion Sync] Pulled ${tasks.length} tasks.`);
            
            // Also sync clients
            const clients = await this.getClients();
            for (const client of clients) {
                const sbClient = {
                    name: client.name,
                    status: client.status,
                    company: client.company || 'Retainer',
                    type: client.type,
                    notion_id: client.id, // client.id is the Notion ID
                    organization_id: '392ecec2-e769-4db2-810f-ccd5bd09d92a', // Default Elevat Org
                };

                const { error } = await supabase.from('clients').upsert(sbClient, { onConflict: 'notion_id' });
                if (error) console.error('Error syncing client to Supabase:', error);
            }
            console.log(`✅ [Notion Sync] Pulled ${clients.length} clients.`);
        } catch (error) {
            console.error('Error in syncFromNotion:', error);
        }
    }

    /**
     * Starts listening to Supabase changes and pushes them to Notion.
     */
    startSyncLoop() {
        if (this.syncSubscription) return;

        console.log('🔄 [Notion Sync] Initializing bidirectional sync loop...');

        // Poll Notion every 60 seconds (less frequent to save quota/compute)
        const pollInterval = setInterval(() => this.syncFromNotion(), 60000);
        this.syncFromNotion();

        this.syncSubscription = supabase.channel('notion_sync_tasks')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async (payload) => {
                const task = payload.new as any;
                if (!task) return;
                
                if (payload.eventType === 'INSERT' && !task.notion_id) {
                    console.log(`🔄 [Notion Sync] Creating new task in Notion: ${task.title}`);
                    try {
                        const notionPage = await this.createTask(task);
                        await supabase.from('tasks').update({ notion_id: notionPage.id }).eq('id', task.id);
                    } catch (error) {
                        console.error('[Notion Sync] Failed to create task:', error);
                    }
                } else if (payload.eventType === 'UPDATE' && task.notion_id) {
                    // Logic to avoid loops -> Check if change matches what we just pulled?
                    // For now, simpler to push status updates
                    console.log(`🔄 [Notion Sync] Pushing task update to Notion: ${task.title}`);
                    try {
                        await this.updateTaskStatus(task.notion_id, task.status);
                    } catch (error) {
                        // console.error('[Notion Sync] Failed to push update:', error);
                    }
                }
            })
            .subscribe();
            
        (this as any).pollInterval = pollInterval;
    }

    stopSyncLoop() {
        if (this.syncSubscription) {
            this.syncSubscription.unsubscribe();
            this.syncSubscription = null;
        }
        if ((this as any).pollInterval) {
            clearInterval((this as any).pollInterval);
        }
    }

    /**
     * Helper to query a Notion database with pagination via Edge Function.
     */
    private async queryDatabase(databaseId: string): Promise<any[]> {
        let results: any[] = [];
        let hasMore = true;
        let cursor: string | undefined = undefined;

        try {
            // Safety break to prevent infinite loops in dev
            let pagesFetched = 0;
            while (hasMore && pagesFetched < 5) {
                const response = await this.callEdgeFunction('query_database', {
                    database_id: databaseId,
                    start_cursor: cursor
                });
                
                if (response?.results) {
                    results = [...results, ...response.results];
                    hasMore = response.has_more;
                    cursor = response.next_cursor;
                } else {
                    hasMore = false;
                }
                pagesFetched++;
            }
            return results;
        } catch (error) {
            console.error(`Error querying database ${databaseId}:`, error);
            return [];
        }
    }

    async getClients(): Promise<Client[]> {
        const dbId = import.meta.env.VITE_NOTION_DB_CLIENTS;
        if (!dbId) return [];
        const results = await this.queryDatabase(dbId);
        return results.map(page => this.mapClient(page));
    }

    async getServices(): Promise<Service[]> {
        const dbId = import.meta.env.VITE_NOTION_DB_SERVICES;
        if (!dbId) return [];
        const results = await this.queryDatabase(dbId);
        return results.map(page => this.mapService(page));
    }

    async getTasks(): Promise<Task[]> {
        const dbId = import.meta.env.VITE_NOTION_DB_TASKS;
        if (!dbId) return [];
        const results = await this.queryDatabase(dbId);
        return results.map(page => this.mapTask(page));
    }

    async getTeam(): Promise<any[]> {
        const dbId = import.meta.env.VITE_NOTION_DB_TEAM;
        if (!dbId) return [];
        const results = await this.queryDatabase(dbId);
        return results.map(page => this.mapTeamMember(page));
    }

    async getCalendar(): Promise<CalendarEvent[]> {
        const dbId = import.meta.env.VITE_NOTION_DB_CALENDAR;
        if (!dbId) return [];
        const results = await this.queryDatabase(dbId);
        return results.map(page => this.mapCalendarEvent(page));
    }

    // Creating items via Edge Function not strictly implemented yet in edge function 'action' switch
    // But assuming we add 'create_page' action or similar. 
    // For now, I'll assume we haven't ported 'create' yet, OR I need to add it to index.ts.
    // Let's Stub it to warn or implement 'create_page' in Edge Function.
    
    async getUsers(): Promise<any[]> {
        const response = await this.callEdgeFunction('get_users');
        return response.results || [];
    }

    async createTask(task: Partial<Task>): Promise<any> {
        const dbId = import.meta.env.VITE_NOTION_DB_TASKS;
        if (!dbId) throw new Error('Missing Task DB ID');

        // 1. Determine Assignee (Default: Elevat Org)
        let assigneeId = undefined;
        const users = await this.getUsers();
        
        if (task.assignedTo) {
             const user = users.find(u => u.name === task.assignedTo || u.person?.email === task.assignedTo); // Check name or email
             assigneeId = user?.id;
        }

        if (!assigneeId) {
            const defaultUser = users.find(u => u.name?.includes('Elevat') || u.name?.includes('Multiversa')); // Fallback logic
            assigneeId = defaultUser?.id;
        }

        // 2. Build Properties (Spanish/English Fallback)
        const properties: any = {
            'Nombre de tarea': { title: [{ text: { content: task.title || 'Untitled' } }] },
            'Estado': { status: { name: 'Sin empezar' } }, // Default status
        };

        if (assigneeId) {
            properties['Responsable'] = { people: [{ id: assigneeId }] };
        }
        
        if (task.deadline) {
            properties['Fecha limite'] = { date: { start: task.deadline.toISOString() } };
        }

        if (task.clientId) {
             properties['Clientes - Agencia 2026'] = { relation: [{ id: task.clientId }] };
        }

        return await this.callEdgeFunction('create_page', {
            parent_id: dbId,
            properties: properties,
            icon: { emoji: '⚡' }
        });
    }

    async createClient(clientData: Partial<Client>): Promise<any> {
         const dbId = import.meta.env.VITE_NOTION_DB_CLIENTS;
         if (!dbId) throw new Error('Missing Client DB ID');

         const properties = {
             'Nombre': { title: [{ text: { content: clientData.name || 'New Client' } }] },
             'Estado': { select: { name: 'Activo' } },
             'Tipo de servicio': { select: { name: clientData.type || 'Retainer' } }
         };

         return await this.callEdgeFunction('create_page', {
             parent_id: dbId,
             properties: properties,
             icon: { emoji: '🏢' }
         });
    }

    async updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
        // Map internal status to Notion Status name
        // Internal: 'todo', 'in_progress', 'done', 'pending'
        // Notion: 'Sin empezar', 'En curso', 'Listo'
        let notionStatus = 'Sin empezar';
        if (status === 'in-progress') notionStatus = 'En curso';
        if (status === 'done') notionStatus = 'Listo';

         await this.callEdgeFunction('update_page', {
             page_id: taskId,
             properties: {
                 'Estado': { status: { name: notionStatus } }
             }
         });
    }

    // --- Mappers (Unchanged) ---

    private mapClient(page: any): Client {
        const props = page.properties;
        return {
            id: page.id,
            name: props.Name?.title[0]?.plain_text || props.Nombre?.title[0]?.plain_text || 'Unknown',
            type: (props.Type?.select?.name as any) || (props['Tipo de servicio']?.select?.name as any) || 'fixed',
            status: (props.Status?.select?.name as any) || (props.Estado?.select?.name as any) || 'active',
            notion_id: page.id
        };
    }

    private mapService(page: any): Service {
        const props = page.properties;
        return {
            id: page.id,
            name: props.Name?.title[0]?.plain_text || props.Nombre?.title[0]?.plain_text || 'Unknown',
            clientId: props.Client?.relation[0]?.id || props['Clientes - Agencia 2026']?.relation[0]?.id || '',
            frequency: (props.Frequency?.select?.name as any) || (props['Frecuencia']?.select?.name as any) || 'monthly'
        };
    }

    private mapTask(page: any): Task {
        const props = page.properties;
        const assignedPeople = props['Assigned To']?.people || props['Responsable']?.people || [];
        const assigneeName = assignedPeople[0]?.name || '';
        
        // Map Spanish statuses to internal English status
        const rawStatus = props.Status?.status?.name || props.Estado?.status?.name || 'todo';
        let status: any = 'todo';
        if (['Done', 'Listo', 'Completada'].includes(rawStatus)) status = 'done';
        if (['In Progress', 'En curso', 'En Progreso'].includes(rawStatus)) status = 'in-progress';

        return {
            id: page.id,
            title: props.Name?.title[0]?.plain_text || props['Nombre de tarea']?.title[0]?.plain_text || 'Untitled',
            priority: (props.Priority?.select?.name as any) || (props.Prioridad?.select?.name as any) || 'medium',
            status: status,
            completed: status === 'done',
            deadline: (props.Deadline?.date?.start || props['Fecha limite']?.date?.start) ? new Date(props.Deadline?.date?.start || props['Fecha limite']?.date?.start) : undefined,
            clientId: props.Client?.relation[0]?.id || props['Clientes - Agencia 2026']?.relation[0]?.id || '',
            assignedTo: assigneeName,
            assignedToId: assignedPeople[0]?.id,
        };
    }

    private mapTeamMember(page: any): any {
        const props = page.properties;
        return {
            id: page.id,
            name: props.Name?.title[0]?.plain_text || props.Nombre?.title[0]?.plain_text || 'Unknown',
            email: props.Email?.email || props.Correo?.email || '',
            role: props.Role?.select?.name || props.Rol?.select?.name || 'Member',
            avatar: props.Avatar?.url || `https://ui-avatars.com/api/?name=${props.Name?.title[0]?.plain_text || props.Nombre?.title[0]?.plain_text || 'U'}`
        };
    }

    private mapCalendarEvent(page: any): CalendarEvent {
        const props = page.properties;
        return {
            id: page.id,
            title: props.Name?.title[0]?.plain_text || props.Nombre?.title[0]?.plain_text || 'Meeting',
            startTime: (props.Date?.date?.start || props.Fecha?.date?.start) ? new Date(props.Date?.date?.start || props.Fecha?.date?.start) : new Date(),
            type: (props.Type?.select?.name as any) || 'meeting'
        };
    }

    /**
     * Legacy/Support methods
     */
    async provisionWorkspace(organizationId: string, orgName: string): Promise<{ success: boolean; workspaceId?: string }> {
        // Kept as is for now
        console.log(`🚀 [Notion] Provisioning workspace for ${orgName}...`);
        const webhookUrl = import.meta.env.VITE_NOTION_SYNC_WEBHOOK;
        if (!webhookUrl) return { success: false };
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'provision_workspace', organizationId, name: orgName })
        });
        return await response.json();
    }

    async checkSyncStatus(organizationId: string): Promise<'connected' | 'error' | 'disconnected'> {
        try {
            const res = await this.callEdgeFunction('connection_status');
            return res.status;
        } catch (e) {
            return 'disconnected';
        }
    }
}

export const notionService = new NotionService();
