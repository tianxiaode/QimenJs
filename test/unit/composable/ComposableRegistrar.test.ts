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
    readonly name = 'TestAbility';
    protected expose(): IExposeResult {
        return {
            testMethod: () => 'test-result',
        };
    }
}

class AnotherAbility extends AbilityBase {
    readonly name = 'AnotherAbility';
    protected expose(): IExposeResult {
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
            expect(precompiled?.name).toBe('TestAbility');
            expect(precompiled?.descriptorFactories).toBeDefined();
            expect(precompiled?.descriptorFactories.has('testMethod')).toBe(true);
        });
        
        it('should return cached result on second call', () => {
            const first = registrar.get(TestAbility);
            const second = registrar.get(TestAbility);
            
            expect(first).toBe(second); // 同一个引用
        });
        
        it('should handle multiple ability classes', () => {
            const precompiled1 = registrar.get(TestAbility);
            const precompiled2 = registrar.get(AnotherAbility);
            
            expect(precompiled1?.name).toBe('TestAbility');
            expect(precompiled2?.name).toBe('AnotherAbility');
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
});
