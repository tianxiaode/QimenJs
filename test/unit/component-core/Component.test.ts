/**
 * Component 基类测试 — 新模式
 *
 * 覆盖：create、编译注册表、tpl 三种语义、渐进渲染、继承
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

import { Component } from '@/component-core/Component';
import { CompileEngine } from '@/component-core/engine/CompileEngine';

describe('Component 基类', () => {
    describe('create — 全编译模式', () => {
        it('创建实例并初始化', () => {
            class TestComp extends Component {
                type = 'Test';
                tpl = {
                    tag: 'div',
                    cls: 'q-test',
                    children: [{ tag: 'span', name: 'label', cls: 'q-test__label' }],
                };
            }
            const inst = TestComp.create() as any;
            expect(inst.el).toBeInstanceOf(HTMLElement);
            expect(inst.type).toBe('Test');
            expect(inst.el.tagName).toBe('DIV');
            expect(inst.el.classList.contains('q-test')).toBe(true);
        });

        it('props 传入', () => {
            class TestComp extends Component {
                type = 'Test';
                tpl = { tag: 'div' };
                onAfterInit(props?: any) {
                    this.myProp = props?.myProp;
                }
                myProp?: string;
            }
            const inst = TestComp.create({ myProp: 'hello' }) as any;
            expect(inst.myProp).toBe('hello');
        });

        it('WeakMap 缓存 — 第二次 create 不重编译', () => {
            let compileCount = 0;
            const origCompile = CompileEngine.compile;
            (CompileEngine as any).compile = function (...args: any[]) {
                compileCount++;
                return origCompile.apply(CompileEngine, args);
            };
            try {
                class TestComp extends Component {
                    type = 'Test';
                    tpl = { tag: 'div', children: [{ tag: 'span', name: 'a', cls: 'q-a' }] };
                }
                TestComp.create();
                const countAfterFirst = compileCount;
                TestComp.create();
                expect(compileCount).toBe(countAfterFirst);
            } finally {
                (CompileEngine as any).compile = origCompile;
            }
        });
    });

    describe('tpl — replace 模式', () => {
        it('子树替换：替换父模板中命名节点', () => {
            class Base extends Component {
                type = 'Base';
                tpl = {
                    tag: 'div',
                    cls: 'q-base',
                    children: [{ tag: 'span', name: 'content', cls: 'q-base__content' }],
                };
            }
            class Derived extends Base {
                type = 'Derived';
                tpl = {
                    replace: true,
                    content: {
                        tag: 'div',
                        cls: 'q-derived__content',
                        children: [
                            { tag: 'span', name: 'icon', cls: 'q-icon' },
                            { tag: 'span', name: 'text', cls: 'q-text' },
                        ],
                    },
                };
            }
            const inst = Derived.create() as any;
            expect(inst.el).toBeInstanceOf(HTMLElement);
            expect(inst.nodeMap.icon).toBeDefined();
            expect(inst.nodeMap.text).toBeDefined();
        });

        it('属性覆盖：修改父模板节点属性', () => {
            class Base extends Component {
                type = 'Base';
                tpl = {
                    tag: 'div',
                    cls: 'q-base',
                    children: [
                        { tag: 'div', name: 'body', cls: 'q-base__body', type: 'SomeComponent' },
                    ],
                };
            }
            class Derived extends Base {
                type = 'Derived';
                tpl = {
                    replace: true,
                    body: { type: 'OtherComponent' },
                };
            }
            const inst = Derived.create() as any;
            expect(inst.el).toBeInstanceOf(HTMLElement);
        });
    });

    describe('tpl — 继承模式', () => {
        it('无 tpl 的子类继承父类编译产物', () => {
            class Base extends Component {
                type = 'Base';
                tpl = {
                    tag: 'div',
                    cls: 'q-base',
                    children: [{ tag: 'span', name: 'label', cls: 'q-label' }],
                };
            }
            class Child extends Base {
                type = 'Child';
            }
            const inst = Child.create() as any;
            expect(inst.el).toBeInstanceOf(HTMLElement);
            expect(inst.nodeMap.label).toBeDefined();
        });
    });

    describe('events', () => {
        it('events 编译为委托事件规则', () => {
            class TestComp extends Component {
                type = 'Test';
                tpl = {
                    tag: 'div',
                    cls: 'q-test',
                    children: [{ tag: 'button', name: 'btn', cls: 'q-btn' }],
                };
                events = {
                    btn: { click: { emits: ['click'] } },
                };
            }
            TestComp.create();
            expect((TestComp as any)._delegatedEventRules).toBeDefined();
            expect((TestComp as any)._delegatedEventRules.length).toBeGreaterThan(0);
        });

        it('子类 events 与父类合并', () => {
            class Base extends Component {
                type = 'Base';
                tpl = { tag: 'div', children: [{ tag: 'button', name: 'btn', cls: 'q-btn' }] };
                events = {
                    btn: { click: { emits: ['click'] } },
                };
            }
            Base.create();
            class Derived extends Base {
                type = 'Derived';
                events = {
                    btn: { dblclick: { emits: ['dblclick'] } },
                };
            }
            Derived.create();
            const rules = (Derived as any)._delegatedEventRules;
            const eventTypes = rules.map((r: any) => r.event);
            expect(eventTypes).toContain('click');
            expect(eventTypes).toContain('dblclick');
        });
    });

    describe('渐进渲染', () => {
        it('progressive 模式：mount 后 el 可用', () => {
            class TestComp extends Component {
                type = 'Test';
                tpl = {
                    tag: 'div',
                    cls: 'q-test',
                    children: [{ tag: 'span', name: 'label', cls: 'q-label' }],
                };
            }
            const inst = TestComp.create(undefined, { progressive: true }) as any;
            expect(inst.el).toBeInstanceOf(HTMLElement);
            expect(inst.el.classList.contains('q-test')).toBe(true);
        });

        it('progressive 模式：fill + instantiate + finalize 完成初始化', () => {
            class TestComp extends Component {
                type = 'Test';
                tpl = {
                    tag: 'div',
                    cls: 'q-test',
                    children: [{ tag: 'span', name: 'label', cls: 'q-label' }],
                };
                onAfterInit() {
                    this._initialized = true;
                }
                _initialized = false;
            }
            const inst = TestComp.create(undefined, { progressive: true }) as any;
            expect(inst._initialized).toBe(false);
            inst.fill();
            inst.instantiate();
            inst.finalize();
            expect(inst._initialized).toBe(true);
        });
    });

    describe('type 节点自动 skeleton', () => {
        it('type 节点编译为 skeleton 占位', () => {
            class TestComp extends Component {
                type = 'Test';
                tpl = {
                    tag: 'div',
                    children: [{ tag: 'div', name: 'child', type: 'ChildComponent' }],
                };
            }
            const inst = TestComp.create() as any;
            const childEl = inst.nodeMap.child?.el;
            expect(childEl).toBeDefined();
            expect(childEl.classList.contains('q-skeleton')).toBe(true);
        });
    });

    describe('生命周期', () => {
        it('onAfterInit 被调用', () => {
            let called = false;
            class TestComp extends Component {
                type = 'Test';
                tpl = { tag: 'div' };
                onAfterInit() {
                    called = true;
                }
            }
            TestComp.create();
            expect(called).toBe(true);
        });

        it('onInitState 合并到实例', () => {
            class TestComp extends Component {
                type = 'Test';
                tpl = { tag: 'div' };
                onInitState() {
                    return { myState: 42 };
                }
            }
            const inst = TestComp.create() as any;
            expect(inst.myState).toBe(42);
        });
    });

    describe('dispose', () => {
        it('dispose 后 el 被移除', () => {
            class TestComp extends Component {
                type = 'Test';
                tpl = { tag: 'div' };
            }
            const container = document.createElement('div');
            document.body.appendChild(container);
            const inst = TestComp.create() as any;
            container.appendChild(inst.el);
            expect(container.contains(inst.el)).toBe(true);
            inst.dispose();
            expect(document.contains(inst.el)).toBe(false);
            container.remove();
        });
    });
});
