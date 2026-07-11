/**
 * ComponentBase 单元测试
 *
 * 验证：
 * 1. ComponentBase 继承 ComposableBase
 * 2. initElement() 创建 el
 * 3. with() 后 initElement 仍然可用
 * 4. with() 后基类方法仍然可用
 * 5. with() 数组参数兼容
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

import { ComponentBase, COMPONENT_BASE_ABILITIES } from '@/component-core';
import { ChildrenAbility } from '@/component-abilities';
import type { AbilityDefinition } from '@/composable';

// 测试用能力
const TestRouteAbility: AbilityDefinition = {
    setupRoute(config: any) {
        return config;
    },
};

describe('ComponentBase', () => {
    describe('继承关系', () => {
        it('ComponentBase 应该是 ComposableBase 的子类', () => {
            const instance = new ComponentBase();
            expect(instance).toBeDefined();
            expect(typeof instance.abilityState).toBe('function');
            expect(typeof instance.dispose).toBe('function');
        });

        it('ComponentBase 应该有 COMPONENT_BASE_ABILITIES', () => {
            expect(COMPONENT_BASE_ABILITIES).toBeDefined();
            expect(Array.isArray(COMPONENT_BASE_ABILITIES)).toBe(true);
            expect(COMPONENT_BASE_ABILITIES.length).toBeGreaterThan(0);
        });
    });

    describe('initElement()', () => {
        it('initElement 应该在原型上', () => {
            expect(typeof ComponentBase.prototype.initElement).toBe('function');
        });

        it('调用 initElement 应该创建 el', () => {
            const instance = new ComponentBase();
            instance.type = 'VBox';
            instance.initElement();
            expect(instance.el).toBeDefined();
            expect(instance.el instanceof HTMLElement).toBe(true);
        });

        it('initElement 后 el 的标签应该是 div', () => {
            const instance = new ComponentBase();
            instance.type = 'VBox';
            instance.initElement();
            expect(instance.el.tagName).toBe('DIV');
        });
    });

    describe('with() 后方法保留', () => {
        it('ComponentBase.with() 后 initElement 应该可用', () => {
            const ForgedClass = ComponentBase.with(TestRouteAbility);

            // 检查原型
            expect(typeof ForgedClass.prototype.initElement).toBe('function');

            // 检查实例
            const instance = new ForgedClass();
            expect(typeof instance.initElement).toBe('function');
        });

        it('ComponentBase.with() 后调用 initElement 应该正常工作', () => {
            const ForgedClass = ComponentBase.with(TestRouteAbility);
            const instance = new ForgedClass();
            instance.type = 'VBox';
            instance.initElement();
            expect(instance.el).toBeDefined();
            expect(instance.el instanceof HTMLElement).toBe(true);
        });

        it('ComponentBase.with() 后 ComposableBase 方法应该可用', () => {
            const ForgedClass = ComponentBase.with(TestRouteAbility);
            const instance = new ForgedClass();

            expect(typeof instance.abilityState).toBe('function');
            expect(typeof instance.setAbilityState).toBe('function');
            expect(typeof instance.setupAbilities).toBe('function');
            expect(typeof instance.onCleanup).toBe('function');
            expect(typeof instance.dispose).toBe('function');
            expect(typeof instance.debounce).toBe('function');
            expect(typeof instance.getStatic).toBe('function');
            expect(typeof instance.setStatic).toBe('function');
            expect(instance.host).toBe(instance);
        });

        it('ComponentBase.with() 后注入的能力方法应该可用', () => {
            const ForgedClass = ComponentBase.with(TestRouteAbility);
            const instance = new ForgedClass() as any;
            expect(typeof instance.setupRoute).toBe('function');
        });

        it('ComponentBase.with(A, B) 多个能力应该都可用', () => {
            const ForgedClass = ComponentBase.with(TestRouteAbility, ChildrenAbility);
            const instance = new ForgedClass() as any;

            // ComponentBase 方法
            expect(typeof instance.initElement).toBe('function');

            // 注入的能力方法
            expect(typeof instance.setupRoute).toBe('function');
            expect(typeof instance.add).toBe('function');
        });

        it('ComponentBase.with(array) 数组参数兼容', () => {
            const abilities = [TestRouteAbility, ChildrenAbility];
            const ForgedClass = ComponentBase.with(abilities);
            const instance = new ForgedClass() as any;

            expect(typeof instance.initElement).toBe('function');
            expect(typeof instance.setupRoute).toBe('function');
            expect(typeof instance.add).toBe('function');
        });
    });

    describe('extends with() 类', () => {
        it('extends ComponentBase.with() 后 initElement 应该可用', () => {
            const AppContainer = ComponentBase.with(TestRouteAbility, ChildrenAbility);

            class MyApp extends AppContainer {
                myMethod() {
                    return 'my';
                }
            }

            const instance = new MyApp();
            expect(typeof instance.initElement).toBe('function');
            instance.type = 'VBox';
            instance.initElement();
            expect(instance.el).toBeDefined();
            expect((instance as any).myMethod()).toBe('my');
        });
    });
});
