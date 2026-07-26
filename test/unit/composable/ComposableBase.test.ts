/**
 * ComposableBase 单元测试
 *
 * 完整覆盖：
 * 1. with() 强类工厂 — 核心注入机制
 * 2. with() 链式调用
 * 3. with() 继承后子类再 with()
 * 4. getter/setter 注入与多实例隔离
 * 5. 方法注入与 this 指向
 * 6. __init__ 协议属性跳过
 * 7. 同名属性覆盖规则
 * 8. abilityState / setAbilityState
 * 9. onCleanup / dispose
 * 10. 原型链上基类方法保留（with() 不丢失基类方法）
 * 11. with() 数组参数兼容
 * 12. Symbol 键支持
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
    describe('with() 强类工厂', () => {
        it('with() 返回的类应该继承 ComposableBase', () => {
            const ForgedClass = ComposableBase.with([TestAbility]);
            const instance = new ForgedClass();
            expect(instance).toBeInstanceOf(ComposableBase);
        });

        it('with() 注入的方法应该可通过实例调用', () => {
            const ForgedClass = ComposableBase.with([TestAbility]);
            const instance = new ForgedClass() as any;
            expect(instance.testMethod()).toBe('test-result');
        });

        it('with() 注入的 getter 应该可访问', () => {
            const ForgedClass = ComposableBase.with([TestAbility]);
            const instance = new ForgedClass() as any;
            expect(instance.testProperty).toBe('test-value');
        });

        it('with() 注入的 setter 应该可写入', () => {
            const ForgedClass = ComposableBase.with([TestAbility]);
            const instance = new ForgedClass() as any;
            instance.testProperty = 'new-value';
            expect(instance.testProperty).toBe('new-value');
        });

        it('with() 注入多个能力（数组参数）', () => {
            const ForgedClass = ComposableBase.with([TestAbility, AnotherAbility]);
            const instance = new ForgedClass() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });
    });

    describe('with() 链式调用', () => {
        it('链式 with() 应该累积能力', () => {
            const ForgedClass = ComposableBase.with([TestAbility]).with([AnotherAbility]);
            const instance = new ForgedClass() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });

        it('链式 with() 后的类仍然继承 ComposableBase', () => {
            const ForgedClass = ComposableBase.with([TestAbility]).with([AnotherAbility]);
            const instance = new ForgedClass();
            expect(instance).toBeInstanceOf(ComposableBase);
        });
    });

    describe('with() + extends 继承', () => {
        it('extends with() 类后子类应该拥有父类能力', () => {
            const BaseClass = ComposableBase.with([TestAbility]);

            class ChildClass extends BaseClass {
                childMethod() {
                    return 'child';
                }
            }

            const instance = new ChildClass() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.childMethod()).toBe('child');
        });

        it('子类再 with() 应该同时拥有父类和新能力', () => {
            const BaseClass = ComposableBase.with([TestAbility]);
            const ChildClass = BaseClass.with([AnotherAbility]);

            const instance = new ChildClass() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });
    });

    describe('getter/setter 多实例隔离', () => {
        it('多个实例的 getter 应该各自返回自己的值', () => {
            const ForgedClass = ComposableBase.with([TestAbility]);
            const host1 = new ForgedClass() as any;
            const host2 = new ForgedClass() as any;

            host1.testProperty = 'A';
            host2.testProperty = 'B';

            expect(host1.testProperty).toBe('A');
            expect(host2.testProperty).toBe('B');
        });

        it('abilityState 应该在实例间隔离', () => {
            const ForgedClass = ComposableBase.with([CounterAbility]);
            const host1 = new ForgedClass() as any;
            const host2 = new ForgedClass() as any;

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
        it('with() 注入的方法 this 应该指向宿主实例', () => {
            const MethodDef: AbilityDefinition = {
                greet() {
                    return `Hello from ${this.name}`;
                },
            };

            const ForgedClass = ComposableBase.with([MethodDef]);

            class NamedHost extends ForgedClass {
                name = 'MyHost';
            }

            const host = new NamedHost() as any;
            expect(host.greet()).toBe('Hello from MyHost');
        });
    });

    describe('__init__ 协议属性', () => {
        it('以 __ 开头的属性不应该被注入到原型上', () => {
            const ForgedClass = ComposableBase.with([InitAbility]);
            const instance = new ForgedClass() as any;

            expect(instance.__init__).toBeUndefined();
        });

        it('__init__ 关联的方法应该可手动调用', () => {
            const ForgedClass = ComposableBase.with([InitAbility]);
            const instance = new ForgedClass() as any;

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

            const ForgedClass = ComposableBase.with([AbilityA, AbilityB]);
            const instance = new ForgedClass() as any;
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
            const ForgedClass = ComposableBase.with([CounterAbility]);
            const instance = new ForgedClass() as any;
            instance.increment();
            expect(instance.count).toBe(1);
            instance.dispose();
            expect(instance.count).toBe(0);
        });
    });

    describe('with() 不丢失基类方法', () => {
        it('with() 后基类方法应该仍然可用', () => {
            const ForgedClass = ComposableBase.with([TestAbility]);
            const instance = new ForgedClass();

            expect(typeof instance.abilityState).toBe('function');
            expect(typeof instance.setAbilityState).toBe('function');
            expect(typeof instance.onCleanup).toBe('function');
            expect(typeof instance.dispose).toBe('function');
        });

        it('with() 后基类 getter 应该仍然可用', () => {
            const ForgedClass = ComposableBase.with([TestAbility]);
            const instance = new ForgedClass();
            expect(instance.logger).toBeDefined();
        });

        it('链式 with() 后基类方法应该仍然可用', () => {
            const ForgedClass = ComposableBase.with([TestAbility]).with([AnotherAbility]);
            const instance = new ForgedClass();

            expect(typeof instance.abilityState).toBe('function');
            expect(typeof instance.dispose).toBe('function');
        });

        it('extends with() 类后基类方法应该仍然可用', () => {
            const BaseClass = ComposableBase.with([TestAbility]);

            class ChildClass extends BaseClass {
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

        it('with() 创建的实例也应该初始化 logger', () => {
            const ForgedClass = ComposableBase.with([TestAbility]);
            const instance = new ForgedClass();
            expect(instance.logger).toBeDefined();
        });
    });

    describe('Symbol 键支持', () => {
        it('with() 应该注入 Symbol 键的方法', () => {
            const sym = Symbol('testSymbol');
            const SymbolAbility: AbilityDefinition = {
                [sym]() {
                    return 'symbol-result';
                },
            };

            const ForgedClass = ComposableBase.with([SymbolAbility]);
            const instance = new ForgedClass() as any;
            expect(typeof instance[sym]).toBe('function');
            expect(instance[sym]()).toBe('symbol-result');
        });
    });

    describe('with() 数组参数兼容', () => {
        it('with(array) 应该自动展平', () => {
            const abilities = [TestAbility, AnotherAbility];
            const ForgedClass = ComposableBase.with(abilities);
            const instance = new ForgedClass() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });

        it('with(array) 在 extends 语句中应该正常工作', () => {
            const abilities = [TestAbility];
            class HostClass extends ComposableBase.with(abilities) {}
            const instance = new HostClass() as any;
            expect(instance.testMethod()).toBe('test-result');
        });
    });
});
