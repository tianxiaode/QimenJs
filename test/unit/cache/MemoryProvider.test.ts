import { MemoryProvider } from '@/cache/MemoryProvider';

describe('MemoryProvider', () => {
    let provider: MemoryProvider<string, any>;

    beforeEach(() => {
        provider = new MemoryProvider<string, any>();
    });

    afterEach(async () => {
        await provider.clear();
    });

    describe('constructor', () => {
        it('should create a memory provider instance', () => {
            expect(provider).toBeInstanceOf(MemoryProvider);
            expect(provider.type).toBe('memory');
            expect(provider.id).toBeDefined();
        });
    });

    describe('set and get', () => {
        it('should set and get a value', async () => {
            await provider.set('test-key', 'test-value');
            const value = await provider.get('test-key');
            expect(value).toBe('test-value');
        });

        it('should return null for non-existent key', async () => {
            const value = await provider.get('non-existent');
            expect(value).toBeNull();
        });

        it('should handle complex objects', async () => {
            const complexObject = {
                name: 'test',
                nested: {
                    value: 123,
                    array: [1, 2, 3],
                },
            };
            await provider.set('complex', complexObject);
            const value = await provider.get('complex');
            expect(value).toEqual(complexObject);
        });

        it('should overwrite existing value', async () => {
            await provider.set('key', 'value1');
            await provider.set('key', 'value2');
            const value = await provider.get('key');
            expect(value).toBe('value2');
        });
    });

    describe('TTL (Time To Live)', () => {
        it('should return value before TTL expires', async () => {
            await provider.set('ttl-key', 'ttl-value', 1000);
            const value = await provider.get('ttl-key');
            expect(value).toBe('ttl-value');
        });

        it('should return null after TTL expires', async () => {
            await provider.set('expired-key', 'expired-value', 100);

            // 等待过期
            await new Promise(resolve => setTimeout(resolve, 150));

            const value = await provider.get('expired-key');
            expect(value).toBeNull();
        });

        it('should handle permanent cache (TTL = 0)', async () => {
            await provider.set('permanent', 'value', 0);
            const value = await provider.get('permanent');
            expect(value).toBe('value');
        });
    });

    describe('has', () => {
        it('should return true for existing key', async () => {
            await provider.set('existing', 'value');
            const exists = await provider.has('existing');
            expect(exists).toBe(true);
        });

        it('should return false for non-existent key', async () => {
            const exists = await provider.has('non-existent');
            expect(exists).toBe(false);
        });
    });

    describe('remove', () => {
        it('should remove an existing key', async () => {
            await provider.set('to-remove', 'value');
            await provider.remove('to-remove');
            const value = await provider.get('to-remove');
            expect(value).toBeNull();
        });

        it('should not throw when removing non-existent key', async () => {
            await expect(provider.remove('non-existent')).resolves.not.toThrow();
        });
    });

    describe('clear', () => {
        it('should clear all cache entries', async () => {
            await provider.set('key1', 'value1');
            await provider.set('key2', 'value2');
            await provider.set('key3', 'value3');

            await provider.clear();

            expect(await provider.get('key1')).toBeNull();
            expect(await provider.get('key2')).toBeNull();
            expect(await provider.get('key3')).toBeNull();
        });
    });

    describe('key resolution', () => {
        it('should resolve keys with correct prefix', async () => {
            await provider.set('test', 'value');
            const hasKey = await provider.has('test');
            expect(hasKey).toBe(true);
        });

        it('should handle different key types', async () => {
            const numberProvider = new MemoryProvider<number, string>();
            await numberProvider.set(123, 'value');
            const value = await numberProvider.get(123);
            expect(value).toBe('value');
        });
    });
});
