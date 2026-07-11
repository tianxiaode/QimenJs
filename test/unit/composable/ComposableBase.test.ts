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
 * 9. setupAbilities 运行时注入
 * 10. onCleanup / dispose
 * 11. debounce
 * 12. getStatic / setStatic
 * 13. host getter
 * 14. 原型链上基类方法保留（with() 不丢失基类方法）
 * 15. with() 数组参数兼容
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
// 测试用能力定义
// ============================================

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

// ============================================
// 测试
// ============================================

describe('ComposableBase', () => {
    // ============================================
    // 1. with() 强类工厂 — 核心注入机制
    // ============================================

    describe('with() 强类工厂', () => {
        it('with() 返回的类应该继承 ComposableBase', () => {
            const ForgedClass = ComposableBase.with(TestAbility);
            const instance = new ForgedClass();
            expect(instance).toBeInstanceOf(ComposableBase);
        });

        it('with() 注入的方法应该可通过实例调用', () => {
            const ForgedClass = ComposableBase.with(TestAbility);
            const instance = new ForgedClass() as any;
            expect(instance.testMethod()).toBe('test-result');
        });

        it('with() 注入的 getter 应该可访问', () => {
            const ForgedClass = ComposableBase.with(TestAbility);
            const instance = new ForgedClass() as any;
            expect(instance.testProperty).toBe('test-value');
        });

        it('with() 注入的 setter 应该可写入', () => {
            const ForgedClass = ComposableBase.with(TestAbility);
            const instance = new ForgedClass() as any;
            instance.testProperty = 'new-value';
            expect(instance.testProperty).toBe('new-value');
        });

        it('with() 注入多个能力（可变参数）', () => {
            const ForgedClass = ComposableBase.with(TestAbility, AnotherAbility);
            const instance = new ForgedClass() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });

        it('with() 无参数应该返回基类等价类', () => {
            const ForgedClass = ComposableBase.with();
            const instance = new ForgedClass();
            expect(instance).toBeInstanceOf(ComposableBase);
        });
    });

    // ============================================
    // 2. with() 链式调用
    // ============================================

    describe('with() 链式调用', () => {
        it('链式 with() 应该累积能力', () => {
            const ForgedClass = ComposableBase.with(TestAbility).with(AnotherAbility);
            const instance = new ForgedClass() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });

        it('链式 with() 后的类仍然继承 ComposableBase', () => {
            const ForgedClass = ComposableBase.with(TestAbility).with(AnotherAbility);
            const instance = new ForgedClass();
            expect(instance).toBeInstanceOf(ComposableBase);
        });
    });

    // ============================================
    // 3. with() + extends 继承
    // ============================================

    describe('with() + extends 继承', () => {
        it('extends with() 类后子类应该拥有父类能力', () => {
            const BaseClass = ComposableBase.with(TestAbility);

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
            const BaseClass = ComposableBase.with(TestAbility);
            const ChildClass = BaseClass.with(AnotherAbility);

            const instance = new ChildClass() as any;
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });
    });

    // ============================================
    // 4. getter/setter 多实例隔离
    // ============================================

    describe('getter/setter 多实例隔离', () => {
        it('多个实例的 getter 应该各自返回自己的值', () => {
            const ForgedClass = ComposableBase.with(TestAbility);
            const host1 = new ForgedClass() as any;
            const host2 = new ForgedClass() as any;

            host1.testProperty = 'A';
            host2.testProperty = 'B';

            expect(host1.testProperty).toBe('A');
            expect(host2.testProperty).toBe('B');
        });

        it('abilityState 应该在实例间隔离', () => {
            const ForgedClass = ComposableBase.with(CounterAbility);
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

    // ============================================
    // 5. 方法注入与 this 指向
    // ============================================

    describe('方法注入与 this 指向', () => {
        it('with() 注入的方法 this 应该指向宿主实例', () => {
            const MethodDef: AbilityDefinition = {
                greet() {
                    return `Hello from ${this.name}`;
                },
            };

            const ForgedClass = ComposableBase.with(MethodDef);

            class NamedHost extends ForgedClass {
                name = 'MyHost';
            }

            const host = new NamedHost() as any;
            expect(host.greet()).toBe('Hello from MyHost');
        });

        it('方法中 this.host 应该返回宿主自身', () => {
            const HostDef: AbilityDefinition = {
                getHostViaThis() {
                    return this.host;
                },
            };

            const ForgedClass = ComposableBase.with(HostDef);
            const host = new ForgedClass() as any;
            expect(host.getHostViaThis()).toBe(host);
        });
    });

    // ============================================
    // 6. __init__ 协议属性跳过
    // ============================================

    describe('__init__ 协议属性', () => {
        it('以 __ 开头的属性不应该被注入到原型上', () => {
            const ForgedClass = ComposableBase.with(InitAbility);
            const instance = new ForgedClass() as any;

            // __init__ 不应该在实例上
            expect(instance.__init__).toBeUndefined();
        });

        it('__init__ 关联的方法应该可手动调用', () => {
            const ForgedClass = ComposableBase.with(InitAbility);
            const instance = new ForgedClass() as any;

            // _initTest 方法应该存在
            expect(typeof instance._initTest).toBe('function');

            // 手动调用
            instance._initTest();
            expect(instance._testInitialized).toBe(true);
        });
    });

    // ============================================
    // 7. 同名属性覆盖规则
    // ============================================

    describe('同名属性覆盖规则', () => {
        it('后声明的能力应该覆盖先声明的能力同名方法', () => {
            const AbilityA: AbilityDefinition = {
                sharedMethod: () => 'method-A',
            };
            const AbilityB: AbilityDefinition = {
                sharedMethod: () => 'method-B',
            };

            const ForgedClass = ComposableBase.with(AbilityA, AbilityB);
            const instance = new ForgedClass() as any;
            expect(instance.sharedMethod()).toBe('method-B');
        });

        it('已存在于基类原型上的属性不应该被覆盖', () => {
            // ComposableBase 自身有 host getter
            // 能力中定义同名 host getter 不应该覆盖
            const HostOverride: AbilityDefinition = {
                host: {
                    get() {
                        return 'overridden';
                    },
                },
            };

            const ForgedClass = ComposableBase.with(HostOverride);
            const instance = new ForgedClass() as any;
            // host 应该仍然是 ComposableBase 的原始实现
            expect(instance.host).toBe(instance);
        });
    });

    // ============================================
    // 8. abilityState / setAbilityState
    // ============================================

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

    // ============================================
    // 9. setupAbilities 运行时注入
    // ============================================

    describe('setupAbilities 运行时注入', () => {
        it('setupAbilities 应该将能力注入到实例上', () => {
            const instance = new ComposableBase() as any;
            instance.setupAbilities(TestAbility);
            expect(instance.testMethod()).toBe('test-result');
        });

        it('setupAbilities 应该支持数组参数', () => {
            const instance = new ComposableBase() as any;
            instance.setupAbilities([TestAbility, AnotherAbility]);
            expect(instance.testMethod()).toBe('test-result');
            expect(instance.anotherMethod()).toBe('another-result');
        });

        it('setupAbilities 注入的方法应该 bind 到实例', () => {
            const MethodDef: AbilityDefinition = {
                greet() {
                    return this.name;
                },
            };

            class NamedHost extends ComposableBase {
                name = 'RuntimeHost';
            }

            const instance = new NamedHost() as any;
            instance.setupAbilities(MethodDef);
            expect(instance.greet()).toBe('RuntimeHost');
        });

        it('setupAbilities 注入的 getter/setter 应该工作', () => {
            const instance = new ComposableBase() as any;
            instance.setupAbilities(TestAbility);
            expect(instance.testProperty).toBe('test-value');
            instance.testProperty = 'changed';
            expect(instance.testProperty).toBe('changed');
        });
    });

    // ============================================
    // 10. onCleanup / dispose
    // ============================================

    describe('onCleanup / dispose', () => {
        it('onCleanup 注册的回调应该在 dispose 时执行', () => {
            const cleanupOrder: number[] = [];
            const instance = new ComposableBase();
            instance.onCleanup(() => cleanupOrder.push(1));
            instance.onCleanup(() => cleanupOrder.push(2));
            instance.dispose();
            expect(cleanupOrder).toEqual([2, 1]); // 逆序执行
        });

        it('dispose 应该清理 abilityState', () => {
            const ForgedClass = ComposableBase.with(CounterAbility);
            const instance = new ForgedClass() as any;
            instance.increment();
            expect(instance.count).toBe(1);
            instance.dispose();
            // dispose 后 abilityState 被清空，重新访问会创建新状态
            expect(instance.count).toBe(0);
        });

        it('dispose 应该取消防抖定时器', () => {
            const instance = new ComposableBase();
            const debounced = instance.debounce('test', () => {}, 100);
            expect(() => instance.dispose()).not.toThrow();
        });
    });

    // ============================================
    // 11. debounce
    // ============================================

    describe('debounce', () => {
        it('debounce 应该返回防抖函数', () => {
            const instance = new ComposableBase();
            const fn = instance.debounce('test', () => 'result', 100);
            expect(typeof fn).toBe('function');
            expect(typeof fn.cancel).toBe('function');
        });

        it('相同 key 的 debounce 应该返回同一防抖实例', () => {
            const instance = new ComposableBase();
            const fn1 = instance.debounce('test', () => {}, 100);
            const fn2 = instance.debounce('test', () => {}, 100);
            expect(fn1).toBe(fn2);
        });
    });

    // ============================================
    // 12. getStatic / setStatic
    // ============================================

    describe('getStatic / setStatic', () => {
        it('setStatic 应该存储类级缓存', () => {
            const instance = new ComposableBase();
            instance.setStatic('test-key', 'test-value');
            expect(instance.getStatic('test-key')).toBe('test-value');
        });

        it('getStatic 不存在的 key 应该返回 undefined', () => {
            const instance = new ComposableBase();
            expect(instance.getStatic('nonexistent')).toBeUndefined();
        });

        it('同类不同实例应该共享 static 存储', () => {
            class SharedClass extends ComposableBase {}
            const instance1 = new SharedClass();
            const instance2 = new SharedClass();
            instance1.setStatic('shared', 'value');
            expect(instance2.getStatic('shared')).toBe('value');
        });

        it('不同类不应该共享 static 存储', () => {
            class ClassA extends ComposableBase {}
            class ClassB extends ComposableBase {}
            const a = new ClassA();
            const b = new ClassB();
            a.setStatic('key', 'A');
            expect(b.getStatic('key')).toBeUndefined();
        });
    });

    // ============================================
    // 13. host getter
    // ============================================

    describe('host getter', () => {
        it('host 应该返回实例自身', () => {
            const instance = new ComposableBase();
            expect(instance.host).toBe(instance);
        });

        it('with() 后 host 仍然返回实例自身', () => {
            const ForgedClass = ComposableBase.with(TestAbility);
            const instance = new ForgedClass();
            expect(instance.host).toBe(instance);
        });
    });

    // ============================================
    // 14. 原型链上基类方法保留（with() 不丢失基类方法）
    // ============================================

    describe('with() 不丢失基类方法', () => {
        it('with() 后基类方法应该仍然可用', () => {
            const ForgedClass = ComposableBase.with(TestAbility);
            const instance = new ForgedClass();

            // ComposableBase 的方法
            expect(typeof instance.abilityState).toBe('function');
            expect(typeof instance.setAbilityState).toBe('function');
            expect(typeof instance.setupAbilities).toBe('function');
            expect(typeof instance.onCleanup).toBe('function');
            expect(typeof instance.dispose).toBe('function');
            expect(typeof instance.debounce).toBe('function');
            expect(typeof instance.getStatic).toBe('function');
            expect(typeof instance.setStatic).toBe('function');
        });

        it('with() 后基类 getter 应该仍然可用', () => {
            const ForgedClass = ComposableBase.with(TestAbility);
            const instance = new ForgedClass();
            expect(instance.host).toBe(instance);
            expect(instance.logger).toBeDefined();
        });

        it('链式 with() 后基类方法应该仍然可用', () => {
            const ForgedClass = ComposableBase.with(TestAbility).with(AnotherAbility);
            const instance = new ForgedClass();

            expect(typeof instance.abilityState).toBe('function');
            expect(typeof instance.dispose).toBe('function');
            expect(instance.host).toBe(instance);
        });

        it('extends with() 类后基类方法应该仍然可用', () => {
            const BaseClass = ComposableBase.with(TestAbility);

            class ChildClass extends BaseClass {
                childMethod() {
                    return 'child';
                }
            }

            const instance = new ChildClass();
            expect(typeof instance.abilityState).toBe('function');
            expect(typeof instance.dispose).toBe('function');
            expect(instance.host).toBe(instance);
            expect((instance as any).testMethod()).toBe('test-result');
            expect(instance.childMethod()).toBe('child');
        });
    });

    // ============================================
    // 15. 构造函数
    // ============================================

    describe('构造函数', () => {
        it('应该初始化 logger', () => {
            const instance = new ComposableBase();
            expect(instance.logger).toBeDefined();
        });

        it('with() 创建的实例也应该初始化 logger', () => {
            const ForgedClass = ComposableBase.with(TestAbility);
            const instance = new ForgedClass();
            expect(instance.logger).toBeDefined();
        });
    });

    // ============================================
    // 16. Symbol 键支持
    // ============================================

    describe('Symbol 键支持', () => {
        it('with() 应该注入 Symbol 键的方法', () => {
            const sym = Symbol('testSymbol');
            const SymbolAbility: AbilityDefinition = {
                [sym]() {
                    return 'symbol-result';
                },
            };

            const ForgedClass = ComposableBase.with(SymbolAbility);
            const instance = new ForgedClass() as any;
            expect(typeof instance[sym]).toBe('function');
            expect(instance[sym]()).toBe('symbol-result');
        });
    });

    // ============================================
    // 17. with() 数组参数兼容
    // ============================================

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
