import { useState, useEffect, useCallback, useRef } from 'react';
import { GeminiLiveService } from '../services/geminiLive';

interface UseAureonLiveProps {
    onTaskCreate?: (title: string, priority: 'high' | 'medium' | 'low') => void;
    onKnowledgeQuery?: (query: string) => Promise<string>;
}

export function useAureonLive({ onTaskCreate, onKnowledgeQuery }: UseAureonLiveProps = {}) {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
    const [isTalking, setIsTalking] = useState(false);
    const serviceRef = useRef<GeminiLiveService | null>(null);

    // Initialize Service
    useEffect(() => {
        serviceRef.current = new GeminiLiveService({
            onStateChange: (newState) => {
                setStatus(newState === 'disconnected' ? 'idle' : newState);
            },
            onAudioData: (playing) => {
                setIsTalking(playing);
            },
            onToolCall: async (name, args) => {
                console.log(`[Aureon Hook] Tool Call: ${name}`, args);
                
                if (name === 'createTask' && onTaskCreate) {
                    onTaskCreate(args.title, args.priority || 'medium');
                    return { success: true, message: `Task "${args.title}" created.` };
                }
                
                if (name === 'queryKnowledgeBase' && onKnowledgeQuery) {
                    const result = await onKnowledgeQuery(args.query);
                    return { result };
                }

                return { error: 'Tool not implemented in UI' };
            }
        });

        return () => {
            serviceRef.current?.disconnect();
        };
    }, [onTaskCreate, onKnowledgeQuery]);

    const toggleVoice = useCallback(async () => {
        if (!serviceRef.current) return;

        if (status === 'connected' || status === 'connecting') {
            serviceRef.current.disconnect();
            setStatus('idle');
        } else {
            await serviceRef.current.connect();
        }
    }, [status]);

    return {
        status,
        isTalking,
        toggleVoice
    };
}
