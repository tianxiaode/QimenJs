/**
 * composable 包导出测试
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

import { ComposableBase, AbilityBase } from '@/composable';
import { ComposableRegistrar } from '@/composable/ComposableRegistrar';
import type { IExposeResult } from '@/composable/types/composable';

describe('composable package exports', () => {
    it('should export ComposableBase', () => {
        expect(ComposableBase).toBeDefined();
        expect(typeof ComposableBase).toBe('function');
    });
    
    it('should export AbilityBase', () => {
        expect(AbilityBase).toBeDefined();
        expect(typeof AbilityBase).toBe('function');
    });
    
    it('should allow creating custom ability', () => {
        class CustomAbility extends AbilityBase {
            protected expose(): IExposeResult {
                return {
                    customMethod: () => 'custom-result',
                };
            }
        }
        
        const instance = new CustomAbility();
        expect(CustomAbility.name).toBe('CustomAbility');
    });
    
    it('should allow creating composable with abilities', () => {
        class CustomAbility extends AbilityBase {
            protected expose(): IExposeResult {
                return {
                    customMethod: () => 'custom-result',
                };
            }
        }
        
        class TestComposable extends ComposableBase {
            static readonly abilities = [CustomAbility];
        }
        
        const instance = new TestComposable() as any;
        expect(instance.customMethod()).toBe('custom-result');
    });
});
