import { CacheFactory } from '@/cache/CacheFactory';
import { MemoryProvider } from '@/cache/MemoryProvider';
import { Logger } from '@/logger/Logger';

describe('CacheFactory', () => {
    beforeAll(() => {
        // 初始化Logger.root
        if (!Logger.root) {
            Logger.root = new Logger();
        }
    });

    beforeEach(() => {
        // 清空实例映射
        CacheFactory._instances.clear();
    });

    afterEach(() => {
        CacheFactory._instances.clear();
    });

    describe('create', () => {
        it('should create a memory provider', async () => {
            const provider = await CacheFactory.create('memory');
            expect(provider).toBeInstanceOf(MemoryProvider);
            expect(provider.type).toBe('memory');
        });

        it('should register created provider in instances map', async () => {
            const provider = await CacheFactory.create('memory');
            expect(CacheFactory._instances.has(provider.id)).toBe(true);
            expect(CacheFactory._instances.get(provider.id)).toBe(provider);
        });

        it('should create different instances for multiple calls', async () => {
            const provider1 = await CacheFactory.create('memory');
            const provider2 = await CacheFactory.create('memory');
            expect(provider1.id).not.toBe(provider2.id);
            expect(CacheFactory._instances.size).toBe(2);
        });

        it('should handle offline parameter', async () => {
            const provider = await CacheFactory.create('memory', true);
            expect(provider).toBeInstanceOf(MemoryProvider);
        });

        it('should support different cache types', async () => {
            const localProvider = await CacheFactory.create('local');
            const indexdbProvider = await CacheFactory.create('indexdb');
            const sessionProvider = await CacheFactory.create('session');
            
            expect(localProvider).toBeInstanceOf(MemoryProvider);
            expect(indexdbProvider).toBeInstanceOf(MemoryProvider);
            expect(sessionProvider).toBeInstanceOf(MemoryProvider);
        });
    });

    describe('release', () => {
        it('should release a provider instance', async () => {
            const provider = await CacheFactory.create('memory');
            const providerId = provider.id;
            
            CacheFactory.release(providerId);
            
            expect(CacheFactory._instances.has(providerId)).toBe(false);
        });

        it('should not throw when releasing non-existent provider', () => {
            expect(() => CacheFactory.release('non-existent-id')).not.toThrow();
        });

        it('should clear cache when autoClear is true', async () => {
            const provider = await CacheFactory.create('memory');
            await provider.set('test', 'value');
            
            const clearSpy = jest.spyOn(provider, 'clear');
            
            CacheFactory.release(provider.id, true);
            
            expect(clearSpy).toHaveBeenCalled();
        });

        it('should not clear cache when autoClear is false', async () => {
            const provider = await CacheFactory.create('memory');
            await provider.set('test', 'value');
            
            const clearSpy = jest.spyOn(provider, 'clear');
            
            CacheFactory.release(provider.id, false);
            
            expect(clearSpy).not.toHaveBeenCalled();
        });

        it('should not clear cache by default', async () => {
            const provider = await CacheFactory.create('memory');
            await provider.set('test', 'value');
            
            const clearSpy = jest.spyOn(provider, 'clear');
            
            CacheFactory.release(provider.id);
            
            expect(clearSpy).not.toHaveBeenCalled();
        });
    });

    describe('instance management', () => {
        it('should track multiple instances', async () => {
            const provider1 = await CacheFactory.create('memory');
            const provider2 = await CacheFactory.create('memory');
            const provider3 = await CacheFactory.create('memory');
            
            expect(CacheFactory._instances.size).toBe(3);
            expect(CacheFactory._instances.has(provider1.id)).toBe(true);
            expect(CacheFactory._instances.has(provider2.id)).toBe(true);
            expect(CacheFactory._instances.has(provider3.id)).toBe(true);
        });

        it('should release specific instance without affecting others', async () => {
            const provider1 = await CacheFactory.create('memory');
            const provider2 = await CacheFactory.create('memory');
            
            CacheFactory.release(provider1.id);
            
            expect(CacheFactory._instances.has(provider1.id)).toBe(false);
            expect(CacheFactory._instances.has(provider2.id)).toBe(true);
            expect(CacheFactory._instances.size).toBe(1);
        });
    });
});
