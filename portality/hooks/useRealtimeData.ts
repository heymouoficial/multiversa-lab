import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Task, Client, Service } from '../types';

export const setupRealtimeSubscription = (client: typeof supabase, onUpdate: () => void) => {
    return client.channel('app_realtime_hook')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
            console.log('🔄 [Realtime Hook] Tasks update:', payload.eventType);
            onUpdate();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, (payload) => {
            console.log('🔄 [Realtime Hook] Clients update:', payload.eventType);
            onUpdate();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, (payload) => {
            console.log('🔄 [Realtime Hook] Services update:', payload.eventType);
            onUpdate();
        })
        .subscribe();
};

export const useRealtimeData = (session: any, organizationId: string) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAllData = async () => {
        try {
            // Fetch Tasks
            const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (!tasksError && tasksData) {
                setTasks(tasksData.map(t => ({
                    id: t.id,
                    title: t.title,
                    priority: t.priority || 'medium',
                    status: t.status || 'todo',
                    completed: t.completed || false,
                    tags: t.tags || [],
                    assignedTo: t.assigned_to || 'MV',
                    organizationId: t.organization_id || 'ELEVAT',
                    clientId: t.client_id,
                    deadline: t.deadline
                })));
            }

            // Fetch Clients
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select('*');

            if (!clientsError && clientsData) {
                setClients(clientsData || []);
            }

            // Fetch Services
            const { data: servicesData, error: servicesError } = await supabase
                .from('services')
                .select('*');

            if (!servicesError && servicesData) {
                setServices(servicesData || []);
            }
        } catch (error) {
            console.error('[Realtime] Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!session) return;

        fetchAllData();

        const channel = setupRealtimeSubscription(supabase, fetchAllData);

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session, organizationId]);

    return { tasks, clients, services, loading, refetch: fetchAllData, setTasks }; // setTasks exposed for optimistic updates
};
