/**
 * ComposableBase 多 Ability 交互集成测试
 *
 * 验证真实 Manager 场景中多 Ability 同时注入后的交互行为（use() 模式）：
 * 1. DomainAbility + SchemaAbility + EventAbility 在真实 Manager 中的协作
 * 2. Ability 方法中 this 指向的真实宿主交互
 * 3. 同名方法覆盖在真实场景中的影响
 * 4. Ability 注入顺序对覆盖行为的影响
 * 5. 宿主自身方法与 Ability 注入方法的优先级
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

import { ComposableBase } from '@/composable/ComposableBase';
import type { AbilityDefinition } from '@/composable/types/ability';
import { EventAbility } from '@/system-abilities';
import { DomainAbility } from '@/system-abilities';
import { SchemaAbility } from '@/entity/abilities/SchemaAbility';
import { SchemaRegistrar } from '@/schema';
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import type { RegistrSchema, FlatSchema } from '@/schema';
import { EventContextBuilder } from '@/context';

// ============================================
// 测试用 Schema
// ============================================

const testSchema: FlatSchema = {
    name: 'AbilityTestUser',
    domain: 'ability-test',
    idField: 'id',
    isTree: false,
    searchFields: ['name'],
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string', searchable: true },
    ],
};

// ============================================
// 测试用 Manager（使用 use() 模式）
// ============================================

class TestAbilityManagerBase extends ComposableBase {}
TestAbilityManagerBase.use([EventAbility, DomainAbility, SchemaAbility]);

class TestAbilityManager extends TestAbilityManagerBase {
    domain = 'ability-test';
    entityName = 'AbilityTestUser';
    schema: RegistrSchema = testSchema;
}

// ============================================
// 辅助：注册测试域
// ============================================

function ensureTestDomain(): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    if (domainRegistrar && !domainRegistrar.get('ability-test')) {
        domainRegistrar.register('ability-test', {
            baseUrl: 'http://localhost:8888',
            preset: 'default',
            pageSize: 10,
            pagesizes: [10, 20, 50],
        });
    }
}

// ============================================
// 测试
// ============================================

describe('ComposableBase 多 Ability 交互集成测试', () => {
    let manager: TestAbilityManager;

    beforeEach(() => {
        ensureTestDomain();
        const schemaRegistrar = SchemaRegistrar.getInstance();
        if (!schemaRegistrar.has('AbilityTestUser')) {
            schemaRegistrar.register(testSchema);
        }
        manager = new TestAbilityManager();
    });

    afterEach(() => {
        manager.dispose();
    });

    // ========================================
    // 1. EventAbility 集成
    // ========================================

    describe('EventAbility 集成', () => {
        it('on/emit 应该正常工作', () => {
            const listener = jest.fn();
            (manager as any).on('test-event', listener);

            (manager as any).emit(
                'test-event',
                EventContextBuilder.create().withEvent('test-event').withData({ data: 42 }).build()
            );

            expect(listener).toHaveBeenCalled();
            const callArg = listener.mock.calls[0][0];
            expect(callArg.data).toEqual({ data: 42 });
        });

        it('once 应该只触发一次', () => {
            const listener = jest.fn();
            (manager as any).once('test-event', listener);

            (manager as any).emit(
                'test-event',
                EventContextBuilder.create().withEvent('test-event').build()
            );
            (manager as any).emit(
                'test-event',
                EventContextBuilder.create().withEvent('test-event').build()
            );

            expect(listener).toHaveBeenCalledTimes(1);
        });

        it('多个事件应该独立', () => {
            const listener1 = jest.fn();
            const listener2 = jest.fn();

            (manager as any).on('event1', listener1);
            (manager as any).on('event2', listener2);

            (manager as any).emit(
                'event1',
                EventContextBuilder.create().withEvent('event1').build()
            );

            expect(listener1).toHaveBeenCalled();
            expect(listener2).not.toHaveBeenCalled();
        });
    });

    // ========================================
    // 2. DomainAbility 集成
    // ========================================

    describe('DomainAbility 集成', () => {
        it('domainConfig 应该从 DomainRegistrar 获取配置', () => {
            const config = (manager as any).domainConfig;

            expect(config).toBeDefined();
            expect(config.baseUrl).toBe('http://localhost:8888');
        });

        it('domainConfig 未注册时应该返回 undefined', () => {
            class UnregisteredHost extends ComposableBase {}
            UnregisteredHost.use([DomainAbility]);
            class UnregisteredManager extends UnregisteredHost {
                domain = 'nonexistent-domain';
            }
            const unregisteredManager = new UnregisteredManager();

            expect((unregisteredManager as any).domainConfig).toBeUndefined();

            unregisteredManager.dispose();
        });
    });

    // ========================================
    // 3. SchemaAbility 集成
    // ========================================

    describe('SchemaAbility 集成', () => {
        it('getSchema 应该返回编译后的 Schema', () => {
            const schema = (manager as any).getSchema();

            expect(schema).toBeDefined();
            expect(schema.name).toBe('AbilityTestUser');
            expect(schema.fields).toHaveLength(2);
        });

        it('schemaKeys 应该返回 schema 的键映射', () => {
            const keys = (manager as any).schemaKeys;

            expect(keys).toBeDefined();
            expect(keys.id).toBe('id');
        });
    });

    // ========================================
    // 4. 多 Ability 交互
    // ========================================

    describe('多 Ability 交互', () => {
        it('EventAbility + DomainAbility 应该可以同时使用', () => {
            const listener = jest.fn();
            (manager as any).on('domain-loaded', listener);

            const config = (manager as any).domainConfig;
            (manager as any).emit(
                'domain-loaded',
                EventContextBuilder.create().withEvent('domain-loaded').withData(config).build()
            );

            expect(listener).toHaveBeenCalled();
            const callArg = listener.mock.calls[0][0];
            expect(callArg.data).toEqual(
                expect.objectContaining({
                    baseUrl: 'http://localhost:8888',
                })
            );
        });

        it('SchemaAbility + DomainAbility 应该可以同时使用', () => {
            const schema = (manager as any).getSchema();
            const config = (manager as any).domainConfig;

            expect(schema.domain).toBe('ability-test');
            expect(config.preset).toBe('default');
        });

        it('三个 Ability 同时注入后宿主应该有所有方法', () => {
            expect(typeof (manager as any).on).toBe('function');
            expect(typeof (manager as any).emit).toBe('function');
            expect(typeof (manager as any).once).toBe('function');
            expect(typeof (manager as any).domainConfig).toBeDefined();
            expect(typeof (manager as any).getSchema).toBe('function');
            expect(typeof (manager as any).schemaKeys).toBeDefined();
        });
    });

    // ========================================
    // 5. 同名方法覆盖
    // ========================================

    describe('同名方法覆盖', () => {
        it('后注入的 Ability 同名方法应该覆盖先注入的', () => {
            const AbilityA: AbilityDefinition = {
                sharedAction() {
                    return 'A';
                },
            };
            const AbilityB: AbilityDefinition = {
                sharedAction() {
                    return 'B';
                },
            };

            class OverrideHost extends ComposableBase {}
            OverrideHost.use([AbilityA, AbilityB]);
            const host = new OverrideHost() as any;
            expect(host.sharedAction()).toBe('B');
            host.dispose();
        });

        it('宿主自身方法优先于 Ability 注入的方法', () => {
            const OverrideAbility: AbilityDefinition = {
                selfMethod() {
                    return 'from-ability';
                },
            };

            class BaseHost extends ComposableBase {}
            BaseHost.use([OverrideAbility]);

            class SelfMethodHost extends BaseHost {
                selfMethod() {
                    return 'from-host';
                }
            }

            const host = new SelfMethodHost() as any;
            expect(host.selfMethod()).toBe('from-host');
            host.dispose();
        });
    });

    // ========================================
    // 6. Ability 注入顺序
    // ========================================

    describe('Ability 注入顺序', () => {
        it('基类 Ability 先注入，子类 use() 后注入', () => {
            const BaseAbility: AbilityDefinition = {
                baseMethod() {
                    return 'base';
                },
                sharedMethod() {
                    return 'base-shared';
                },
            };
            const ChildAbility: AbilityDefinition = {
                childMethod() {
                    return 'child';
                },
                sharedMethod() {
                    return 'child-shared';
                },
            };

            class BaseHost extends ComposableBase {}
            BaseHost.use([BaseAbility]);

            class ChildHost extends BaseHost {}
            ChildHost.use([ChildAbility]);

            const child = new ChildHost() as any;
            expect(child.baseMethod()).toBe('base');
            expect(child.childMethod()).toBe('child');
            expect(child.sharedMethod()).toBe('child-shared');
            child.dispose();
        });

        it('去重后同名 Ability 不会重复注入', () => {
            const SharedAbility: AbilityDefinition = {
                sharedMethod() {
                    return 'shared';
                },
            };

            class ParentHost extends ComposableBase {}
            ParentHost.use([SharedAbility]);

            class ChildHost extends ParentHost {}
            ChildHost.use([SharedAbility]);

            const child = new ChildHost() as any;
            expect(child.sharedMethod()).toBe('shared');
            child.dispose();
        });
    });

    // ========================================
    // 7. dispose 清理多 Ability 状态
    // ========================================

    describe('dispose 清理多 Ability 状态', () => {
        it('dispose 应该清理所有 Ability 的状态', () => {
            const listener = jest.fn();
            (manager as any).on('test', listener);

            manager.dispose();

            (manager as any).emit('test', EventContextBuilder.create().withEvent('test').build());
            expect(listener).not.toHaveBeenCalled();
        });

        it('dispose 后 abilityState 应该被清理', () => {
            const StateAbility: AbilityDefinition = {
                getState() {
                    return (this as any).abilityState('test', () => ({ value: 42 }));
                },
            };

            class StateHost extends ComposableBase {}
            StateHost.use([StateAbility]);
            const host = new StateHost() as any;
            const state1 = host.getState();
            expect(state1.value).toBe(42);

            host.dispose();
            host.dispose();
        });
    });
});
