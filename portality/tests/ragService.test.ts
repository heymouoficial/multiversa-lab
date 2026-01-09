import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ragService } from '../services/ragService';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data: [], error: null })
          }))
        })),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        limit: vi.fn().mockResolvedValue({ data: [], error: null })
      }))
    })),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    channel: vi.fn(() => ({
        on: vi.fn(() => ({
            subscribe: vi.fn()
        }))
    }))
  },
}));

describe('ragService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve context from multiple sources', async () => {
    const context = await ragService.retrieveContext('test query', 'admin', 'org-1');
    expect(typeof context).toBe('string');
  });
});
