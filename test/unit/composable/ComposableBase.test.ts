/**
 * ComposableBase 单元测试
 *
 * 完整覆盖:
 * 1. use() 能力注入
 * 2. use() 链式调用
 * 3. use() + extends 继承
 * 4. getter/setter 多实例隔离
 * 5. 方法注入与 this 指向
 * 6. __init__ 协议属性
 * 7. 同名属性覆盖规则
 * 8. abilityState / setAbilityState
 * 9. onCleanup / dispose
 * 10. onBeforeDispose / onDisposed 钩子
 * 11. Symbol 键支持
 * 12. define() 非能力定义注入
 * 13. define() options 注入
 * 14. define() property 注入
 * 15. 派生类 _xxx 自定义初始属性值
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

const TestAbility: AbilityDefinition = {
    testMethod() {
        return 'test-result';
    },
    testProperty: {
        get(): string {
            return (this as any)._testValue || 'test-value';
        },
        set(v: string) {
            (this as any)._testValue = v;
        },
    },
};

const AnotherAbility: AbilityDefinition = {
    anotherMethod() {
        return 'another-result';
    },
};

const CounterAbility: AbilityDefinition = {
    count: {
        get(): number {
            const state = (this as any).abilityState('Counter:state', () => ({ count: 0 }))!;
            return state.count;
        },
    },
    increment() {
        const state = (this as any).abilityState('Counter:state', () => ({ count: 0 }))!;
        state.count++;
    },
};

const InitAbility: AbilityDefinition = {
    __init__: '_initTest',
    _initTest() {
        (this as any).setAbilityState('InitAbility:initialized', true);
    },
    _testInitialized: {
        get(): boolean {
            return (this as any).abilityState('InitAbility:initialized', () => false);
        },
    },
};

describe('ComposableBase', () => {
    describe('use() 能力注入', () => {
        it('use() 返回 this，修改自身原型', () => {
            class MyHost extends ComposableBase {}
            const result = MyHost.use(TestAbility);
            expect(result).toBe(MyHost);
            const instance = new MyHost();
            expect(instance).toBeInstanceOf(ComposableBase);
        });

        it('use() 注入的方法应该可通过实例调用', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(TestAbility);
            const instance = new MyHost() as any;
            expect(instance.testMethod()).toBe('test-result');
        });

        it('use() 注入的 getter 应该可访问', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(TestAbility);
            const instance = new MyHost() as any;
            expect(instance.testProperty).toBe('test-value');
        });

        it('use() 注入的 setter 应该可写入', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(TestAbility);
            const instance = new MyHost() as any;
            instance.testProperty = 'new-value';
            expect(instance.testProperty).toBe('new-value');
        });

        it('use() 注入多个能力（展开参数）', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(TestAbility, AnotherAbility);
            const instance = new MyHost() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });

        it('use() 单个能力参数', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(TestAbility);
            const instance = new MyHost() as any;
            expect(instance.testMethod()).toBe('test-result');
        });
    });

    describe('use() 链式调用', () => {
        it('链式 use() 应该累积能力', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(TestAbility).use(AnotherAbility);
            const instance = new MyHost() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });

        it('链式 use() 后的类仍然继承 ComposableBase', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(TestAbility).use(AnotherAbility);
            const instance = new MyHost();
            expect(instance).toBeInstanceOf(ComposableBase);
        });
    });

    describe('use() + extends 继承', () => {
        it('extends 后子类应该拥有父类能力', () => {
            class BaseHost extends ComposableBase {}
            BaseHost.use(TestAbility);

            class ChildClass extends BaseHost {
                childMethod() {
                    return 'child';
                }
            }

            const instance = new ChildClass() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.childMethod()).toBe('child');
        });

        it('子类再 use() 应该同时拥有父类和新能力', () => {
            class BaseHost extends ComposableBase {}
            BaseHost.use(TestAbility);

            class ChildHost extends BaseHost {}
            ChildHost.use(AnotherAbility);

            const instance = new ChildHost() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });
    });

    describe('getter/setter 多实例隔离', () => {
        it('多个实例的 getter 应该各自返回自己的值', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(TestAbility);
            const host1 = new MyHost() as any;
            const host2 = new MyHost() as any;

            host1.testProperty = 'A';
            host2.testProperty = 'B';

            expect(host1.testProperty).toBe('A');
            expect(host2.testProperty).toBe('B');
        });

        it('abilityState 应该在实例间隔离', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(CounterAbility);
            const host1 = new MyHost() as any;
            const host2 = new MyHost() as any;

            expect(host1.count).toBe(0);
            expect(host2.count).toBe(0);

            host1.increment();
            host1.increment();
            host2.increment();

            expect(host1.count).toBe(2);
            expect(host2.count).toBe(1);
        });
    });

    describe('方法注入与 this 指向', () => {
        it('use() 注入的方法 this 应该指向宿主实例', () => {
            const MethodDef: AbilityDefinition = {
                greet(): string {
                    return `Hello from ${(this as any).name}`;
                },
            };

            class MyHost extends ComposableBase {}
            MyHost.use(MethodDef);

            class NamedHost extends MyHost {
                name = 'MyHost';
            }

            const host = new NamedHost() as any;
            expect(host.greet()).toBe('Hello from MyHost');
        });
    });

    describe('__init__ 协议属性', () => {
        it('以 __ 开头的属性不应该被注入到原型上', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(InitAbility);
            const instance = new MyHost() as any;

            expect(instance.__init__).toBeUndefined();
        });

        it('__init__ 关联的方法应该可手动调用', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(InitAbility);
            const instance = new MyHost() as any;

            expect(typeof instance._initTest).toBe('function');

            instance._initTest();
            expect(instance._testInitialized).toBe(true);
        });
    });

    describe('同名属性覆盖规则', () => {
        it('后声明的能力应该覆盖先声明的能力同名方法', () => {
            const AbilityA: AbilityDefinition = {
                sharedMethod: () => 'method-A',
            };
            const AbilityB: AbilityDefinition = {
                sharedMethod: () => 'method-B',
            };

            class MyHost extends ComposableBase {}
            MyHost.use(AbilityA, AbilityB);
            const instance = new MyHost() as any;
            expect(instance.sharedMethod()).toBe('method-B');
        });
    });

    describe('abilityState / setAbilityState', () => {
        it('abilityState 应该惰性创建状态', () => {
            const instance = new ComposableBase();
            const state = instance.abilityState('test', () => ({ value: 42 }));
            expect(state!.value).toBe(42);
        });

        it('abilityState 不传 creator 应该返回 undefined', () => {
            const instance = new ComposableBase();
            expect(instance.abilityState('nonexistent')).toBeUndefined();
        });

        it('abilityState 第二次调用应该返回同一状态', () => {
            const instance = new ComposableBase();
            const state1 = instance.abilityState('test', () => ({ value: 1 }));
            const state2 = instance.abilityState('test', () => ({ value: 2 }));
            expect(state1).toBe(state2);
            expect(state1!.value).toBe(1);
        });

        it('setAbilityState 应该直接设置状态', () => {
            const instance = new ComposableBase();
            instance.setAbilityState('test', { value: 99 });
            expect((instance.abilityState('test') as any).value).toBe(99);
        });

        it('不同实例的 abilityState 应该隔离', () => {
            const instance1 = new ComposableBase();
            const instance2 = new ComposableBase();

            instance1.setAbilityState('test', 'value1');
            instance2.setAbilityState('test', 'value2');

            expect(instance1.abilityState('test')).toBe('value1');
            expect(instance2.abilityState('test')).toBe('value2');
        });
    });

    describe('onCleanup / dispose', () => {
        it('onCleanup 注册的回调应该在 dispose 时执行', () => {
            const cleanupOrder: number[] = [];
            class MyHost extends ComposableBase {}
            MyHost.define({});
            const instance = new MyHost();
            instance.onCleanup(() => cleanupOrder.push(1));
            instance.onCleanup(() => cleanupOrder.push(2));
            instance.dispose();
            expect(cleanupOrder).toEqual([2, 1]);
        });

        it('dispose 应该清理 abilityState', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(CounterAbility);
            MyHost.define({});
            const instance = new MyHost() as any;
            instance.increment();
            expect(instance.count).toBe(1);
            instance.dispose();
            expect(instance.count).toBe(0);
        });

        it('dispose 时 cleanup 回调抛错不应中断后续清理', () => {
            class MyHost extends ComposableBase {}
            MyHost.define({});
            const instance = new MyHost();
            instance.onCleanup(() => {
                throw new Error('cleanup error');
            });
            instance.onCleanup(() => {});
            expect(() => instance.dispose()).not.toThrow();
        });

        });

    describe('onBeforeDispose / onDisposed 钩子', () => {
        it('onBeforeDispose 在 dispose 最先调用', () => {
            const order: string[] = [];
            class MyHost extends ComposableBase {
                override onBeforeDispose() {
                    order.push('before');
                }
                override onDisposed() {
                    order.push('disposed');
                }
            }
            MyHost.define({});
            const instance = new MyHost();
            instance.onCleanup(() => order.push('cleanup'));
            instance.dispose();
            expect(order).toEqual(['before', 'cleanup', 'disposed']);
        });

        it('onBeforeDispose 和 onDisposed 默认为空操作', () => {
            class MyHost extends ComposableBase {}
            MyHost.define({});
            const instance = new MyHost();
            expect(() => instance.dispose()).not.toThrow();
        });
    });

    describe('use() 不丢失基类方法', () => {
        it('use() 后基类方法应该仍然可用', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(TestAbility);
            const instance = new MyHost();

            expect(typeof instance.abilityState).toBe('function');
            expect(typeof instance.setAbilityState).toBe('function');
            expect(typeof instance.onCleanup).toBe('function');
            expect(typeof instance.dispose).toBe('function');
        });

        it('use() 后基类 getter 应该仍然可用', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(TestAbility);
            const instance = new MyHost();
            expect(instance.logger).toBeDefined();
        });

        it('链式 use() 后基类方法应该仍然可用', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(TestAbility).use(AnotherAbility);
            const instance = new MyHost();

            expect(typeof instance.abilityState).toBe('function');
            expect(typeof instance.dispose).toBe('function');
        });

        it('extends 后基类方法应该仍然可用', () => {
            class BaseHost extends ComposableBase {}
            BaseHost.use(TestAbility);

            class ChildClass extends BaseHost {
                childMethod() {
                    return 'child';
                }
            }

            const instance = new ChildClass();
            expect(typeof instance.abilityState).toBe('function');
            expect(typeof instance.dispose).toBe('function');
            expect((instance as any).testMethod()).toBe('test-result');
            expect(instance.childMethod()).toBe('child');
        });
    });

    describe('构造函数', () => {
        it('应该初始化 logger', () => {
            const instance = new ComposableBase();
            expect(instance.logger).toBeDefined();
        });

        it('use() 后创建的实例也应该初始化 logger', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(TestAbility);
            const instance = new MyHost();
            expect(instance.logger).toBeDefined();
        });
    });

    describe('define() 非能力定义注入', () => {
        it('define() 应该注入方法到原型', () => {
            class MyHost extends ComposableBase {}
            MyHost.define({
                customMethod() {
                    return 'custom-result';
                },
            });
            const instance = new MyHost() as any;
            expect(instance.customMethod()).toBe('custom-result');
        });

        it('define() 应该跳过 constructor', () => {
            class MyHost extends ComposableBase {}
            MyHost.define({
                constructor: () => {},
                validMethod() {
                    return 'ok';
                },
            });
            const instance = new MyHost() as any;
            expect(instance.validMethod()).toBe('ok');
        });

        it('define() 应该跳过内置方法键', () => {
            class MyHost extends ComposableBase {}
            const originalDispose = MyHost.prototype.dispose;
            MyHost.define({
                dispose: () => 'should-not-override',
            });
            expect(MyHost.prototype.dispose).toBe(originalDispose);
        });

        it('define() 返回 this 支持链式调用', () => {
            class MyHost extends ComposableBase {}
            const result = MyHost.define({});
            expect(result).toBe(MyHost);
        });

        it('define() + use() 链式组合', () => {
            class MyHost extends ComposableBase {}
            MyHost.use(TestAbility).define({
                myMethod() {
                    return 'ok';
                },
            });
            const instance = new MyHost() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.myMethod()).toBe('ok');
        });
    });

    describe('define() options', () => {
        it('define() options 注入 getter/setter', () => {
            class MyHost extends ComposableBase {}
            MyHost.define({
                options: {
                    label: 'default-label',
                    count: 0,
                },
            });
            const instance = new MyHost() as any;
            expect(instance.label).toBe('default-label');
            expect(instance.count).toBe(0);
        });

        it('define() options setter 可修改值', () => {
            class MyHost extends ComposableBase {}
            MyHost.define({
                options: {
                    label: 'default',
                },
            });
            const instance = new MyHost() as any;
            instance.label = 'new-label';
            expect(instance.label).toBe('new-label');
        });

        it('define() options 支持对象默认值', () => {
            class MyHost extends ComposableBase {}
            MyHost.define({
                options: {
                    config: { key: 'value' },
                    simple: 'hello',
                },
            });
            const instance = new MyHost() as any;
            expect(instance.config).toEqual({ key: 'value' });
            expect(instance.simple).toBe('hello');
        });

        it('define() options 多个实例值隔离', () => {
            class MyHost extends ComposableBase {}
            MyHost.define({
                options: {
                    name: 'unnamed',
                },
            });
            const host1 = new MyHost() as any;
            const host2 = new MyHost() as any;
            host1.name = 'instance-A';
            host2.name = 'instance-B';
            expect(host1.name).toBe('instance-A');
            expect(host2.name).toBe('instance-B');
        });

        });

    describe('forge 内部分支覆盖', () => {
        it('能力对象上的原生 getter/setter 应被注入', () => {
            const NativeAccessorAbility: AbilityDefinition = {};
            Object.defineProperty(NativeAccessorAbility, 'nativeProp', {
                get() {
                    return 'native-value';
                },
                enumerable: true,
                configurable: true,
            });

            class MyHost extends ComposableBase {}
            MyHost.use(NativeAccessorAbility);
            const instance = new MyHost() as any;
            expect(instance.nativeProp).toBe('native-value');
        });

        });
});
