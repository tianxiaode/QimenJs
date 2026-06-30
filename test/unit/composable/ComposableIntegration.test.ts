/**
 * ComposableBase + AbilityBase 集成测试
 *
 * 严格验证能力系统的核心机制：
 * 1. proxy.host / proxy.self 多实例隔离
 * 2. getter/setter 在多宿主间的正确代理
 * 3. 方法 bind 到宿主后 this 指向
 * 4. dispose 逆序销毁 + 销毁后行为
 * 5. onDispose 中 this.host 的正确性
 * 6. DebounceAbilityBase 多宿主防抖隔离
 * 7. 能力冲突（同名属性覆盖）
 * 8. ComposableRegistrar 缓存与多宿主共享
 * 9. 能力继承链收集
 * 10. abilityStates Per-Host State
 * 11. dispose 后 getter 访问安全性
 * 12. 方法中 proxy.host 多实例隔离（已修复）
 * 13. 箭头函数方法中 proxy.host 多实例隔离
 * 14. proxy.self 调用 Ability 方法（getOrCreateState）多实例隔离
 * 15. 完整生命周期测试
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
import { AbilityBase, type AbilityProxy } from '@/composable/AbilityBase';
import { DebounceAbilityBase } from '@/composable/DebounceAbilityBase';
import { ComposableRegistrar } from '@/composable/ComposableRegistrar';
import type { IExposeResult } from '@/composable/types/composable';

// ============================================
// 测试
// ============================================

describe('ComposableBase + AbilityBase 集成测试', () => {
    beforeEach(() => {
        ComposableRegistrar.getInstance().clearCaches();
    });

    // ============================================
    // 1. proxy.host 多实例隔离
    // ============================================

    describe('proxy.host 多实例隔离', () => {
        /** 带状态的能力：通过 proxy.host 访问宿主属性 */
        class StatefulAbility extends AbilityBase {
            protected expose(proxy: AbilityProxy): IExposeResult {
                return {
                    getStateName: () => proxy.host.name,
                    stateValue: { get: () => proxy.host.value },
                };
            }
        }

        class StatefulHost extends ComposableBase {
            static readonly abilities = [StatefulAbility];
            constructor(public name: string, public value: number) {
                super();
            }
        }

        it('getter 在多实例下应该各自返回自己的值（hostRef 闭包隔离）', () => {
            const host1 = new StatefulHost('Host1', 100) as any;
            const host2 = new StatefulHost('Host2', 200) as any;

            // getter 通过独立 hostRef 闭包隔离，多实例安全
            expect(host1.stateValue).toBe(100);
            expect(host2.stateValue).toBe(200);

            host1.dispose();
            host2.dispose();
        });

        it('方法中的 proxy.host 在多实例下应该正确隔离', () => {
            // 修复：wrappedFn 中临时切换 sharedHostRef.value，
            // 确保方法闭包中的 proxy.host 指向正确的宿主
            const host1 = new StatefulHost('Host1', 100) as any;
            const host2 = new StatefulHost('Host2', 200) as any;

            expect(host1.getStateName()).toBe('Host1');
            expect(host2.getStateName()).toBe('Host2');

            host1.dispose();
            host2.dispose();
        });

        it('单实例下 proxy.host 应该正确工作', () => {
            const host = new StatefulHost('Solo', 42) as any;

            expect(host.getStateName()).toBe('Solo');
            expect(host.stateValue).toBe(42);

            host.name = 'Updated';
            host.value = 99;

            expect(host.getStateName()).toBe('Updated');
            expect(host.stateValue).toBe(99);

            host.dispose();
        });
    });

    // ============================================
    // 2. getter/setter 多实例隔离
    // ============================================

    describe('getter/setter 多实例隔离', () => {
        class GetterSetterAbility extends AbilityBase {
            protected expose(proxy: AbilityProxy): IExposeResult {
                return {
                    computedLabel: {
                        get: () => `[${proxy.host.label}]`,
                        set: (v: string) => { proxy.host.label = v; },
                    },
                };
            }
        }

        class LabelHost extends ComposableBase {
            static readonly abilities = [GetterSetterAbility];
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
            expect(host2.label).toBe('B'); // 不受影响

            host1.dispose();
            host2.dispose();
        });

        it('getter 应该响应宿主属性的直接修改', () => {
            const host = new LabelHost('Original') as any;

            expect(host.computedLabel).toBe('[Original]');

            host.label = 'Changed';
            expect(host.computedLabel).toBe('[Changed]');

            host.dispose();
        });
    });

    // ============================================
    // 3. 方法 bind 到宿主
    // ============================================

    describe('方法 bind 到宿主', () => {
        class MethodAbility extends AbilityBase {
            protected expose(proxy: AbilityProxy): IExposeResult {
                return {
                    greet: function (this: any) {
                        return `Hello from ${this.name}`;
                    },
                    getSelfName: function (this: any) {
                        return this.name;
                    },
                };
            }
        }

        class MethodHost extends ComposableBase {
            static readonly abilities = [MethodAbility];
            constructor(public name: string) {
                super();
            }
        }

        it('方法中的 this 应该指向宿主', () => {
            const host = new MethodHost('MyHost') as any;

            expect(host.greet()).toBe('Hello from MyHost');
            expect(host.getSelfName()).toBe('MyHost');

            host.dispose();
        });

        it('多个宿主实例的方法应该各自绑定', () => {
            const host1 = new MethodHost('Host1') as any;
            const host2 = new MethodHost('Host2') as any;

            // 方法 bind 到各自宿主，this 指向正确
            expect(host1.greet()).toBe('Hello from Host1');
            expect(host2.greet()).toBe('Hello from Host2');

            host1.dispose();
            host2.dispose();
        });

        it('方法中 this.host 应该返回宿主自身', () => {
            class ThisHostAbility extends AbilityBase {
                protected expose(): IExposeResult {
                    return {
                        getHostViaThis: function (this: any) {
                            return this.host;
                        },
                    };
                }
            }

            class ThisHost extends ComposableBase {
                static readonly abilities = [ThisHostAbility];
            }

            const host = new ThisHost() as any;

            // this.host 通过 ComposableBase 的 getter 返回 this
            expect(host.getHostViaThis()).toBe(host);

            host.dispose();
        });
    });

    // ============================================
    // 4. dispose 逆序销毁 + 销毁后行为
    // ============================================

    describe('dispose 逆序销毁', () => {
        it('应该按装配逆序执行销毁函数', () => {
            const disposeOrder: number[] = [];

            class OrderAbility1 extends AbilityBase {
                protected expose(): IExposeResult {
                    return { prop1: 'value1' };
                }
                protected onDispose(): void {
                    disposeOrder.push(1);
                }
            }

            class OrderAbility2 extends AbilityBase {
                protected expose(): IExposeResult {
                    return { prop2: 'value2' };
                }
                protected onDispose(): void {
                    disposeOrder.push(2);
                }
            }

            class OrderHost extends ComposableBase {
                static readonly abilities = [OrderAbility1, OrderAbility2];
            }

            const host = new OrderHost();
            host.dispose();

            // 逆序：先销毁 Ability2，再销毁 Ability1
            expect(disposeOrder).toEqual([2, 1]);
        });

        it('多次 dispose 不应该重复执行销毁函数', () => {
            let disposeCount = 0;

            class CountDisposeAbility extends AbilityBase {
                protected expose(): IExposeResult {
                    return { countedProp: 'value' };
                }
                protected onDispose(): void {
                    disposeCount++;
                }
            }

            class CountHost extends ComposableBase {
                static readonly abilities = [CountDisposeAbility];
            }

            const host = new CountHost();
            host.dispose();
            expect(disposeCount).toBe(1);

            host.dispose(); // 第二次 dispose
            expect(disposeCount).toBe(1); // 不应该再增加
        });
    });

    // ============================================
    // 5. onDispose 中 this.host 的正确性
    // ============================================

    describe('onDispose 中 this.host 的正确性', () => {
        it('单实例下 onDispose 中 this.host 应该指向当前宿主', () => {
            let disposedHost: any = null;

            class TrackDisposeAbility extends AbilityBase {
                protected expose(): IExposeResult {
                    return { trackProp: 'value' };
                }
                protected onDispose(): void {
                    disposedHost = this.host;
                }
            }

            class TrackHost extends ComposableBase {
                static readonly abilities = [TrackDisposeAbility];
            }

            const host = new TrackHost();
            host.dispose();

            // onDispose 中 this.host 应该指向被销毁的宿主
            expect(disposedHost).toBe(host);
        });

        it('多实例下 onDispose 中 this.host 应该指向各自宿主', () => {
            const disposedHosts: any[] = [];

            class MultiDisposeAbility extends AbilityBase {
                protected expose(): IExposeResult {
                    return { multiProp: 'value' };
                }
                protected onDispose(): void {
                    disposedHosts.push(this.host);
                }
            }

            class MultiHost extends ComposableBase {
                static readonly abilities = [MultiDisposeAbility];
                constructor(public id: string) {
                    super();
                }
            }

            const host1 = new MultiHost('H1');
            const host2 = new MultiHost('H2');

            host1.dispose();
            host2.dispose();

            // 修复后：onDispose 中 this.host 应该指向各自宿主
            expect(disposedHosts[0]).toBe(host1);
            expect(disposedHosts[1]).toBe(host2);
        });
    });

    // ============================================
    // 6. DebounceAbilityBase 多宿主防抖隔离
    // ============================================

    describe('DebounceAbilityBase 多宿主防抖隔离', () => {
        class TestDebounceAbility extends DebounceAbilityBase {
            protected expose(proxy: AbilityProxy): IExposeResult {
                const debouncedFn = this.getDebouncedAction('test', this.internalAction, 100, true);
                return {
                    debouncedAction: (value: string) => debouncedFn(value),
                };
            }

            private async internalAction(value: string): Promise<string> {
                return `processed:${value}`;
            }
        }

        class DebounceHost extends ComposableBase {
            static readonly abilities = [TestDebounceAbility];
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

        it('多宿主共享时一个宿主 dispose 不应影响其他宿主的防抖', () => {
            // 修复：abilityStates 机制确保每个宿主有独立的 debouncedMap，
            // 一个宿主 dispose 只清理自己的防抖定时器
            const host1 = new DebounceHost() as any;
            const host2 = new DebounceHost() as any;

            host1.dispose();

            // host2 仍然可以正常使用防抖方法
            expect(() => host2.debouncedAction('test')).not.toThrow();

            host2.dispose();
        });
    });

    // ============================================
    // 7. 能力冲突（同名属性覆盖）
    // ============================================

    describe('能力冲突（同名属性覆盖）', () => {
        class ConflictAbilityA extends AbilityBase {
            protected expose(): IExposeResult {
                return {
                    sharedProp: 'from-A',
                    sharedMethod: () => 'method-A',
                };
            }
        }

        class ConflictAbilityB extends AbilityBase {
            protected expose(): IExposeResult {
                return {
                    sharedProp: 'from-B',
                    sharedMethod: () => 'method-B',
                };
            }
        }

        it('后声明的能力应该覆盖先声明的能力同名属性', () => {
            class ConflictHost extends ComposableBase {
                static readonly abilities = [ConflictAbilityA, ConflictAbilityB];
            }

            const host = new ConflictHost() as any;

            // ConflictAbilityB 后声明，其 sharedProp 应该覆盖 A 的
            expect(host.sharedProp).toBe('from-B');
            expect(host.sharedMethod()).toBe('method-B');

            host.dispose();
        });

        it('单独声明的能力应该正常工作', () => {
            class SingleAHost extends ComposableBase {
                static readonly abilities = [ConflictAbilityA];
            }

            const host = new SingleAHost() as any;
            expect(host.sharedProp).toBe('from-A');
            expect(host.sharedMethod()).toBe('method-A');

            host.dispose();
        });
    });

    // ============================================
    // 8. ComposableRegistrar 缓存与多宿主共享
    // ============================================

    describe('ComposableRegistrar 缓存与多宿主共享', () => {
        it('同一 Ability 类在多个宿主间共享预编译缓存', () => {
            class SharedAbility extends AbilityBase {
                protected expose(): IExposeResult {
                    return { sharedMethod: () => 'shared' };
                }
            }

            class Host1 extends ComposableBase {
                static readonly abilities = [SharedAbility];
            }

            class Host2 extends ComposableBase {
                static readonly abilities = [SharedAbility];
            }

            const host1 = new Host1() as any;
            const host2 = new Host2() as any;

            expect(host1.sharedMethod()).toBe('shared');
            expect(host2.sharedMethod()).toBe('shared');

            const registrar = ComposableRegistrar.getInstance();
            expect(registrar.has('SharedAbility')).toBe(true);

            host1.dispose();
            host2.dispose();
        });

        it('clearCaches 后新宿主应该重新预编译', () => {
            class CacheAbility extends AbilityBase {
                protected expose(): IExposeResult {
                    return { cacheMethod: () => 'cached' };
                }
            }

            class CacheHost extends ComposableBase {
                static readonly abilities = [CacheAbility];
            }

            const host1 = new CacheHost() as any;
            expect(host1.cacheMethod()).toBe('cached');
            host1.dispose();

            ComposableRegistrar.getInstance().clearCaches();
            expect(ComposableRegistrar.getInstance().has('CacheAbility')).toBe(false);

            const host2 = new CacheHost() as any;
            expect(host2.cacheMethod()).toBe('cached');

            host2.dispose();
        });
    });

    // ============================================
    // 9. 能力继承链收集
    // ============================================

    describe('能力继承链收集', () => {
        class ParentAbility extends AbilityBase {
            protected expose(): IExposeResult {
                return { parentMethod: () => 'parent' };
            }
        }

        class ChildAbility extends AbilityBase {
            protected expose(): IExposeResult {
                return { childMethod: () => 'child' };
            }
        }

        it('子类应该同时拥有父类和自身的能力', () => {
            class ParentHost extends ComposableBase {
                static readonly abilities: readonly any[] = [ParentAbility];
            }

            class ChildHost extends ParentHost {
                static readonly abilities: readonly any[] = [ChildAbility];
            }

            const child = new ChildHost() as any;

            expect(child.parentMethod()).toBe('parent');
            expect(child.childMethod()).toBe('child');

            child.dispose();
        });

        it('父类实例不应该拥有子类的能力', () => {
            class ParentHost extends ComposableBase {
                static readonly abilities: readonly any[] = [ParentAbility];
            }

            class ChildHost extends ParentHost {
                static readonly abilities: readonly any[] = [ChildAbility];
            }

            const parent = new ParentHost() as any;

            expect(parent.parentMethod()).toBe('parent');
            expect((parent as any).childMethod).toBeUndefined();

            parent.dispose();
        });

        it('能力去重：同一能力不应重复注入', () => {
            class UniqueAbility extends AbilityBase {
                static instanceCount = 0;
                constructor() {
                    super();
                    UniqueAbility.instanceCount++;
                }
                protected expose(): IExposeResult {
                    return { uniqueMethod: () => 'unique' };
                }
            }

            class ParentWithAbility extends ComposableBase {
                static readonly abilities: readonly any[] = [UniqueAbility];
            }

            class ChildWithSameAbility extends ParentWithAbility {
                static readonly abilities: readonly any[] = [UniqueAbility];
            }

            UniqueAbility.instanceCount = 0;
            const child = new ChildWithSameAbility() as any;

            expect(child.uniqueMethod()).toBe('unique');
            expect(UniqueAbility.instanceCount).toBe(1);

            child.dispose();
        });
    });

    // ============================================
    // 10. WeakMap Per-Host State
    // ============================================

    describe('abilityStates Per-Host State', () => {
        interface CounterState {
            count: number;
        }

        class CounterAbility extends AbilityBase {
            private getCounterState(): CounterState {
                return this.getOrCreateState<CounterState>(() => ({ count: 0 }));
            }

            protected expose(proxy: AbilityProxy): IExposeResult {
                return {
                    count: { get: () => proxy.self.getCounterState().count },
                    increment: function (this: any) {
                        proxy.self.getCounterState().count++;
                    },
                };
            }
        }

        class CounterHost extends ComposableBase {
            static readonly abilities = [CounterAbility];
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

        it('getOrCreateState 对首次访问应该创建默认状态', () => {
            const host = new CounterHost() as any;
            expect(host.count).toBe(0);
            host.dispose();
        });

        it('getOrCreateState 应该覆盖已有值', () => {
            const host = new CounterHost() as any;

            host.increment();
            expect(host.count).toBe(1);

            host.increment();
            expect(host.count).toBe(2);

            host.dispose();
        });

        it('onDispose 中仍可访问 abilityStates（在 ComposableBase.dispose 清理之前）', () => {
            // 验证调用顺序：
            // onDispose() 先执行，ComposableBase.dispose() 中 _abilityStates.clear() 后执行
            // 所以 onDispose 中仍可访问 abilityStates
            let stateInDispose: any = null;

            interface StateCheckData {
                test: number;
            }

            class StateCheckAbility extends AbilityBase {
                private getCheckState(): StateCheckData {
                    return this.getOrCreateState<StateCheckData>(() => ({ test: 0 }));
                }

                protected expose(proxy: AbilityProxy): IExposeResult {
                    return {
                        setVal: function (this: any) {
                            proxy.self.getCheckState().test = 42;
                        },
                        getVal: { get: () => proxy.self.getCheckState().test },
                    };
                }
                protected onDispose(): void {
                    // onDispose 在 _abilityStates.clear() 之前调用
                    // 此时 this.host 仍指向当前宿主（单实例场景）
                    stateInDispose = this.getState<StateCheckData>()?.test;
                }
            }

            class StateCheckHost extends ComposableBase {
                static readonly abilities = [StateCheckAbility];
            }

            const host = new StateCheckHost() as any;
            host.setVal();
            expect(host.getVal).toBe(42);

            host.dispose();

            // onDispose 中应该能读取到 abilityStates
            expect(stateInDispose).toBe(42);
        });
    });

    // ============================================
    // 11. dispose 后 getter 访问安全性
    // ============================================

    describe('dispose 后 getter 访问安全性', () => {
        it('dispose 后 getter 仍通过 hostRef 闭包访问宿主（hostRef 未被清空）', () => {
            // getter 的 hostRef 是在 createDescriptorFactory 中独立创建的 { value: host }
            // dispose 时只清空 ability.host = null，但 hostRef.value 仍指向宿主对象
            // 所以 getter 仍然能正常工作——这是设计上的正确行为
            class NullHostAbility extends AbilityBase {
                protected expose(proxy: AbilityProxy): IExposeResult {
                    return {
                        nullProp: { get: () => proxy.host?.name },
                    };
                }
            }

            class NullHost extends ComposableBase {
                static readonly abilities = [NullHostAbility];
                name = 'Alive';
            }

            const host = new NullHost() as any;
            expect(host.nullProp).toBe('Alive');

            host.dispose();

            // getter 通过独立 hostRef 闭包访问，hostRef.value 仍指向宿主
            expect(host.nullProp).toBe('Alive');
        });

        it('dispose 后方法调用不应该崩溃（方法 bind 到宿主，this 仍可用）', () => {
            class SafeMethodAbility extends AbilityBase {
                protected expose(): IExposeResult {
                    return {
                        safeMethod: function (this: any) {
                            // 方法 bind 到宿主，this 仍指向宿主对象
                            return this.name || 'disposed';
                        },
                    };
                }
            }

            class SafeMethodHost extends ComposableBase {
                static readonly abilities = [SafeMethodAbility];
                name = 'Alive';
            }

            const host = new SafeMethodHost() as any;
            expect(host.safeMethod()).toBe('Alive');

            host.dispose();

            // 方法 bind 到宿主，this 仍指向宿主对象
            // 宿主对象本身没有被销毁，只是 Ability 的 host 引用被清空
            expect(host.safeMethod()).toBe('Alive');
        });
    });

    // ============================================
    // 12. 完整生命周期测试
    // ============================================

    describe('完整生命周期测试', () => {
        it('构造 -> 使用 -> 销毁 完整流程', () => {
            const events: string[] = [];

            class LifecycleAbility extends AbilityBase {
                protected expose(proxy: AbilityProxy): IExposeResult {
                    return {
                        lifecycleAction: function (this: any) {
                            events.push('action');
                            return this.name;
                        },
                        lifecycleState: { get: () => proxy.host.state },
                    };
                }

                protected onDispose(): void {
                    events.push('dispose');
                }
            }

            class LifecycleHost extends ComposableBase {
                static readonly abilities = [LifecycleAbility];
                constructor(public name: string, public state: string) {
                    super();
                }
            }

            const host = new LifecycleHost('TestHost', 'active') as any;
            events.push('constructed');

            const result = host.lifecycleAction();
            expect(result).toBe('TestHost');
            expect(host.lifecycleState).toBe('active');
            events.push('used');

            host.dispose();
            events.push('destroyed');

            expect(events).toEqual(['constructed', 'action', 'used', 'dispose', 'destroyed']);
        });
    });

    // ============================================
    // 13. proxy.self 访问 Ability 实例
    // ============================================

    describe('proxy.self 访问 Ability 实例', () => {
        it('通过 proxy.self 可以访问 Ability 的私有属性', () => {
            let capturedSelf: any = null;

            class SelfAccessAbility extends AbilityBase {
                private secret = 'hidden';

                protected expose(proxy: AbilityProxy): IExposeResult {
                    capturedSelf = proxy.self;
                    return {
                        getSecret: () => proxy.self.secret,
                    };
                }
            }

            class SelfHost extends ComposableBase {
                static readonly abilities = [SelfAccessAbility];
            }

            const host = new SelfHost() as any;

            expect(host.getSecret()).toBe('hidden');
            expect(capturedSelf).toBeInstanceOf(SelfAccessAbility);

            host.dispose();
        });
    });

    // ============================================
    // 12. 方法中 proxy.host 多实例隔离（已修复）
    // ============================================

    describe('方法中 proxy.host 多实例隔离', () => {
        class ProxyHostAbility extends AbilityBase {
            protected expose(proxy: AbilityProxy): IExposeResult {
                return {
                    // 普通函数方法：通过 proxy.host 访问宿主
                    getNameViaProxy: function() {
                        return proxy.host.name;
                    },
                    // 箭头函数方法：通过 proxy.host 访问宿主
                    getNameViaArrow: () => proxy.host.name,
                    // 混合：this.host + proxy.host
                    getBoth: function(this: any) {
                        return { viaThis: this.host.name, viaProxy: proxy.host.name };
                    },
                };
            }
        }

        class ProxyHostHost extends ComposableBase {
            static readonly abilities = [ProxyHostAbility];
            constructor(public name: string) {
                super();
            }
        }

        it('普通函数方法中 proxy.host 应该正确隔离', () => {
            const host1 = new ProxyHostHost('H1') as any;
            const host2 = new ProxyHostHost('H2') as any;

            expect(host1.getNameViaProxy()).toBe('H1');
            expect(host2.getNameViaProxy()).toBe('H2');

            host1.dispose();
            host2.dispose();
        });

        it('箭头函数方法中 proxy.host 应该正确隔离', () => {
            const host1 = new ProxyHostHost('H1') as any;
            const host2 = new ProxyHostHost('H2') as any;

            expect(host1.getNameViaArrow()).toBe('H1');
            expect(host2.getNameViaArrow()).toBe('H2');

            host1.dispose();
            host2.dispose();
        });

        it('this.host 和 proxy.host 应该返回相同的宿主', () => {
            const host1 = new ProxyHostHost('H1') as any;
            const host2 = new ProxyHostHost('H2') as any;

            const result1 = host1.getBoth();
            const result2 = host2.getBoth();

            expect(result1.viaThis).toBe('H1');
            expect(result1.viaProxy).toBe('H1');
            expect(result2.viaThis).toBe('H2');
            expect(result2.viaProxy).toBe('H2');

            host1.dispose();
            host2.dispose();
        });

        it('交替调用不应互相干扰', () => {
            const host1 = new ProxyHostHost('H1') as any;
            const host2 = new ProxyHostHost('H2') as any;

            // 交替调用
            expect(host1.getNameViaProxy()).toBe('H1');
            expect(host2.getNameViaProxy()).toBe('H2');
            expect(host1.getNameViaArrow()).toBe('H1');
            expect(host2.getNameViaArrow()).toBe('H2');
            expect(host1.getNameViaProxy()).toBe('H1');

            host1.dispose();
            host2.dispose();
        });
    });

    // ============================================
    // 13. proxy.self 调用 Ability 方法（getOrCreateState）多实例隔离
    // ============================================

    describe('proxy.self 调用 Ability 方法多实例隔离', () => {
        interface ItemState {
            items: string[];
        }

        class ItemAbility extends AbilityBase {
            private getItemState(): ItemState {
                return this.getOrCreateState<ItemState>(() => ({ items: [] }));
            }

            protected expose(proxy: AbilityProxy): IExposeResult {
                return {
                    items: { get: () => proxy.self.getItemState().items },
                    addItem: function(this: any, item: string) {
                        proxy.self.getItemState().items.push(item);
                    },
                    getItemsViaProxy: () => proxy.self.getItemState().items,
                };
            }
        }

        class ItemHost extends ComposableBase {
            static readonly abilities = [ItemAbility];
        }

        it('每个宿主应该有独立的 items 状态', () => {
            const host1 = new ItemHost() as any;
            const host2 = new ItemHost() as any;

            host1.addItem('a');
            host1.addItem('b');
            host2.addItem('c');

            expect(host1.items).toEqual(['a', 'b']);
            expect(host2.items).toEqual(['c']);

            host1.dispose();
            host2.dispose();
        });

        it('getter 和箭头函数方法应该返回相同的状态', () => {
            const host = new ItemHost() as any;

            host.addItem('x');
            expect(host.items).toEqual(['x']);
            expect(host.getItemsViaProxy()).toEqual(['x']);

            host.dispose();
        });

        it('dispose 一个宿主不应影响另一个的状态', () => {
            const host1 = new ItemHost() as any;
            const host2 = new ItemHost() as any;

            host1.addItem('a');
            host2.addItem('b');
            host2.addItem('c');

            host1.dispose();

            expect(host2.items).toEqual(['b', 'c']);
            host2.addItem('d');
            expect(host2.items).toEqual(['b', 'c', 'd']);

            host2.dispose();
        });
    });
});
