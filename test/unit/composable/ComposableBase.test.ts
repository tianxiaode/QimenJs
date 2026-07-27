/**
 * ComposableBase 单元测试
 *
 * 完整覆盖：
 * 1. use() 能力注入 — 核心注入机制
 * 2. use() 链式调用
 * 3. use() 继承后子类再 use()
 * 4. use() 单个能力参数
 * 5. getter/setter 注入与多实例隔离
 * 6. 方法注入与 this 指向
 * 7. __init__ 协议属性跳过
 * 8. 同名属性覆盖规则
 * 9. abilityState / setAbilityState
 * 10. onCleanup / dispose
 * 11. 基类方法保留（use() 不丢失基类方法）
 * 12. Symbol 键支持
 * 13. define() 非能力定义注入
 * 14. define() getter/setter 支持
 * 15. define() 链式调用
 * 16. dispose 错误处理
 * 17. onBeforeDispose / onDisposed 钩子
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

const TestAbility: AbilityDefinition = {
    testMethod() {
        return 'test-result';
    },
    testProperty: {
        get() {
            return this._testValue || 'test-value';
        },
        set(v: string) {
            this._testValue = v;
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

const InitAbility: AbilityDefinition = {
    __init__: '_initTest',
    _initTest() {
        this.setAbilityState('InitAbility:initialized', true);
    },
    _testInitialized: {
        get() {
            return this.abilityState('InitAbility:initialized', () => false);
        },
    },
};

describe('ComposableBase', () => {
    describe('use() 能力注入', () => {
        it('use() 返回 this，修改自身原型', () => {
            class MyHost extends ComposableBase {}
            const result = MyHost.use([TestAbility]);
            expect(result).toBe(MyHost);
            const instance = new MyHost();
            expect(instance).toBeInstanceOf(ComposableBase);
        });

        it('use() 注入的方法应该可通过实例调用', () => {
            class MyHost extends ComposableBase {}
            MyHost.use([TestAbility]);
            const instance = new MyHost() as any;
            expect(instance.testMethod()).toBe('test-result');
        });

        it('use() 注入的 getter 应该可访问', () => {
            class MyHost extends ComposableBase {}
            MyHost.use([TestAbility]);
            const instance = new MyHost() as any;
            expect(instance.testProperty).toBe('test-value');
        });

        it('use() 注入的 setter 应该可写入', () => {
            class MyHost extends ComposableBase {}
            MyHost.use([TestAbility]);
            const instance = new MyHost() as any;
            instance.testProperty = 'new-value';
            expect(instance.testProperty).toBe('new-value');
        });

        it('use() 注入多个能力（数组参数）', () => {
            class MyHost extends ComposableBase {}
            MyHost.use([TestAbility, AnotherAbility]);
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
            MyHost.use([TestAbility]).use([AnotherAbility]);
            const instance = new MyHost() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });

        it('链式 use() 后的类仍然继承 ComposableBase', () => {
            class MyHost extends ComposableBase {}
            MyHost.use([TestAbility]).use([AnotherAbility]);
            const instance = new MyHost();
            expect(instance).toBeInstanceOf(ComposableBase);
        });
    });

    describe('use() + extends 继承', () => {
        it('extends 后子类应该拥有父类能力', () => {
            class BaseHost extends ComposableBase {}
            BaseHost.use([TestAbility]);

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
            BaseHost.use([TestAbility]);

            class ChildHost extends BaseHost {}
            ChildHost.use([AnotherAbility]);

            const instance = new ChildHost() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });
    });

    describe('getter/setter 多实例隔离', () => {
        it('多个实例的 getter 应该各自返回自己的值', () => {
            class MyHost extends ComposableBase {}
            MyHost.use([TestAbility]);
            const host1 = new MyHost() as any;
            const host2 = new MyHost() as any;

            host1.testProperty = 'A';
            host2.testProperty = 'B';

            expect(host1.testProperty).toBe('A');
            expect(host2.testProperty).toBe('B');
        });

        it('abilityState 应该在实例间隔离', () => {
            class MyHost extends ComposableBase {}
            MyHost.use([CounterAbility]);
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
                greet() {
                    return `Hello from ${this.name}`;
                },
            };

            class MyHost extends ComposableBase {}
            MyHost.use([MethodDef]);

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
            MyHost.use([InitAbility]);
            const instance = new MyHost() as any;

            expect(instance.__init__).toBeUndefined();
        });

        it('__init__ 关联的方法应该可手动调用', () => {
            class MyHost extends ComposableBase {}
            MyHost.use([InitAbility]);
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
            MyHost.use([AbilityA, AbilityB]);
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
            const instance = new ComposableBase();
            instance.onCleanup(() => cleanupOrder.push(1));
            instance.onCleanup(() => cleanupOrder.push(2));
            instance.dispose();
            expect(cleanupOrder).toEqual([2, 1]);
        });

        it('dispose 应该清理 abilityState', () => {
            class MyHost extends ComposableBase {}
            MyHost.use([CounterAbility]);
            const instance = new MyHost() as any;
            instance.increment();
            expect(instance.count).toBe(1);
            instance.dispose();
            expect(instance.count).toBe(0);
        });

        it('dispose 应该取消 cancelable 状态', () => {
            const instance = new ComposableBase();
            const cancel = jest.fn();
            instance.setAbilityState('test:cancelable', { cancel });
            instance.dispose();
            expect(cancel).toHaveBeenCalled();
        });

        it('dispose 时 cleanup 回调抛错不应中断后续清理', () => {
            const instance = new ComposableBase();
            instance.onCleanup(() => {
                throw new Error('cleanup error');
            });
            instance.onCleanup(() => {});
            expect(() => instance.dispose()).not.toThrow();
        });

        it('dispose 时 cancelable cancel 抛错不应中断', () => {
            const instance = new ComposableBase();
            instance.setAbilityState('test', {
                cancel() {
                    throw new Error('cancel error');
                },
            });
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
            const instance = new MyHost();
            instance.onCleanup(() => order.push('cleanup'));
            instance.dispose();
            expect(order).toEqual(['before', 'cleanup', 'disposed']);
        });

        it('onBeforeDispose 和 onDisposed 默认为空操作', () => {
            const instance = new ComposableBase();
            expect(() => instance.dispose()).not.toThrow();
        });
    });

    describe('use() 不丢失基类方法', () => {
        it('use() 后基类方法应该仍然可用', () => {
            class MyHost extends ComposableBase {}
            MyHost.use([TestAbility]);
            const instance = new MyHost();

            expect(typeof instance.abilityState).toBe('function');
            expect(typeof instance.setAbilityState).toBe('function');
            expect(typeof instance.onCleanup).toBe('function');
            expect(typeof instance.dispose).toBe('function');
        });

        it('use() 后基类 getter 应该仍然可用', () => {
            class MyHost extends ComposableBase {}
            MyHost.use([TestAbility]);
            const instance = new MyHost();
            expect(instance.logger).toBeDefined();
        });

        it('链式 use() 后基类方法应该仍然可用', () => {
            class MyHost extends ComposableBase {}
            MyHost.use([TestAbility]).use([AnotherAbility]);
            const instance = new MyHost();

            expect(typeof instance.abilityState).toBe('function');
            expect(typeof instance.dispose).toBe('function');
        });

        it('extends 后基类方法应该仍然可用', () => {
            class BaseHost extends ComposableBase {}
            BaseHost.use([TestAbility]);

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
            MyHost.use([TestAbility]);
            const instance = new MyHost();
            expect(instance.logger).toBeDefined();
        });
    });

    describe('Symbol 键支持', () => {
        it('use() 应该注入 Symbol 键的方法', () => {
            const sym = Symbol('testSymbol');
            const SymbolAbility: AbilityDefinition = {
                [sym]() {
                    return 'symbol-result';
                },
            };

            class MyHost extends ComposableBase {}
            MyHost.use([SymbolAbility]);
            const instance = new MyHost() as any;
            expect(typeof instance[sym]).toBe('function');
            expect(instance[sym]()).toBe('symbol-result');
        });
    });

    describe('use() 数组参数兼容', () => {
        it('use(array) 应该正常工作', () => {
            const abilities = [TestAbility, AnotherAbility];
            class MyHost extends ComposableBase {}
            MyHost.use(abilities);
            const instance = new MyHost() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
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

        it('define() 应该注入普通值到原型', () => {
            class MyHost extends ComposableBase {}
            MyHost.define({
                type: 'MyHost',
                count: 42,
            });
            const instance = new MyHost() as any;
            expect(instance.type).toBe('MyHost');
            expect(instance.count).toBe(42);
        });

        it('define() 应该注入原生 getter/setter', () => {
            const defs: Record<string, any> = {};
            Object.defineProperty(defs, 'label', {
                get() {
                    return 'default';
                },
                enumerable: true,
                configurable: true,
            });

            class MyHost extends ComposableBase {}
            MyHost.define(defs);
            const instance = new MyHost() as any;
            expect(instance.label).toBe('default');
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
            const result = MyHost.define({ a: 1 });
            expect(result).toBe(MyHost);
        });

        it('define() 不跳过 __ 前缀 key', () => {
            class MyHost extends ComposableBase {}
            MyHost.define({
                __internal: 'internal-value',
            });
            const instance = new MyHost() as any;
            expect(instance.__internal).toBe('internal-value');
        });

        it('define() + use() 链式组合', () => {
            class MyHost extends ComposableBase {}
            MyHost.use([TestAbility]).define({ type: 'MyHost' });
            const instance = new MyHost() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.type).toBe('MyHost');
        });
    });

    describe('use() 维护 abilities 数组', () => {
        it('use() 应该在类上累积 abilities', () => {
            class MyHost extends ComposableBase {}
            MyHost.use([TestAbility]);
            expect((MyHost as any).abilities).toContain(TestAbility);

            MyHost.use([AnotherAbility]);
            expect((MyHost as any).abilities).toContain(TestAbility);
            expect((MyHost as any).abilities).toContain(AnotherAbility);
        });
    });

    describe('forge 内部分支覆盖', () => {
        it('use() 嵌套数组参数应自动展平', () => {
            const nested = [TestAbility, AnotherAbility];
            class MyHost extends ComposableBase {}
            MyHost.use(nested as any);
            const instance = new MyHost() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });

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
            MyHost.use([NativeAccessorAbility]);
            const instance = new MyHost() as any;
            expect(instance.nativeProp).toBe('native-value');
        });

        it('Symbol 键同名覆盖应触发 warn', () => {
            const sym = Symbol('overlap');
            const AbilityA: AbilityDefinition = {
                [sym]() {
                    return 'A';
                },
            };
            const AbilityB: AbilityDefinition = {
                [sym]() {
                    return 'B';
                },
            };

            class MyHost extends ComposableBase {}
            MyHost.use([AbilityA, AbilityB]);
            const instance = new MyHost() as any;
            expect(instance[sym]()).toBe('B');
        });
    });
});
