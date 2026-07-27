/**
 * TemplateRegistrar 单元测试
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

import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import type { TplNode } from '@/component-core/types/tpl-node-types';

function resetSingleton(): void {
    const base = Object.getPrototypeOf(TemplateRegistrar);
    (base as any).instances = new Map();
}

function createRegistry(): TemplateRegistrar {
    resetSingleton();
    return TemplateRegistrar.getInstance();
}

afterEach(() => {
    resetSingleton();
});

describe('TemplateRegistrar', () => {
    describe('register', () => {
        it('注册基础模板', () => {
            const registry = createRegistry();
            const tpl: TplNode = { tag: 'div', cls: 'q-test' };
            registry.register('Base', tpl);
            expect(registry.has('Base')).toBe(true);
        });

        it('注册含命名节点的模板', () => {
            const registry = createRegistry();
            const tpl: TplNode = {
                tag: 'div',
                children: [{ tag: 'span', name: 'label', cls: 'q-label' }],
            };
            registry.register('WithNodes', tpl);
            expect(registry.has('WithNodes')).toBe(true);
        });

        it('重复注册覆盖旧模板', () => {
            const registry = createRegistry();
            registry.register('Overwrite', { tag: 'div', cls: 'a' });
            registry.register('Overwrite', { tag: 'span', cls: 'b' });
            const compiled = registry.get('Overwrite');
            expect(compiled).toBeDefined();
        });

        it('锁定后注册抛出异常', () => {
            const registry = createRegistry();
            registry.register('LockTest', { tag: 'div' });
            registry.lock();
            expect(() => registry.register('LockTest2', { tag: 'div' })).toThrow();
        });
    });

    describe('get — 懒编译', () => {
        it('未注册返回 undefined', () => {
            const registry = createRegistry();
            expect(registry.get('NotExist')).toBeUndefined();
        });

        it('首次 get 触发编译返回产物', () => {
            const registry = createRegistry();
            registry.register('Lazy', {
                tag: 'div',
                children: [{ tag: 'span', name: 'label', cls: 'q-label' }],
            });
            const compiled = registry.get('Lazy');
            expect(compiled).toBeDefined();
            expect(compiled!.cache).toBeDefined();
            expect(compiled!.nodeMetas).toBeDefined();
            expect(compiled!.nodeMetas.label).toBeDefined();
        });

        it('重复 get 返回同一缓存产物', () => {
            const registry = createRegistry();
            registry.register('Cache', {
                tag: 'div',
                children: [{ tag: 'span', name: 'x' }],
            });
            const first = registry.get('Cache');
            const second = registry.get('Cache');
            expect(first).toBe(second);
        });

        it('编译产物包含 cache 和 nodeMetas', () => {
            const registry = createRegistry();
            registry.register('Product', {
                tag: 'div',
                cls: 'q-product',
                children: [
                    { tag: 'span', name: 'a', cls: 'q-a' },
                    { tag: 'span', name: 'b', cls: 'q-b' },
                ],
            });
            const compiled = registry.get('Product')!;
            expect(Object.keys(compiled.nodeMetas)).toEqual(expect.arrayContaining(['a', 'b']));
            expect(compiled.cache).toBeDefined();
        });
    });

    describe('replace', () => {
        it('tpl.replace 从母模板合并', () => {
            const registry = createRegistry();
            registry.register('FormBase', {
                tag: 'div',
                cls: 'q-form',
                children: [
                    { tag: 'label', name: 'label', cls: 'q-form__label' },
                    { tag: 'div', name: 'field', cls: 'q-form__field' },
                ],
            });

            registry.register('InputForm', {
                replace: 'FormBase',
                replaces: {
                    field: {
                        tag: 'input',
                        name: 'field',
                        cls: 'q-input',
                    },
                },
            });

            const compiled = registry.get('InputForm');
            expect(compiled).toBeDefined();
            expect(compiled!.nodeMetas.label).toBeDefined();
            expect(compiled!.nodeMetas.field).toBeDefined();
        });

        it('replace 子树替换：整节点替换', () => {
            const registry = createRegistry();
            registry.register('ReplaceBase', {
                tag: 'div',
                cls: 'q-base',
                children: [{ tag: 'span', name: 'content', cls: 'q-base__content' }],
            });

            registry.register('ReplaceDerived', {
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
            });

            const compiled = registry.get('ReplaceDerived')!;
            expect(compiled.nodeMetas.icon).toBeDefined();
            expect(compiled.nodeMetas.text).toBeDefined();
        });

        it('replace 属性覆盖：无 tag/children 时 Object.assign', () => {
            const registry = createRegistry();
            registry.register('AttrBase', {
                tag: 'div',
                children: [{ tag: 'span', name: 'title', cls: 'q-title', hidden: false }],
            });

            registry.register('AttrDerived', {
                replace: 'AttrBase',
                replaces: {
                    title: { hidden: true },
                },
            });

            const compiled = registry.get('AttrDerived')!;
            expect(compiled.nodeMetas.title).toBeDefined();
        });

        it('replace 来源不存在时 warn 并使用原 tpl', () => {
            const registry = createRegistry();
            const tpl: TplNode = {
                tag: 'div',
                cls: 'q-fallback',
                replace: 'NotExist',
                replaces: {},
            };
            registry.register('Fallback', tpl);
            const compiled = registry.get('Fallback');
            expect(compiled).toBeDefined();
        });

        it('replace 无 replaces 时默认空对象', () => {
            const registry = createRegistry();
            registry.register('NoReplacesBase', {
                tag: 'div',
                children: [{ tag: 'span', name: 'a', cls: 'q-a' }],
            });

            registry.register('NoReplacesDerived', {
                replace: 'NoReplacesBase',
            } as TplNode);

            const compiled = registry.get('NoReplacesDerived');
            expect(compiled).toBeDefined();
            expect(compiled!.nodeMetas.a).toBeDefined();
        });
    });

    describe('has', () => {
        it('已注册返回 true', () => {
            const registry = createRegistry();
            registry.register('Exist', { tag: 'div' });
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
            registry.register('A', { tag: 'div' });
            registry.register('B', { tag: 'span' });
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
        it('注销已注册模板', () => {
            const registry = createRegistry();
            registry.register('ToRemove', { tag: 'div' });
            expect(registry.has('ToRemove')).toBe(true);
            registry.unregister('ToRemove');
            expect(registry.has('ToRemove')).toBe(false);
        });

        it('注销后 get 返回 undefined', () => {
            const registry = createRegistry();
            registry.register('ToRemove2', { tag: 'div' });
            registry.unregister('ToRemove2');
            expect(registry.get('ToRemove2')).toBeUndefined();
        });

        it('锁定后注销抛出异常', () => {
            const registry = createRegistry();
            registry.register('LockRemove', { tag: 'div' });
            registry.lock();
            expect(() => registry.unregister('LockRemove')).toThrow();
        });
    });

    describe('replaceGraph', () => {
        it('返回 replace 派生关系', () => {
            const registry = createRegistry();
            registry.register('Base', { tag: 'div' });
            registry.register('Derived', { replace: 'Base', replaces: {} } as TplNode);
            registry.register('Standalone', { tag: 'span' });

            const graph = registry.replaceGraph();
            expect(graph.get('Base')).toBeUndefined();
            expect(graph.get('Derived')).toBe('Base');
            expect(graph.get('Standalone')).toBeUndefined();
        });
    });

    describe('doInspect', () => {
        it('inspect 不抛异常', () => {
            const registry = createRegistry();
            registry.register('Inspect1', { tag: 'div' });
            registry.register('Inspect2', {
                tag: 'div',
                children: [{ tag: 'span', name: 'x' }],
            });
            expect(() => registry.inspect()).not.toThrow();
        });

        it('inspect 含已编译产物时不抛异常', () => {
            const registry = createRegistry();
            registry.register('InspectCompiled', {
                tag: 'div',
                children: [{ tag: 'span', name: 'y' }],
            });
            registry.get('InspectCompiled');
            expect(() => registry.inspect()).not.toThrow();
        });

        it('inspect 含 replace 模板时不抛异常', () => {
            const registry = createRegistry();
            registry.register('InspectBase', {
                tag: 'div',
                children: [{ tag: 'span', name: 'a' }],
            });
            registry.register('InspectDerived', {
                replace: 'InspectBase',
                replaces: {},
            } as TplNode);
            expect(() => registry.inspect()).not.toThrow();
        });
    });
});
