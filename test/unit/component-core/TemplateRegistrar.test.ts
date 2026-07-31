/**
 * ComponentRegistrar 单元测试
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

import { ComponentRegistrar } from '@/component-core/engine/ComponentRegistrar';
import type { TplNode } from '@/component-core/types/tpl-node-types';

function resetSingleton(): void {
    const base = Object.getPrototypeOf(ComponentRegistrar);
    (base as any).instances = new Map();
}

function createRegistry(): ComponentRegistrar {
    resetSingleton();
    return ComponentRegistrar.getInstance();
}

function makeComponent(type: string): new (props?: Record<string, any>) => any {
    class MockComponent {
        static get type() {
            return type;
        }
        constructor(props?: Record<string, any>) {}
    }
    return MockComponent as any;
}

afterEach(() => {
    resetSingleton();
});

describe('ComponentRegistrar', () => {
    describe('getInstance', () => {
        it('返回单例实例', () => {
            const registry = createRegistry();
            const instance2 = ComponentRegistrar.getInstance();
            expect(registry).toBe(instance2);
        });
    });

    describe('register', () => {
        it('注册带模板的组件', () => {
            const registry = createRegistry();
            const Btn = makeComponent('Button');
            const tpl: TplNode = { tag: 'div', cls: 'q-btn' };
            registry.register(Btn, tpl);
            expect(registry.has('Button')).toBe(true);
        });

        it('注册无模板的组件', () => {
            const registry = createRegistry();
            const Comp = makeComponent('MyComp');
            registry.register(Comp);
            expect(registry.has('MyComp')).toBe(true);
        });

        it('组件无 type getter 时从类名自动派生', () => {
            const registry = createRegistry();
            class NoType {
                constructor() {}
            }
            registry.register(NoType as any);
            expect(registry.has('NoType')).toBe(true);
            expect((NoType as any).type).toBe('NoType');
        });

        it('重复注册覆盖旧条目', () => {
            const registry = createRegistry();
            const Btn1 = makeComponent('Button');
            const Btn2 = makeComponent('Button');
            registry.register(Btn1, { tag: 'div', cls: 'a' });
            registry.register(Btn2, { tag: 'span', cls: 'b' });
            expect(registry.get('Button')).toBe(Btn2);
        });

        it('锁定后仍允许动态注册（RowEngine / ItemContainer 场景）', () => {
            const registry = createRegistry();
            const Btn = makeComponent('Button');
            registry.register(Btn, { tag: 'div' });
            registry.lock();
            const Btn2 = makeComponent('Button2');
            // lock 后仍可注册 —— 运行时动态注册需要
            expect(() => registry.register(Btn2, { tag: 'div' })).not.toThrow();
            expect(registry.get('Button2')).toBe(Btn2);
        });

        it('注册含命名节点的模板', () => {
            const registry = createRegistry();
            const Comp = makeComponent('WithNodes');
            const tpl: TplNode = {
                tag: 'div',
                children: [{ tag: 'span', name: 'label', cls: 'q-label' }],
            };
            registry.register(Comp, tpl);
            expect(registry.has('WithNodes')).toBe(true);
        });
    });

    describe('get', () => {
        it('返回已注册的组件类', () => {
            const registry = createRegistry();
            const Btn = makeComponent('Button');
            registry.register(Btn, { tag: 'div' });
            expect(registry.get('Button')).toBe(Btn);
        });

        it('未注册返回 undefined', () => {
            const registry = createRegistry();
            expect(registry.get('NotExist')).toBeUndefined();
        });
    });

    describe('getCompiled', () => {
        it('首次获取触发编译返回产物', () => {
            const registry = createRegistry();
            const Comp = makeComponent('Lazy');
            registry.register(Comp, {
                tag: 'div',
                children: [{ tag: 'span', name: 'label', cls: 'q-label' }],
            });
            const compiled = registry.getCompiled('Lazy');
            expect(compiled).toBeDefined();
            expect(compiled!.cache).toBeDefined();
            expect(compiled!.nodeMetas).toBeDefined();
            expect(compiled!.nodeMetas.label).toBeDefined();
        });

        it('重复获取返回同一缓存产物', () => {
            const registry = createRegistry();
            const Comp = makeComponent('Cache');
            registry.register(Comp, {
                tag: 'div',
                children: [{ tag: 'span', name: 'x' }],
            });
            const first = registry.getCompiled('Cache');
            const second = registry.getCompiled('Cache');
            expect(first).toBe(second);
        });

        it('未注册返回 undefined', () => {
            const registry = createRegistry();
            expect(registry.getCompiled('NotExist')).toBeUndefined();
        });

        it('编译产物包含 cache 和 nodeMetas', () => {
            const registry = createRegistry();
            const Comp = makeComponent('Product');
            registry.register(Comp, {
                tag: 'div',
                cls: 'q-product',
                children: [
                    { tag: 'span', name: 'a', cls: 'q-a' },
                    { tag: 'span', name: 'b', cls: 'q-b' },
                ],
            });
            const compiled = registry.getCompiled('Product')!;
            expect(Object.keys(compiled.nodeMetas)).toEqual(expect.arrayContaining(['a', 'b']));
            expect(compiled.cache).toBeDefined();
        });

        it('无模板组件沿 tplName 获取编译产物', () => {
            const registry = createRegistry();
            const Parent = makeComponent('Parent');

            registry.register(Parent, {
                tag: 'div',
                children: [{ tag: 'span', name: 'inner' }],
            });

            class ChildClass extends (Parent as any) {
                static get type() {
                    return 'Child';
                }
                constructor(props?: Record<string, any>) {
                    super(props);
                }
            }
            registry.register(ChildClass as any);

            const compiled = registry.getCompiled('Child');
            expect(compiled).toBeDefined();
            expect(compiled!.nodeMetas.inner).toBeDefined();
        });

        it('无模板且无 tplName 返回 undefined', () => {
            const registry = createRegistry();
            const Comp = makeComponent('NoTpl');
            registry.register(Comp);
            expect(registry.getCompiled('NoTpl')).toBeUndefined();
        });

        it('同一模板对象被多个组件使用时只编译一次', () => {
            const registry = createRegistry();
            const SHARED_TPL: TplNode = {
                tag: 'div',
                children: [{ tag: 'span', name: 'shared' }],
            };

            const Comp1 = makeComponent('Shared1');
            const Comp2 = makeComponent('Shared2');

            registry.register(Comp1, SHARED_TPL);
            registry.register(Comp2, SHARED_TPL);  // 同一模板对象

            const compiled1 = registry.getCompiled('Shared1');
            const compiled2 = registry.getCompiled('Shared2');

            expect(compiled1).toBeDefined();
            expect(compiled2).toBeDefined();
            // 两个组件共享同一编译产物
            expect(compiled1).toBe(compiled2);
        });
    });

    describe('replace', () => {
        it('tpl.replace 从母模板合并', () => {
            const registry = createRegistry();
            const Base = makeComponent('FormBase');
            const Derived = makeComponent('InputForm');

            registry.register(Base, {
                tag: 'div',
                cls: 'q-form',
                children: [
                    { tag: 'label', name: 'label', cls: 'q-form__label' },
                    { tag: 'div', name: 'field', cls: 'q-form__field' },
                ],
            });

            registry.register(Derived, {
                replace: 'FormBase',
                replaces: {
                    field: {
                        tag: 'input',
                        name: 'field',
                        cls: 'q-input',
                    },
                },
            } as TplNode);

            const compiled = registry.getCompiled('InputForm');
            expect(compiled).toBeDefined();
            expect(compiled!.nodeMetas.label).toBeDefined();
            expect(compiled!.nodeMetas.field).toBeDefined();
        });

        it('replace 子树替换：整节点替换', () => {
            const registry = createRegistry();
            const Base = makeComponent('ReplaceBase');
            const Derived = makeComponent('ReplaceDerived');

            registry.register(Base, {
                tag: 'div',
                cls: 'q-base',
                children: [{ tag: 'span', name: 'content', cls: 'q-base__content' }],
            });

            registry.register(Derived, {
                replace: 'ReplaceBase',
                replaces: {
                    content: {
                        tag: 'div',
                        cls: 'q-derived__content',
                        children: [
                            { tag: 'span', name: 'icon', cls: 'q-icon' },
                            { tag: 'span', name: 'text', cls: 'q-text' },
                        ],
                    },
                },
            } as TplNode);

            const compiled = registry.getCompiled('ReplaceDerived')!;
            expect(compiled.nodeMetas.icon).toBeDefined();
            expect(compiled.nodeMetas.text).toBeDefined();
        });

        it('replace 属性覆盖：无 tag/children 时 Object.assign', () => {
            const registry = createRegistry();
            const Base = makeComponent('AttrBase');
            const Derived = makeComponent('AttrDerived');

            registry.register(Base, {
                tag: 'div',
                children: [{ tag: 'span', name: 'title', cls: 'q-title', hidden: false }],
            });

            registry.register(Derived, {
                replace: 'AttrBase',
                replaces: {
                    title: { hidden: true },
                },
            } as TplNode);

            const compiled = registry.getCompiled('AttrDerived')!;
            expect(compiled.nodeMetas.title).toBeDefined();
        });

        it('replace 来源不存在时 warn 并使用原 tpl', () => {
            const registry = createRegistry();
            const Comp = makeComponent('Fallback');
            const tpl: TplNode = {
                tag: 'div',
                cls: 'q-fallback',
                replace: 'NotExist',
                replaces: {},
            };
            registry.register(Comp, tpl);
            const compiled = registry.getCompiled('Fallback');
            expect(compiled).toBeDefined();
        });

        it('replace 无 replaces 时默认空对象', () => {
            const registry = createRegistry();
            const Base = makeComponent('NoReplacesBase');
            const Derived = makeComponent('NoReplacesDerived');

            registry.register(Base, {
                tag: 'div',
                children: [{ tag: 'span', name: 'a', cls: 'q-a' }],
            });

            registry.register(Derived, {
                replace: 'NoReplacesBase',
            } as TplNode);

            const compiled = registry.getCompiled('NoReplacesDerived');
            expect(compiled).toBeDefined();
            expect(compiled!.nodeMetas.a).toBeDefined();
        });
    });

    describe('has', () => {
        it('已注册返回 true', () => {
            const registry = createRegistry();
            const Comp = makeComponent('Exist');
            registry.register(Comp, { tag: 'div' });
            expect(registry.has('Exist')).toBe(true);
        });

        it('未注册返回 false', () => {
            const registry = createRegistry();
            expect(registry.has('NoExist')).toBe(false);
        });
    });

    describe('names', () => {
        it('返回所有已注册名称', () => {
            const registry = createRegistry();
            registry.register(makeComponent('A'), { tag: 'div' });
            registry.register(makeComponent('B'), { tag: 'span' });
            const nameList = registry.names();
            expect(nameList).toEqual(expect.arrayContaining(['A', 'B']));
            expect(nameList.length).toBe(2);
        });

        it('空注册表返回空数组', () => {
            const registry = createRegistry();
            expect(registry.names()).toEqual([]);
        });
    });

    describe('unregister', () => {
        it('注销已注册组件', () => {
            const registry = createRegistry();
            const Comp = makeComponent('ToRemove');
            registry.register(Comp, { tag: 'div' });
            expect(registry.has('ToRemove')).toBe(true);
            registry.unregister('ToRemove');
            expect(registry.has('ToRemove')).toBe(false);
        });

        it('注销后 get 返回 undefined', () => {
            const registry = createRegistry();
            const Comp = makeComponent('ToRemove2');
            registry.register(Comp, { tag: 'div' });
            registry.unregister('ToRemove2');
            expect(registry.get('ToRemove2')).toBeUndefined();
        });

        it('锁定后仍允许动态注销（运行时场景）', () => {
            const registry = createRegistry();
            const Comp = makeComponent('LockRemove');
            registry.register(Comp, { tag: 'div' });
            registry.lock();
            // lock 后仍可注销 —— 运行时动态注册需要
            expect(() => registry.unregister('LockRemove')).not.toThrow();
            expect(registry.has('LockRemove')).toBe(false);
        });
    });

    describe('replaceGraph', () => {
        it('返回 replace 派生关系', () => {
            const registry = createRegistry();
            registry.register(makeComponent('Base'), { tag: 'div' });
            registry.register(makeComponent('Derived'), {
                replace: 'Base',
                replaces: {},
            } as TplNode);
            registry.register(makeComponent('Standalone'), { tag: 'span' });

            const graph = registry.replaceGraph();
            expect(graph.get('Base')).toBeUndefined();
            expect(graph.get('Derived')).toBe('Base');
            expect(graph.get('Standalone')).toBeUndefined();
        });
    });

    describe('doInspect', () => {
        it('inspect 不抛异常', () => {
            const registry = createRegistry();
            registry.register(makeComponent('Inspect1'), { tag: 'div' });
            registry.register(makeComponent('Inspect2'), {
                tag: 'div',
                children: [{ tag: 'span', name: 'x' }],
            });
            expect(() => registry.inspect()).not.toThrow();
        });

        it('inspect 含已编译产物时不抛异常', () => {
            const registry = createRegistry();
            registry.register(makeComponent('InspectCompiled'), {
                tag: 'div',
                children: [{ tag: 'span', name: 'y' }],
            });
            registry.getCompiled('InspectCompiled');
            expect(() => registry.inspect()).not.toThrow();
        });

        it('inspect 含 replace 模板时不抛异常', () => {
            const registry = createRegistry();
            registry.register(makeComponent('InspectBase'), {
                tag: 'div',
                children: [{ tag: 'span', name: 'a' }],
            });
            registry.register(makeComponent('InspectDerived'), {
                replace: 'InspectBase',
                replaces: {},
            } as TplNode);
            expect(() => registry.inspect()).not.toThrow();
        });

        it('inspect 含无模板组件时不抛异常', () => {
            const registry = createRegistry();
            registry.register(makeComponent('NoTplComp'));
            expect(() => registry.inspect()).not.toThrow();
        });
    });

    describe('createNodeMapManager', () => {
        it('基于编译产物创建 NodeMapManager', () => {
            const registry = createRegistry();
            registry.register(makeComponent('TestTpl'), {
                tag: 'div',
                children: [
                    { tag: 'span', name: 'title' },
                    { tag: 'span', name: 'content' },
                ],
            });

            const manager = registry.createNodeMapManager('TestTpl');
            expect(manager).toBeDefined();
            expect(manager).toHaveProperty('get');
            expect(manager).toHaveProperty('set');
        });

        it('模板不存在时返回 undefined', () => {
            const registry = createRegistry();
            const manager = registry.createNodeMapManager('NotExist');
            expect(manager).toBeUndefined();
        });

        it('接受可选的 owner 参数', () => {
            const registry = createRegistry();
            registry.register(makeComponent('OwnerTpl'), {
                tag: 'div',
                children: [{ tag: 'span', name: 'label' }],
            });

            const owner = { id: 'testOwner' };
            const manager = registry.createNodeMapManager('OwnerTpl', owner);
            expect(manager).toBeDefined();
        });

        it('创建前先触发编译', () => {
            const registry = createRegistry();
            registry.register(makeComponent('LazyTpl'), {
                tag: 'div',
                children: [{ tag: 'span', name: 'text' }],
            });

            const manager = registry.createNodeMapManager('LazyTpl');
            expect(manager).toBeDefined();
            const compiled = registry.getCompiled('LazyTpl');
            expect(compiled).toBeDefined();
        });

        it('创建的 NodeMapManager 能管理节点', () => {
            const registry = createRegistry();
            registry.register(makeComponent('NodeTestTpl'), {
                tag: 'div',
                children: [
                    { tag: 'span', name: 'node1' },
                    { tag: 'span', name: 'node2' },
                ],
            });

            const manager = registry.createNodeMapManager('NodeTestTpl');
            expect(manager).toBeDefined();

            const el1 = document.createElement('span');
            const el2 = document.createElement('span');
            manager!.set('node1', el1);
            manager!.set('node2', el2);
            expect(manager!.get('node1')).toBeDefined();
            expect(manager!.get('node2')).toBeDefined();
        });

        it('replace 模板创建的 NodeMapManager 包含合并后的节点', () => {
            const registry = createRegistry();
            registry.register(makeComponent('BaseTpl'), {
                tag: 'div',
                children: [
                    { tag: 'span', name: 'label' },
                    { tag: 'div', name: 'content' },
                ],
            });

            registry.register(makeComponent('DerivedTpl'), {
                replace: 'BaseTpl',
                replaces: {
                    content: {
                        tag: 'div',
                        children: [
                            { tag: 'span', name: 'icon' },
                            { tag: 'span', name: 'text' },
                        ],
                    },
                },
            } as TplNode);

            const manager = registry.createNodeMapManager('DerivedTpl');
            expect(manager).toBeDefined();
            const compiled = registry.getCompiled('DerivedTpl');
            expect(compiled!.nodeMetas.label).toBeDefined();
        });
    });

    describe('clear', () => {
        it('清空所有注册', () => {
            const registry = createRegistry();
            registry.register(makeComponent('A'), { tag: 'div' });
            registry.register(makeComponent('B'), { tag: 'span' });
            expect(registry.names()).toHaveLength(2);
            registry.clear();
            expect(registry.names()).toHaveLength(0);
        });
    });

    describe('lock', () => {
        it('锁定后仍允许动态注册（运行时编译场景）', () => {
            const registry = createRegistry();
            registry.lock();
            const Comp = makeComponent('Locked');
            // lock 后仍可注册 —— RowEngine / ItemContainer 运行时动态注册需要
            expect(() => registry.register(Comp, { tag: 'div' })).not.toThrow();
            expect(registry.get('Locked')).toBe(Comp);
        });
    });
});
