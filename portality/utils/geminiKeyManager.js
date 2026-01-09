/**
 * GeminiKeyManager - Operación Hydra
 *
 * Rotación de API Keys para evitar errores 429 (Quota Exceeded).
 */
export class GeminiKeyManager {
    constructor() {
        this.pool = [];
        this.currentIndex = 0;
        this.failedKeys = new Map(); // key → timestamp when failed
        this.COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown
        // Look for multiple keys in VITE_GEMINI_KEY_POOL (JSON array) or VITE_GEMINI_API_KEY
        const poolStr = import.meta.env.VITE_GEMINI_KEY_POOL;
        const singleKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (poolStr) {
            try {
                // Clean wrapping quotes if present (standard .env parsing issue)
                const cleanPool = poolStr.replace(/^['"]|['"]$/g, '');
                this.pool = JSON.parse(cleanPool);
                console.log(`🐍 Hydra: Pooled ${this.pool.length} keys.`);
            }
            catch (e) {
                console.error('❌ Hydra: Failed to parse VITE_GEMINI_KEY_POOL from:', poolStr);
            }
        }
        if (this.pool.length === 0 && singleKey) {
            this.pool = [singleKey];
            console.log('🐍 Hydra: Running in single-key mode.');
        }
    }
    static getInstance() {
        if (!GeminiKeyManager.instance) {
            GeminiKeyManager.instance = new GeminiKeyManager();
        }
        return GeminiKeyManager.instance;
    }
    mask(key) {
        return `${key.slice(0, 4)}...${key.slice(-4)}`;
    }
    cleanup() {
        const now = Date.now();
        for (const [key, failedAt] of this.failedKeys.entries()) {
            if (now - failedAt > this.COOLDOWN_MS) {
                this.failedKeys.delete(key);
            }
        }
    }
    getKey() {
        this.cleanup();
        if (this.pool.length === 0)
            return null;
        let attempts = 0;
        while (attempts < this.pool.length) {
            const key = this.pool[this.currentIndex];
            if (!this.failedKeys.has(key))
                return key;
            this.currentIndex = (this.currentIndex + 1) % this.pool.length;
            attempts++;
        }
        return null;
    }
    reportError(key) {
        this.failedKeys.set(key, Date.now());
        console.warn(`🐍 Hydra: Key ${this.mask(key)} marked as failed.`);
        this.currentIndex = (this.currentIndex + 1) % this.pool.length;
    }
    getStatus() {
        this.cleanup();
        return {
            totalKeys: this.pool.length,
            availableKeys: this.pool.length - this.failedKeys.size,
            failedKeys: Array.from(this.failedKeys.keys()).map(k => this.mask(k)),
            currentKeyMasked: this.pool[this.currentIndex] ? this.mask(this.pool[this.currentIndex]) : null
        };
    }
}
export const geminiKeyManager = GeminiKeyManager.getInstance();
