import { describe, it, expect, vi } from 'vitest';
import { setupRealtimeSubscription } from '../hooks/useRealtimeData';

describe('Realtime Sync Logic', () => {
    it('should subscribe to tasks, clients, and services tables', () => {
        const onUpdate = vi.fn();
        
        const channelMock = {
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn(),
        };

        const supabaseMock = {
            channel: vi.fn().mockReturnValue(channelMock),
        };

        // @ts-ignore
        setupRealtimeSubscription(supabaseMock, onUpdate);

        // Check channel creation
        expect(supabaseMock.channel).toHaveBeenCalledWith('app_realtime_hook');

        // Check subscriptions
        expect(channelMock.on).toHaveBeenCalledWith(
            'postgres_changes',
            expect.objectContaining({ table: 'tasks' }),
            expect.any(Function)
        );
        expect(channelMock.on).toHaveBeenCalledWith(
            'postgres_changes',
            expect.objectContaining({ table: 'clients' }),
            expect.any(Function)
        );
        expect(channelMock.on).toHaveBeenCalledWith(
            'postgres_changes',
            expect.objectContaining({ table: 'services' }),
            expect.any(Function)
        );

        // Check subscription activation
        expect(channelMock.subscribe).toHaveBeenCalled();
    });

    it('should trigger update callback on event', () => {
        let taskCallback: Function;
        const onUpdate = vi.fn();

        const channelMock = {
            on: vi.fn().mockImplementation((type, filter, callback) => {
                if (filter.table === 'tasks') {
                    taskCallback = callback;
                }
                return channelMock;
            }),
            subscribe: vi.fn(),
        };

        const supabaseMock = {
            channel: vi.fn().mockReturnValue(channelMock),
        };

        // @ts-ignore
        setupRealtimeSubscription(supabaseMock, onUpdate);

        // Simulate event
        // @ts-ignore
        taskCallback({ eventType: 'UPDATE' });

        expect(onUpdate).toHaveBeenCalled();
    });
});
