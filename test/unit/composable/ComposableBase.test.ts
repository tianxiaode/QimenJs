/**
 * ComposableBase 单元测试
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

import { ComposableBase } from '@/composable/ComposableBase';
import { AbilityBase } from '@/composable/AbilityBase';
import type { IExposeResult, AbilityConstructor } from '@/composable/types/composable';

// 测试能力类
class TestAbility extends AbilityBase {
    protected expose(): IExposeResult {
        return {
            testMethod: () => 'test-result',
            testProperty: { get: () => 'test-value' },
        };
    }
}

class AnotherAbility extends AbilityBase {
    protected expose(): IExposeResult {
        return {
            anotherMethod: () => 'another-result',
        };
    }
}

describe('ComposableBase', () => {
    describe('constructor', () => {
        it('should initialize with a logger', () => {
            class TestComposable extends ComposableBase {}
            const composable = new TestComposable();
            expect(composable.logger).toBeDefined();
        });
    });
    
    describe('static abilities', () => {
        it('should inject abilities from static property', () => {
            class TestComposable extends ComposableBase {
                static readonly abilities = [TestAbility];
            }
            
            const instance = new TestComposable() as any;
            expect(instance.testMethod).toBeDefined();
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.testProperty).toBe('test-value');
        });
        
        it('should inject multiple abilities', () => {
            class TestComposable extends ComposableBase {
                static readonly abilities = [TestAbility, AnotherAbility];
            }
            
            const instance = new TestComposable() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });
    });
    
    describe('inheritance', () => {
        it('should collect abilities from prototype chain', () => {
            class Parent extends ComposableBase {
                static readonly abilities: readonly AbilityConstructor[] = [TestAbility];
            }
            
            class Child extends Parent {
                static readonly abilities: readonly AbilityConstructor[] = [AnotherAbility];
            }
            
            const instance = new Child() as any;
            // 应该同时拥有父类和子类的能力
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });
        
        it('should handle middle class without abilities definition', () => {
            class GrandParent extends ComposableBase {
                static readonly abilities: readonly AbilityConstructor[] = [TestAbility];
            }
            
            // 中间类没有定义 abilities
            class Middle extends GrandParent {}
            
            class Leaf extends Middle {
                static readonly abilities: readonly AbilityConstructor[] = [AnotherAbility];
            }
            
            const leafInstance = new Leaf() as any;
            // Leaf 应该同时拥有 GrandParent 和 Leaf 的能力
            expect(leafInstance.testMethod()).toBe('test-result');
            expect(leafInstance.anotherMethod()).toBe('another-result');
            
            // Middle 实例应该只有 GrandParent 的能力
            const middleInstance = new Middle() as any;
            expect(middleInstance.testMethod()).toBe('test-result');
            expect(middleInstance.anotherMethod).toBeUndefined();
        });
        
        it('should handle class with no abilities', () => {
            class TestComposable extends ComposableBase {}
            const instance = new TestComposable();
            expect(instance).toBeDefined();
        });
    });
    
    describe('getStatic and setStatic', () => {
        it('should store and retrieve static values', () => {
            class TestComposable extends ComposableBase {}
            const composable = new TestComposable();
            composable.setStatic('test-key', 'test-value');
            expect(composable.getStatic('test-key')).toBe('test-value');
        });
        
        it('should return undefined for non-existent keys', () => {
            class TestComposable extends ComposableBase {}
            const composable = new TestComposable();
            expect(composable.getStatic('non-existent')).toBeUndefined();
        });
    });
    
    describe('dispose', () => {
        it('should dispose without errors', () => {
            class TestComposable extends ComposableBase {
                static readonly abilities = [TestAbility];
            }
            const composable = new TestComposable();
            expect(() => composable.dispose()).not.toThrow();
        });
    });
});
