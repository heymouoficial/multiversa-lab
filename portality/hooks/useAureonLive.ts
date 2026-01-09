import { useState, useEffect, useCallback, useRef } from 'react';
import { GeminiLiveService } from '../services/geminiLive';
import { AudioState } from '../types';

interface UseAureonLiveProps {
    onTaskCreate?: (title: string, priority: 'high' | 'medium' | 'low') => void;
    onKnowledgeQuery?: (query: string) => Promise<string>;
    onOperationalSummary?: () => Promise<string>;
}

export function useAureonLive({ onTaskCreate, onKnowledgeQuery, onOperationalSummary }: UseAureonLiveProps = {}) {
    const [status, setStatus] = useState<AudioState>(AudioState.IDLE);
    const [isTalking, setIsTalking] = useState(false);
    const serviceRef = useRef<GeminiLiveService | null>(null);

    // Initialize Service
    useEffect(() => {
        serviceRef.current = new GeminiLiveService({
            onStateChange: (newState) => {
                setStatus(newState);
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

                if (name === 'getOperationalSummary' && onOperationalSummary) {
                    const result = await onOperationalSummary();
                    return { summary: result };
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

        if (status === AudioState.LISTENING || status === AudioState.SPEAKING || status === AudioState.CONNECTING) {
            serviceRef.current.disconnect();
            setStatus(AudioState.IDLE);
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
