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

jest.mock('@qimenjs/task', () => ({
    globalTaskQueue: {
        addTask: jest.fn((fn: () => any) => fn()),
    },
}));

jest.mock('@/component-core/engine/ComponentRegistrar', () => {
    const actual = jest.requireActual('@/component-core/engine/ComponentRegistrar');
    return {
        ...actual,
        TemplateRegistrar: actual.ComponentRegistrar,
    };
});

import { Component, COMPONENT_ABILITIES } from '@/component-core/Component';
import { ComponentRegistrar } from '@/component-core/engine/ComponentRegistrar';
import type { TplNode } from '@/component-core/types/tpl-node-types';

function resetSingleton(): void {
    const base = Object.getPrototypeOf(ComponentRegistrar);
    (base as any).instances = new Map();
}

function getRegistry(): ComponentRegistrar {
    resetSingleton();
    return ComponentRegistrar.getInstance();
}

describe('Component 基类', () => {
    describe('静态属性', () => {
        it('COMPONENT_ABILITIES 为数组', () => {
            expect(Array.isArray(COMPONENT_ABILITIES)).toBe(true);
            expect(COMPONENT_ABILITIES.length).toBeGreaterThan(0);
        });

        it('Component.type 返回类名去掉 Component 后缀', () => {
            expect(Component.type).toBe('');
        });
    });

    describe('构造函数', () => {
        let registry: ComponentRegistrar;

        beforeEach(() => {
            registry = getRegistry();
        });

        afterEach(() => {
            registry.clear();
        });

        it('创建实例并设置基本属性', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            expect(inst.type).toBe('TestComp');
            expect(inst.props).toEqual({});
            expect(inst.meta).toEqual({});
            await inst.ready;
            expect(inst._initializing).toBe(false);
        });

        it('props 传入并保存', () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp({ myProp: 'hello' }) as any;
            expect(inst.props.myProp).toBe('hello');
        });

        it('props.id 保存', () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp({ id: 'test-id' }) as any;
            expect(inst.props.id).toBe('test-id');
        });

        it('props.parent 和 slotName 保存', () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const parent = {};
            const inst = new TestComp({ parent, slotName: 'body' }) as any;
            expect(inst.parent).toBe(parent);
            expect(inst.slotName).toBe('body');
        });
    });

    describe('type 推导', () => {
        it('子类 type 从类名推导（去掉 Component 后缀）', () => {
            class ButtonComponent extends Component {}
            expect(ButtonComponent.type).toBe('Button');
        });

        it('无 Component 后缀时 type 为完整类名', () => {
            class MyWidget extends Component {}
            expect(MyWidget.type).toBe('MyWidget');
        });
    });

    describe('nodeMap', () => {
        let registry: ComponentRegistrar;

        beforeEach(() => {
            registry = getRegistry();
        });

        afterEach(() => {
            registry.clear();
        });

        it('nodeMap 返回 nodeMapMgr.getAll() 或空对象', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = {
                tag: 'div',
                children: [{ tag: 'span', name: 'label' }],
            };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            expect(typeof inst.nodeMap).toBe('object');
        });
    });

    describe('el', () => {
        let registry: ComponentRegistrar;

        beforeEach(() => {
            registry = getRegistry();
        });

        afterEach(() => {
            registry.clear();
        });

        it('初始化后 el 为 HTMLElement', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = {
                tag: 'div',
                cls: 'q-test',
                children: [{ tag: 'span', name: 'label', cls: 'q-test__label' }],
            };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            expect(inst.el).toBeInstanceOf(HTMLElement);
            expect(inst.el.tagName).toBe('DIV');
        });
    });

    describe('containsElement', () => {
        let registry: ComponentRegistrar;

        beforeEach(() => {
            registry = getRegistry();
        });

        afterEach(() => {
            registry.clear();
        });

        it('节点不存在时返回 false', () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            const target = document.createElement('div');
            expect(inst.containsElement('nonExist', target)).toBe(false);
        });
    });

    describe('isItemContainer', () => {
        it('默认返回 false', () => {
            class TestComp extends Component {}
            const inst = new TestComp() as any;
            expect(inst.isItemContainer).toBe(false);
        });
    });

    describe('ready', () => {
        let registry: ComponentRegistrar;

        beforeEach(() => {
            registry = getRegistry();
        });

        afterEach(() => {
            registry.clear();
        });

        it('ready 是 Promise', () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            expect(inst.ready).toBeInstanceOf(Promise);
        });
    });

    describe('生命周期', () => {
        let registry: ComponentRegistrar;

        beforeEach(() => {
            registry = getRegistry();
        });

        afterEach(() => {
            registry.clear();
        });

        it('onAfterInit 被调用', async () => {
            let called = false;
            class TestComp extends Component {
                onAfterInit() {
                    called = true;
                }
            }
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            new TestComp();
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(called).toBe(true);
        });

        it('onInitState 合并到实例', async () => {
            class TestComp extends Component {
                onInitState() {
                    return { myState: 42 };
                }
            }
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            expect(inst.myState).toBe(42);
        });
    });

    describe('readyAll', () => {
        let registry: ComponentRegistrar;

        beforeEach(() => {
            registry = getRegistry();
        });

        afterEach(() => {
            registry.clear();
        });

        it('无 nodeMapMgr 时直接完成', async () => {
            class TestComp extends Component {}
            const inst = new TestComp() as any;
            inst.nodeMapMgr = undefined;
            await expect(inst.readyAll).resolves.toBeUndefined();
        });

        it('子组件有 readyAll 时递归等待', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            const childReadyAll = Promise.resolve();
            inst.nodeMapMgr = {
                getAll: () => ({
                    child: { component: { readyAll: childReadyAll } },
                }),
            };
            await expect(inst.readyAll).resolves.toBeUndefined();
        });

        it('子组件只有 ready 时等待 ready', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            const childReady = Promise.resolve();
            inst.nodeMapMgr = {
                getAll: () => ({
                    child: { component: { ready: childReady } },
                }),
            };
            await expect(inst.readyAll).resolves.toBeUndefined();
        });
    });

    describe('containsElement', () => {
        let registry: ComponentRegistrar;

        beforeEach(() => {
            registry = getRegistry();
        });

        afterEach(() => {
            registry.clear();
        });

        it('节点不存在时返回 false', () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            const target = document.createElement('div');
            expect(inst.containsElement('nonExist', target)).toBe(false);
        });

        it('节点有 component 时使用 component.el', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            const childEl = document.createElement('span');
            const innerEl = document.createElement('b');
            childEl.appendChild(innerEl);
            inst.nodeMapMgr = {
                getAll: () => ({
                    icon: { component: { el: childEl } },
                }),
            };
            expect(inst.containsElement('icon', innerEl)).toBe(true);
        });

        it('节点有 component 但 el 不存在时返回 false', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            inst.nodeMapMgr = {
                getAll: () => ({
                    icon: { component: { el: undefined } },
                }),
            };
            const target = document.createElement('div');
            expect(inst.containsElement('icon', target)).toBe(false);
        });

        it('节点无 component 时使用 node.el', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            const nodeEl = document.createElement('span');
            const innerEl = document.createElement('b');
            nodeEl.appendChild(innerEl);
            inst.nodeMapMgr = {
                getAll: () => ({
                    label: { el: nodeEl },
                }),
            };
            expect(inst.containsElement('label', innerEl)).toBe(true);
        });

        it('node.el 不存在时返回 false', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            inst.nodeMapMgr = {
                getAll: () => ({
                    label: { el: undefined },
                }),
            };
            const target = document.createElement('div');
            expect(inst.containsElement('label', target)).toBe(false);
        });
    });

    describe('onBeforeDispose', () => {
        let registry: ComponentRegistrar;

        beforeEach(() => {
            registry = getRegistry();
        });

        afterEach(() => {
            registry.clear();
        });

        it('onBeforeUnmount 被调用', async () => {
            let unmounted = false;
            class TestComp extends Component {
                onBeforeUnmount() {
                    unmounted = true;
                }
            }
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            inst.dispose();
            expect(unmounted).toBe(true);
        });

        it('有 parent + slotName 且 parent 未 disposing 时恢复骨架', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            const restoreSkeleton = jest.fn();
            inst.parent = {
                _disposing: false,
                nodeMapMgr: {
                    get: () => ({ component: inst }),
                    restoreSkeleton,
                },
            };
            inst.slotName = 'body';
            inst.dispose();
            expect(restoreSkeleton).toHaveBeenCalledWith('body');
        });

        it('parent._disposing 为 true 时不恢复骨架', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            const restoreSkeleton = jest.fn();
            inst.parent = {
                _disposing: true,
                nodeMapMgr: {
                    get: () => ({ component: inst }),
                    restoreSkeleton,
                },
            };
            inst.slotName = 'body';
            inst.dispose();
            expect(restoreSkeleton).not.toHaveBeenCalled();
        });

        it('isItemContainer 为 true 时不恢复骨架', async () => {
            class TestComp extends Component {
                get isItemContainer() {
                    return true;
                }
            }
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            const restoreSkeleton = jest.fn();
            inst.parent = {
                _disposing: false,
                nodeMapMgr: {
                    get: () => ({ component: inst }),
                    restoreSkeleton,
                },
            };
            inst.slotName = 'body';
            inst.dispose();
            expect(restoreSkeleton).not.toHaveBeenCalled();
        });

        it('node.component !== this 时不恢复骨架', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            const restoreSkeleton = jest.fn();
            inst.parent = {
                _disposing: false,
                nodeMapMgr: {
                    get: () => ({ component: {} }),
                    restoreSkeleton,
                },
            };
            inst.slotName = 'body';
            inst.dispose();
            expect(restoreSkeleton).not.toHaveBeenCalled();
        });

        it('parentNodeMapMgr 不存在时不恢复骨架', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            inst.parent = { _disposing: false };
            inst.slotName = 'body';
            inst.dispose();
        });

        it('dispose 后 _dirtyNodes 被清空', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            inst._dirtyNodes = { root: { cls: 'test' } };
            inst.dispose();
            expect(inst._dirtyNodes).toEqual({});
        });

        it('dispose 后 _initializing 为 false', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            inst.dispose();
            expect(inst._initializing).toBe(false);
        });
    });

    describe('dispose', () => {
        let registry: ComponentRegistrar;

        beforeEach(() => {
            registry = getRegistry();
        });

        afterEach(() => {
            registry.clear();
        });

        it('dispose 后 _disposing 为 true', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            inst.dispose();
            expect(inst._disposing).toBe(true);
        });

        it('dispose 后 meta 被清空', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp() as any;
            await inst.ready;
            inst.meta = { foo: 'bar' };
            inst.dispose();
            expect(inst.meta).toEqual({});
        });

        it('dispose 后 props 被清空', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const inst = new TestComp({ myProp: 'hello' }) as any;
            await inst.ready;
            inst.dispose();
            expect(inst.props).toEqual({});
        });

        it('dispose 后 el 被移除', async () => {
            class TestComp extends Component {}
            const tpl: TplNode = { tag: 'div' };
            registry.register(TestComp, tpl);

            const container = document.createElement('div');
            document.body.appendChild(container);
            const inst = new TestComp() as any;
            await inst.ready;
            container.appendChild(inst.el);
            expect(container.contains(inst.el)).toBe(true);
            inst.dispose();
            expect(container.contains(inst.el)).toBe(false);
            container.remove();
        });
    });
});
