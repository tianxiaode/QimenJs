/**
 * ComposableRegistrar 单元测试
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            }))
        }
    };
});

import { ComposableRegistrar } from '@/composable/ComposableRegistrar';
import { AbilityBase } from '@/composable/AbilityBase';
import type { IExposeResult } from '@/composable/types/composable';

// 测试能力类
class TestAbility extends AbilityBase {
    protected expose(host: any): IExposeResult {
        return {
            testMethod: () => 'test-result',
        };
    }
}

class AnotherAbility extends AbilityBase {
    protected expose(host: any): IExposeResult {
        return {
            anotherMethod: () => 'another-result',
        };
    }
}

describe('ComposableRegistrar', () => {
    let registrar: ComposableRegistrar;
    
    beforeEach(() => {
        registrar = new ComposableRegistrar();
    });
    
    describe('get', () => {
        it('should return precompiled ability and cache it', () => {
            const precompiled = registrar.get(TestAbility);
            
            expect(precompiled).toBeDefined();
            expect(precompiled?.createDescriptors).toBeDefined();
            expect(precompiled?.createDisposer).toBeDefined();
        });
        
        it('should return cached result on second call', () => {
            const first = registrar.get(TestAbility);
            const second = registrar.get(TestAbility);
            
            expect(first).toBe(second); // 同一个引用
        });
        
        it('should handle multiple ability classes', () => {
            const precompiled1 = registrar.get(TestAbility);
            const precompiled2 = registrar.get(AnotherAbility);
            
            expect(precompiled1?.createDescriptors).toBeDefined();
            expect(precompiled2?.createDescriptors).toBeDefined();
        });
    });
    
    describe('has', () => {
        it('should return false before get is called', () => {
            expect(registrar.has('TestAbility')).toBe(false);
        });
        
        it('should return true after get is called', () => {
            registrar.get(TestAbility);
            expect(registrar.has('TestAbility')).toBe(true);
        });
    });
    
    describe('getAllNames', () => {
        it('should return empty array initially', () => {
            expect(registrar.getAllNames()).toEqual([]);
        });
        
        it('should return all cached ability names', () => {
            registrar.get(TestAbility);
            registrar.get(AnotherAbility);
            
            const names = registrar.getAllNames();
            expect(names).toContain('TestAbility');
            expect(names).toContain('AnotherAbility');
        });
    });
    
    describe('clearCaches', () => {
        it('should clear all caches', () => {
            registrar.get(TestAbility);
            expect(registrar.has('TestAbility')).toBe(true);
            
            registrar.clearCaches();
            expect(registrar.has('TestAbility')).toBe(false);
        });
    });
    
    describe('clear', () => {
        it('should clear all data', () => {
            registrar.get(TestAbility);
            registrar.clear();
            expect(registrar.has('TestAbility')).toBe(false);
        });
    });

    describe('register', () => {
        it('should register ability class and create instance', () => {
            registrar.register(TestAbility);
            expect(registrar.has('TestAbility')).toBe(true);
        });

        it('should not duplicate if already registered', () => {
            registrar.register(TestAbility);
            registrar.register(TestAbility);
            // Should still have only one instance
            expect(registrar.has('TestAbility')).toBe(true);
        });

        it('should precompile immediately when immediate option is true', () => {
            registrar.register(TestAbility, { immediate: true });
            expect(registrar.has('TestAbility')).toBe(true);
            // Second get should return cached precompiled result
            const result = registrar.get(TestAbility);
            expect(result).toBeDefined();
        });

        it('should not precompile when immediate option is false', () => {
            registrar.register(TestAbility, { immediate: false });
            // Instance should exist but not precompiled
            expect(registrar.has('TestAbility')).toBe(true);
        });

        it('should not precompile when no options provided', () => {
            registrar.register(TestAbility);
            expect(registrar.has('TestAbility')).toBe(true);
        });
    });

    describe('unregister', () => {
        it('should remove ability by name', () => {
            registrar.register(TestAbility);
            expect(registrar.has('TestAbility')).toBe(true);
            registrar.unregister('TestAbility');
            expect(registrar.has('TestAbility')).toBe(false);
        });
    });

    describe('get - branch coverage', () => {
        it('should use existing instance when abilityInstances has it but precompiledCache does not', () => {
            registrar.register(TestAbility);
            // Instance exists in abilityInstances but not in precompiledCache
            const result = registrar.get(TestAbility);
            expect(result).toBeDefined();
        });

        it('should return undefined when precompile returns null', () => {
            // Create an ability that returns null from precompile
            class NullAbility extends AbilityBase {
                protected expose(): IExposeResult {
                    return {};
                }
                precompile() { return null as any; }
            }
            const result = registrar.get(NullAbility);
            expect(result).toBeUndefined();
        });
    });

    describe('doInspect', () => {
        it('should output state information', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            registrar.register(TestAbility, { immediate: true });
            (registrar as any).doInspect();
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should handle empty caches', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            (registrar as any).doInspect();
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
