jest.mock('@/events', () => ({
    COMPONENT_LIFECYCLE_EVENTS: {
        INIT: 'init',
        MOUNTED: 'mounted',
        BEFORE_UNMOUNT: 'beforeunmount',
        DISPOSE: 'dispose',
        UPDATED: 'updated',
        RESIZE: 'resize',
        HIDDEN_CHANGE: 'hiddenchange',
    },
}));

jest.mock('@/composable', () => ({
    ComposableBase: class ComposableBase {
        constructor() {}
    },
    withAbilities: jest.fn(),
}));

jest.mock('@/system-abilities', () => ({
    EventAbility: { name: 'EventAbility' },
    DomEventsAbility: { name: 'DomEventsAbility' },
    EventBridgeAbility: { name: 'EventBridgeAbility' },
    EntityEventBusAbility: { name: 'EntityEventBusAbility' },
    OverlayEventBusAbility: { name: 'OverlayEventBusAbility' },
    DragEventBusAbility: { name: 'DragEventBusAbility' },
    SystemEventBusAbility: { name: 'SystemEventBusAbility' },
}));

jest.mock('@/component-core/engine/TemplateCompiler', () => ({
    VOID_TAGS: new Set(),
    compilePendingTemplate: jest.fn(),
    expandFragments: jest.fn((tpl: any) => tpl),
    compileTemplate: jest.fn((tpl: any, logger: any) => {
        const nodeMetas: any = { root: { name: 'root', tag: tpl?.tag || 'div', componentClass: tpl?.type } };
        const indexPath: any = { root: [] };
        if (tpl?.children) {
            for (const child of tpl.children) {
                if (child.name) {
                    nodeMetas[child.name] = { name: child.name, tag: child.tag, componentClass: child.type };
                    indexPath[child.name] = [0];
                }
            }
        }
        return { html: '<div></div>', indexPath, nodeMetas, exposeNames: [], i18nNodes: [] };
    }),
    findByPath: jest.fn(),
    TemplateCompiler: {
        compile: jest.fn((tpl: any, owner?: any) => {
            const nodeMetas: any = { root: { name: 'root', tag: tpl?.tag || 'div', componentClass: tpl?.type } };
            const indexPath: any = { root: [] };
            if (tpl?.children) {
                for (let i = 0; i < tpl.children.length; i++) {
                    const child = tpl.children[i];
                    if (child.name) {
                        nodeMetas[child.name] = { name: child.name, tag: child.tag, componentClass: child.type };
                        indexPath[child.name] = [i];
                    }
                }
            }
            return {
                cache: {
                    html: '<div></div>',
                    indexPath,
                    exposeNames: [],
                    i18nNodes: [],
                    templateCache: document.createElement('template'),
                },
                nodeMetas,
            };
        }),
    },
}));

jest.mock('@/component-core/engine/TemplateDeriver', () => ({
    TemplateDeriver: {
        derive: jest.fn((parentCache: any, parentNodeMetas: any, nodeOverrides?: any) => {
            const clonedNodeMetas: any = {};
            if (parentNodeMetas) {
                for (const [key, meta] of Object.entries(parentNodeMetas)) {
                    clonedNodeMetas[key] = { ...(meta as any) };
                }
            }
            if (nodeOverrides) {
                for (const [nodeName, override] of Object.entries(nodeOverrides)) {
                    const meta = clonedNodeMetas[nodeName];
                    if (meta && (override as any).type !== undefined) {
                        meta.componentClass = (override as any).type;
                    }
                }
            }
            return { cache: parentCache, nodeMetas: clonedNodeMetas };
        }),
    },
}));

jest.mock('@/component-core/engine/ChildNodeProps', () => ({
    applyChildNodeProps: jest.fn(),
    buildChildNodePropDescs: jest.fn(() => ({})),
}));

jest.mock('@/logger', () => ({
    Logger: {
        for: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
    },
}));

jest.mock('@/i18n', () => ({
    resolveI18nValue: jest.fn((key: string) => key),
}));

jest.mock('@/component-core/engine/RuntimeEngine', () => {
    function executeOverrideQueue(instance: any, methodName: string, ...args: any[]): any {
        const ctor = instance.constructor as any;
        const queues = ctor._overrideQueues;
        if (!queues || !queues[methodName]) return;

        const hooks = queues[methodName];
        if (methodName === 'onInitState') {
            const mergedState: Record<string, any> = {};
            for (const hook of hooks) {
                const state = hook.apply(instance, args);
                if (state && typeof state === 'object') {
                    Object.assign(mergedState, state);
                }
            }
            Object.assign(instance, mergedState);
            return mergedState;
        } else {
            let lastResult: any;
            for (const hook of hooks) {
                lastResult = hook.apply(instance, args);
            }
            return lastResult;
        }
    }

    return {
        RuntimeEngine: {
            init: jest.fn(),
        },
        executeOverrideQueue,
    };
});

describe('template-factory', () => {
    describe('createInnerClass', () => {
        it('first compile calls TemplateCompiler.compile', () => {
            const { createInnerClass } = require('@/component-core/engine/TemplateFactory');
            const { TemplateCompiler } = require('@/component-core/engine/TemplateCompiler');
            
            const compileMock = TemplateCompiler.compile as jest.Mock;
            compileMock.mockClear();
            
            const Parent = require('@/composable').ComposableBase;
            createInnerClass(Parent, { tag: 'div' });
            expect(compileMock).toHaveBeenCalled();
        });

        it('saves _tpl, _body, _cache and _nodeMetas', () => {
            const { createInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const body = { type: 'Test', greet() { return 'hello'; } };
            const tpl = { tag: 'div', cls: 'test' };
            const Cls = createInnerClass(Parent, tpl, body);
            expect(Cls._tpl).toBe(tpl);
            expect(Cls._body).toBe(body);
            expect(Cls._cache).toBeDefined();
            expect(Cls._nodeMetas).toBeDefined();
        });

        it('provides create/with/replace static methods', () => {
            const { createInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const Cls = createInnerClass(Parent, { tag: 'div' });
            expect(typeof Cls.create).toBe('function');
            expect(typeof Cls.with).toBe('function');
            expect(typeof Cls.replace).toBe('function');
        });
    });

    describe('createDerivedInnerClass (optimized)', () => {
        it('reuses parent _tpl and _body', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, { type: 'Parent' });
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                body: { greet() { return 'derived'; } },
            });
            
            expect(DerivedClass._tpl).toBe(ParentClass._tpl);
            expect(DerivedClass._body).toBeDefined();
        });

        it('derived class uses TemplateDeriver.derive without recompiling', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const { TemplateCompiler } = require('@/component-core/engine/TemplateCompiler');
            const { TemplateDeriver } = require('@/component-core/engine/TemplateDeriver');
            
            const compileMock = TemplateCompiler.compile as jest.Mock;
            const deriveMock = TemplateDeriver.derive as jest.Mock;
            
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, { type: 'Parent' });
            
            compileMock.mockClear();
            deriveMock.mockClear();
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                body: { greet() { return 'derived'; } },
            });
            
            expect(compileMock).not.toHaveBeenCalled();
            expect(deriveMock).toHaveBeenCalled();
        });

        it('derived _cache shares same reference as parent (read-only shared)', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, { type: 'Parent' });
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                body: { greet() { return 'derived'; } },
            });
            
            expect(DerivedClass._cache).toBe(ParentClass._cache);
        });

        it('derived _nodeMetas is independent copy (per class)', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, { type: 'Parent' });
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                body: { greet() { return 'derived'; } },
            });
            
            expect(DerivedClass._nodeMetas).not.toBe(ParentClass._nodeMetas);
            expect(DerivedClass._nodeMetas.root).toBeDefined();
        });

        it('merges body (child overrides parent)', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Parent',
                greet() { return 'parent'; },
                farewell() { return 'parent bye'; },
            });
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                body: {
                    greet() { return 'derived'; },
                },
            });
            
            const body = DerivedClass._body;
            expect(body.greet()).toBe('derived');
            expect(body.farewell()).toBeDefined();
        });

        it('supports two body styles', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            
            const Cls1 = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Style1',
                greet() { return 'hello'; },
            });
            
            const Cls2 = createDerivedInnerClass(Cls1, {
                type: 'Style2',
                body: { greet() { return 'hello2'; } },
            });
            
            expect(Cls2._body.greet).toBeDefined();
        });

        it('overrides methods form chained queue', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Parent',
                onInitState() { return { parentState: true }; },
            });
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                body: {
                    onInitState() { return { childState: true }; },
                },
            });
            
            const queues = DerivedClass._overrideQueues;
            expect(queues).toBeDefined();
            expect(queues.onInitState).toBeDefined();
            expect(queues.onInitState!.length).toBe(2);
        });

        it('non-overrides methods directly override', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Parent',
                greet() { return 'parent'; },
            });
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                body: {
                    greet() { return 'derived'; },
                },
            });
            
            expect(DerivedClass.prototype.greet()).toBe('derived');
        });

        it('supports nodeOverrides to update component type', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const FakeComp = class {};
            const ParentClass = createInnerClass(Parent, { tag: 'div', children: [{ name: 'icon' }] }, { type: 'Parent' });
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                nodeOverrides: {
                    icon: { type: FakeComp },
                },
            });
            
            expect(DerivedClass._nodeMetas.icon.componentClass).toBe(FakeComp);
        });

        it('supports cls and itemsCls', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, { type: 'Parent' });
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                cls: 'custom-cls',
                itemsCls: 'custom-items-cls',
            });
            
            expect(DerivedClass._nodes).toBeDefined();
            expect(DerivedClass._nodes.root.addCls).toBe('custom-cls');
        });
    });

    describe('lifecycle hooks (default overrides)', () => {
        it('onInitState auto chains (parent->child merge state)', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Parent',
                onInitState() { return { parentState: true }; },
            });
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                body: {
                    onInitState() { return { childState: true }; },
                },
            });
            
            const queues = DerivedClass._overrideQueues;
            expect(queues.onInitState.length).toBe(2);
        });

        it('onAfterInit auto chains (parent->child sequential execution)', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Parent',
                onAfterInit() {},
            });
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                body: {
                    onAfterInit() {},
                },
            });
            
            const queues = DerivedClass._overrideQueues;
            expect(queues.onAfterInit.length).toBe(2);
        });

        it('multi-level lifecycle hooks auto chain', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const BaseClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Base',
                onAfterInit() {},
            });
            
            const MidClass = createDerivedInnerClass(BaseClass, {
                body: { onAfterInit() {} },
            });
            
            const TopClass = createDerivedInnerClass(MidClass, {
                body: { onAfterInit() {} },
            });
            
            const queues = TopClass._overrideQueues;
            expect(queues.onAfterInit.length).toBe(3);
        });

        it('custom overrides list overrides default', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Parent',
                overrides: ['onInitState'],
                onInitState() { return { parent: true }; },
                onAfterInit() {},
            });
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                body: {
                    onInitState() { return { child: true }; },
                    onAfterInit() {},
                },
            });
            
            const queues = DerivedClass._overrideQueues;
            expect(queues.onInitState.length).toBe(2);
            expect(queues.onAfterInit).toBeUndefined();
        });
    });

    describe('engine pure function verification', () => {
        it('TemplateCompiler.compile returns new object', () => {
            const { TemplateCompiler } = require('@/component-core/engine/TemplateCompiler');
            const result1 = TemplateCompiler.compile({ tag: 'div' });
            const result2 = TemplateCompiler.compile({ tag: 'div' });
            expect(result1).not.toBe(result2);
        });

        it('TemplateDeriver.derive returns new nodeMetas', () => {
            const { TemplateDeriver } = require('@/component-core/engine/TemplateDeriver');
            const parentCache = { html: '<div></div>', indexPath: {}, exposeNames: [], i18nNodes: [], templateCache: document.createElement('template') };
            const parentNodeMetas = { root: { name: 'root', tag: 'div' } };
            const result = TemplateDeriver.derive(parentCache, parentNodeMetas);
            expect(result.nodeMetas).not.toBe(parentNodeMetas);
        });

        it('BodyMerger.merge returns new object', () => {
            const { BodyMerger } = require('@/component-core/engine/BodyMerger');
            const parentBody = { type: 'Parent', greet() { return 'parent'; } };
            const childBody = { greet() { return 'child'; } };
            const result = BodyMerger.merge(parentBody, childBody);
            expect(result).not.toBe(parentBody);
            expect(result).not.toBe(childBody);
        });

        it('multi-level replace chain: BaseInput -> NumberInput -> CurrencyInput', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            
            const BaseInput = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Input',
                onAfterInit() {},
            });
            
            const NumberInput = createDerivedInnerClass(BaseInput, {
                body: { onAfterInit() {} },
            });
            
            const CurrencyInput = createDerivedInnerClass(NumberInput, {
                body: { onAfterInit() {} },
            });
            
            const queues = CurrencyInput._overrideQueues;
            expect(queues.onAfterInit.length).toBe(3);
            expect(CurrencyInput._cache).toBe(BaseInput._cache);
            expect(CurrencyInput._nodeMetas).not.toBe(BaseInput._nodeMetas);
        });
    });

    describe('reference safety tests', () => {
        it('cache safe sharing: derived does not modify parent cache during derivation', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, { type: 'Parent' });
            
            const originalHtml = ParentClass._cache.html;
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                body: { greet() { return 'derived'; } },
            });
            
            expect(ParentClass._cache.html).toBe(originalHtml);
        });

        it('nodeMetas independent: derived modification does not affect parent', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, { type: 'Parent' });
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                body: { greet() { return 'derived'; } },
            });
            
            const originalTag = ParentClass._nodeMetas.root.tag;
            DerivedClass._nodeMetas.root.tag = 'modified';
            expect(ParentClass._nodeMetas.root.tag).toBe(originalTag);
        });

        it('body independent: derived modification does not affect parent', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/engine/TemplateFactory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Parent',
                greet() { return 'parent'; },
            });
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                body: { greet() { return 'derived'; } },
            });
            
            expect(ParentClass._body.greet()).toBeDefined();
            expect(DerivedClass._body).not.toBe(ParentClass._body);
        });
    });
});
