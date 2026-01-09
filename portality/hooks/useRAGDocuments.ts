import { useState, useEffect, useRef } from 'react';
import { ragService } from '../services/ragService';

export interface KnowledgeDoc {
    id: number;
    source: string;
    content: string;
    tenant_id: string;
    meta: { type?: string; category?: string; priority?: number };
    created_at: string;
    updated_at: string;
}

export const useRAGDocuments = (organizationId?: string) => {
    const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const fetchDocuments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 5000)
            );

            const sources = await Promise.race([
                ragService.getSources().catch(e => {
                    console.warn('RAG service failed, using memory fallback:', e);
                    return [] as any[];
                }),
                timeoutPromise
            ]) as any[];
            
            if (!isMounted.current) return;

            const mapped: KnowledgeDoc[] = sources.map(s => ({
                id: parseInt(s.id) || Date.now() + Math.random(),
                source: s.name,
                content: s.content || '',
                tenant_id: organizationId || 'default',
                meta: s.metadata || { category: 'general' },
                created_at: s.lastSynced instanceof Date ? s.lastSynced.toISOString() : (s.lastSynced || new Date().toISOString()),
                updated_at: s.lastSynced instanceof Date ? s.lastSynced.toISOString() : (s.lastSynced || new Date().toISOString())
            }));

            setDocuments(mapped);
        } catch (err: any) {
            console.error('[RAG] Fatal Error:', err);
            if (isMounted.current) setError(err.message || 'Error loading documents');
            if (isMounted.current) setDocuments([]); 
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [organizationId]);

    return { documents, isLoading, error, refetch: fetchDocuments };
};
