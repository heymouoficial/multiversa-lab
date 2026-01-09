import { describe, it, expect } from 'vitest';
import { geminiService } from '../services/geminiService';

describe('geminiService', () => {
  it('should parse client_summary actions', () => {
    const text = 'Here is the summary:\n```action:client_summary\n{"clientId": "123"}\n```';
    // @ts-ignore
    const { cleanContent, actions } = geminiService.parseActions(text);
    
    expect(cleanContent).toBe('Here is the summary:');
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('client_summary');
    expect(actions[0].data.clientId).toBe('123');
  });

  it('should parse action block without trailing newline', () => {
    const text = 'Summary:```action:client_summary\n{"clientId": "123"}```';
    // @ts-ignore
    const { cleanContent, actions } = geminiService.parseActions(text);
    
    expect(cleanContent).toBe('Summary:');
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('client_summary');
  });

  it('should parse data_table actions', () => {
    const text = `Check this table:
\`\`\`action:data_table
{"title": "Stats", "headers": ["A"], "rows": [["B"]]}
\`\`\``;
    // @ts-ignore
    const { cleanContent, actions } = geminiService.parseActions(text);
    
    expect(cleanContent).toBe('Check this table:');
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('data_table');
    expect(actions[0].data.title).toBe('Stats');
  });
});
