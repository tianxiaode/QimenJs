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
            })),
        },
    };
});

import { ComposableBase, type AbilityDefinition } from '@/composable';

describe('composable package exports', () => {
    it('should export ComposableBase', () => {
        expect(ComposableBase).toBeDefined();
        expect(typeof ComposableBase).toBe('function');
    });

    it('should allow creating composable with use()', () => {
        const CustomAbility: AbilityDefinition = {
            customMethod: () => 'custom-result',
        };

        class TestComposable extends ComposableBase {}
        TestComposable.use([CustomAbility]);
        const instance = new TestComposable() as any;
        expect(instance.customMethod()).toBe('custom-result');
    });
});
