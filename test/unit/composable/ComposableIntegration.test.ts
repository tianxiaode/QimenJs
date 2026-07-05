/**
 * ComposableBase 集成测试
 *
 * 验证能力系统的核心机制（新架构）：
 * 1. getter/setter 在多宿主间的正确代理
 * 2. 方法 bind 到宿主后 this 指向
 * 3. dispose 清理
 * 4. debounce 多宿主防抖隔离
 * 5. 能力冲突（同名属性覆盖）
 * 6. 能力继承链收集
 * 7. abilityState Per-Host State
 * 8. 完整生命周期测试
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

import { ComposableBase, type AbilityDefinition } from '@/composable/ComposableBase';

// ============================================
// 测试
// ============================================

describe('ComposableBase 集成测试', () => {
    // ============================================
    // 1. getter/setter 多实例隔离
    // ============================================

    describe('getter/setter 多实例隔离', () => {
        const GetterSetterDef: AbilityDefinition = {
            computedLabel: {
                get() {
                    return `[${this.label}]`;
                },
                set(v: string) {
                    this.label = v;
                },
            },
        };

        class LabelHost extends ComposableBase {
            static readonly abilities = [GetterSetterDef];
            constructor(public label: string) {
                super();
            }
        }

        it('多个宿主实例的 getter 应该各自返回自己的值', () => {
            const host1 = new LabelHost('Label1') as any;
            const host2 = new LabelHost('Label2') as any;

            expect(host1.computedLabel).toBe('[Label1]');
            expect(host2.computedLabel).toBe('[Label2]');

            host1.dispose();
            host2.dispose();
        });

        it('setter 应该修改对应宿主的属性', () => {
            const host1 = new LabelHost('A') as any;
            const host2 = new LabelHost('B') as any;

            host1.computedLabel = 'X';

            expect(host1.label).toBe('X');
            expect(host2.label).toBe('B');

            host1.dispose();
            host2.dispose();
        });
    });

    // ============================================
    // 2. 方法 bind 到宿主
    // ============================================

    describe('方法 bind 到宿主', () => {
        const MethodDef: AbilityDefinition = {
            greet() {
                return `Hello from ${this.name}`;
            },
        };

        class MethodHost extends ComposableBase {
            static readonly abilities = [MethodDef];
            constructor(public name: string) {
                super();
            }
        }

        it('方法中的 this 应该指向宿主', () => {
            const host = new MethodHost('MyHost') as any;
            expect(host.greet()).toBe('Hello from MyHost');
            host.dispose();
        });

        it('多个宿主实例的方法应该各自绑定', () => {
            const host1 = new MethodHost('Host1') as any;
            const host2 = new MethodHost('Host2') as any;

            expect(host1.greet()).toBe('Hello from Host1');
            expect(host2.greet()).toBe('Hello from Host2');

            host1.dispose();
            host2.dispose();
        });

        it('方法中 this.host 应该返回宿主自身', () => {
            const ThisHostDef: AbilityDefinition = {
                getHostViaThis() {
                    return this.host;
                },
            };

            class ThisHost extends ComposableBase {
                static readonly abilities = [ThisHostDef];
            }

            const host = new ThisHost() as any;
            expect(host.getHostViaThis()).toBe(host);
            host.dispose();
        });
    });

    // ============================================
    // 3. dispose 清理
    // ============================================

    describe('dispose 清理', () => {
        it('应该执行 onCleanup 注册的回调', () => {
            const cleanupOrder: number[] = [];

            const CleanupDef1: AbilityDefinition = {
                _init1() {
                    this.onCleanup(() => cleanupOrder.push(1));
                },
            };
            const CleanupDef2: AbilityDefinition = {
                _init2() {
                    this.onCleanup(() => cleanupOrder.push(2));
                },
            };

            class OrderHost extends ComposableBase {
                static readonly abilities = [CleanupDef1, CleanupDef2];
            }

            const host = new OrderHost() as any;
            host._init1();
            host._init2();
            host.dispose();

            expect(cleanupOrder).toEqual([2, 1]);
        });
    });

    // ============================================
    // 4. debounce 多宿主防抖隔离
    // ============================================

    describe('debounce 多宿主防抖隔离', () => {
        const TestDebounceDef: AbilityDefinition = {
            debouncedAction(value: string) {
                return this.debounce('test', () => `processed:${value}`, 100, true)();
            },
        };

        class DebounceHost extends ComposableBase {
            static readonly abilities = [TestDebounceDef];
        }

        it('应该正确注入防抖方法', () => {
            const host = new DebounceHost() as any;
            expect(typeof host.debouncedAction).toBe('function');
            host.dispose();
        });

        it('dispose 应该取消所有防抖定时器', () => {
            const host = new DebounceHost() as any;
            host.debouncedAction('test');
            expect(() => host.dispose()).not.toThrow();
        });
    });

    // ============================================
    // 5. 能力冲突（同名属性覆盖）
    // ============================================

    describe('能力冲突（同名属性覆盖）', () => {
        const ConflictDefA: AbilityDefinition = {
            sharedProp: 'from-A',
            sharedMethod: () => 'method-A',
        };
        const ConflictDefB: AbilityDefinition = {
            sharedProp: 'from-B',
            sharedMethod: () => 'method-B',
        };

        it('后声明的能力应该覆盖先声明的能力同名属性', () => {
            class ConflictHost extends ComposableBase {
                static readonly abilities = [ConflictDefA, ConflictDefB];
            }

            const host = new ConflictHost() as any;
            expect(host.sharedProp).toBe('from-B');
            expect(host.sharedMethod()).toBe('method-B');
            host.dispose();
        });
    });

    // ============================================
    // 6. 能力继承链收集
    // ============================================

    describe('能力继承链收集', () => {
        const ParentDef: AbilityDefinition = {
            parentMethod: () => 'parent',
        };
        const ChildDef: AbilityDefinition = {
            childMethod: () => 'child',
        };

        it('子类应该同时拥有父类和自身的能力', () => {
            class ParentHost extends ComposableBase {
                static readonly abilities: readonly any[] = [ParentDef];
            }
            class ChildHost extends ParentHost {
                static readonly abilities: readonly any[] = [ChildDef];
            }

            const child = new ChildHost() as any;
            expect(child.parentMethod()).toBe('parent');
            expect(child.childMethod()).toBe('child');
            child.dispose();
        });

        it('父类实例不应该拥有子类的能力', () => {
            class ParentHost extends ComposableBase {
                static readonly abilities: readonly any[] = [ParentDef];
            }
            class ChildHost extends ParentHost {
                static readonly abilities: readonly any[] = [ChildDef];
            }

            const parent = new ParentHost() as any;
            expect(parent.parentMethod()).toBe('parent');
            expect((parent as any).childMethod).toBeUndefined();
            parent.dispose();
        });
    });

    // ============================================
    // 7. abilityState Per-Host State
    // ============================================

    describe('abilityState Per-Host State', () => {
        const CounterDef: AbilityDefinition = {
            count: {
                get() {
                    const state = this.abilityState('Counter:state', () => ({ count: 0 }))!;
                    return state.count;
                },
            },
            increment() {
                const state = this.abilityState('Counter:state', () => ({ count: 0 }))!;
                state.count++;
            },
        };

        class CounterHost extends ComposableBase {
            static readonly abilities = [CounterDef];
        }

        it('每个宿主应该有独立的状态', () => {
            const host1 = new CounterHost() as any;
            const host2 = new CounterHost() as any;

            expect(host1.count).toBe(0);
            expect(host2.count).toBe(0);

            host1.increment();
            host1.increment();
            host2.increment();

            expect(host1.count).toBe(2);
            expect(host2.count).toBe(1);

            host1.dispose();
            host2.dispose();
        });

        it('dispose 应该只清理对应宿主的状态', () => {
            const host1 = new CounterHost() as any;
            const host2 = new CounterHost() as any;

            host1.increment();
            host2.increment();
            host2.increment();

            host1.dispose();
            expect(host2.count).toBe(2);
            expect(() => host2.increment()).not.toThrow();

            host2.dispose();
        });
    });

    // ============================================
    // 8. 完整生命周期测试
    // ============================================

    describe('完整生命周期测试', () => {
        it('构造 -> 使用 -> 销毁 完整流程', () => {
            const events: string[] = [];

            const LifecycleDef: AbilityDefinition = {
                lifecycleAction() {
                    events.push('action');
                    return this.name;
                },
            };

            class LifecycleHost extends ComposableBase {
                static readonly abilities = [LifecycleDef];
                constructor(public name: string) {
                    super();
                }
            }

            const host = new LifecycleHost('TestHost') as any;
            events.push('constructed');

            const result = host.lifecycleAction();
            expect(result).toBe('TestHost');
            events.push('used');

            host.dispose();
            events.push('destroyed');

            expect(events).toEqual(['constructed', 'action', 'used', 'destroyed']);
        });
    });
});
