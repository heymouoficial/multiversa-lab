import { describe, it, expect, vi } from 'vitest';

const detectIntent = (message: string) => {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('resumen') || lowerMsg.includes('cliente') || lowerMsg.includes('proyecto')) {
        return 'client_summary';
    }
    if (lowerMsg.includes('tarea') || lowerMsg.includes('pendiente')) {
        return 'task_list';
    }
    return 'chat';
};

describe('Intent Parsing Logic', () => {
    it('should detect client_summary intent', () => {
        expect(detectIntent('Dame un resumen del cliente Clínica Pro Salud')).toBe('client_summary');
        expect(detectIntent('Cual es el estado del proyecto x')).toBe('client_summary');
    });

    it('should detect task_list intent', () => {
        expect(detectIntent('Que tareas tengo pendientes?')).toBe('task_list');
    });

    it('should default to chat', () => {
        expect(detectIntent('Hola como estas')).toBe('chat');
    });
});
