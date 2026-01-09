import { describe, it, expect, vi } from 'vitest';

interface NotionMember {
    id: string;
    name: string;
    email: string;
}

const findMatchingNotionMember = (email: string, fullName: string, team: NotionMember[]) => {
    // Logic extracted from App.tsx/future refactor
    return team.find(m => 
        (m.email && m.email.toLowerCase() === email.toLowerCase()) ||
        (m.name && m.name.toLowerCase() === fullName.toLowerCase())
    );
};

describe('Identity Mapping Logic', () => {
    const mockTeam: NotionMember[] = [
        { id: 'n1', name: 'Christian Moreno', email: 'christian@elevatmarketing.com' },
        { id: 'n2', name: 'Andrea Chimaras', email: 'andrea@elevatmarketing.com' },
    ];

    it('should match strictly by email', () => {
        const result = findMatchingNotionMember('christian@elevatmarketing.com', 'Christian', mockTeam);
        expect(result?.id).toBe('n1');
    });

    it('should fall back to name match if email is missing in team list', () => {
        const teamWithMissingEmail = [
            { id: 'n1', name: 'Christian Moreno', email: '' },
        ];
        const result = findMatchingNotionMember('christian@other.com', 'Christian Moreno', teamWithMissingEmail);
        expect(result?.id).toBe('n1');
    });

    it('should return undefined if no match found', () => {
        const result = findMatchingNotionMember('unknown@test.com', 'Stranger', mockTeam);
        expect(result).toBeUndefined();
    });
});
