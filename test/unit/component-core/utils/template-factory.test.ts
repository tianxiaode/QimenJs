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

jest.mock('@/component-core/utils/template-compiler', () => ({
    compilePendingTemplate: jest.fn((ctor: any, tpl: any, logger: any, body: any) => {
        ctor._templateCompiled = true;
        const nodeMetas: any = { root: { name: 'root', tag: tpl?.tag || 'div' } };
        if (tpl?.children) {
            for (const child of tpl.children) {
                if (child.name) {
                    nodeMetas[child.name] = { name: child.name, tag: child.tag, componentClass: child.type };
                }
            }
        }
        ctor._nodeMetas = nodeMetas;
        ctor._compiledTemplate = { templateCache: {}, html: '<div></div>', nodeMetas, indexPath: { root: [] } };
        ctor._i18nNodes = [];
        
        if (body) {
            const proto = ctor.prototype;
            const descs = Object.getOwnPropertyDescriptors(body);
            for (const [key, desc] of Object.entries(descs)) {
                if (key === 'type') continue;
                if (typeof desc.value === 'function') {
                    proto[key] = desc.value;
                }
            }
        }
    }),
}));

jest.mock('@/component-core/utils/template-init', () => ({
    initFromTemplate: jest.fn(),
}));

jest.mock('@/component-core/utils/child-node-props', () => ({
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

describe('template-factory', () => {
    describe('createInnerClass', () => {
        it('首次编译调用 compilePendingTemplate', () => {
            const { createInnerClass } = require('@/component-core/utils/template-factory');
            const { compilePendingTemplate } = require('@/component-core/utils/template-compiler');
            
            const Parent = require('@/composable').ComposableBase;
            createInnerClass(Parent, { tag: 'div' });
            expect(compilePendingTemplate).toHaveBeenCalled();
        });

        it('保存 _tpl 和 _body', () => {
            const { createInnerClass } = require('@/component-core/utils/template-factory');
            const Parent = require('@/composable').ComposableBase;
            const body = { type: 'Test', greet() { return 'hello'; } };
            const tpl = { tag: 'div', cls: 'test' };
            const Cls = createInnerClass(Parent, tpl, body);
            expect(Cls._tpl).toBe(tpl);
            expect(Cls._body).toBe(body);
        });

        it('提供 create/with/replace 静态方法', () => {
            const { createInnerClass } = require('@/component-core/utils/template-factory');
            const Parent = require('@/composable').ComposableBase;
            const Cls = createInnerClass(Parent, { tag: 'div' });
            expect(typeof Cls.create).toBe('function');
            expect(typeof Cls.with).toBe('function');
            expect(typeof Cls.replace).toBe('function');
        });
    });

    describe('createDerivedInnerClass (优化)', () => {
        it('复用父类 _tpl 和 _body', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/utils/template-factory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, { type: 'Parent' });
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                body: { greet() { return 'derived'; } },
            });
            
            expect(DerivedClass._tpl).toBe(ParentClass._tpl);
            expect(DerivedClass._body).toBeDefined();
        });

        it('不调用 compilePendingTemplate（复用编译产物）', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/utils/template-factory');
            const { compilePendingTemplate } = require('@/component-core/utils/template-compiler');
            const Parent = require('@/composable').ComposableBase;
            
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, { type: 'Parent' });
            
            compilePendingTemplate.mockClear();
            
            createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                body: { greet() { return 'derived'; } },
            });
            
            expect(compilePendingTemplate).not.toHaveBeenCalled();
        });

        it('复制编译产物', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/utils/template-factory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, { type: 'Parent' });
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                body: { greet() { return 'derived'; } },
            });
            
            expect(DerivedClass._compiledTemplate).toBeDefined();
            expect(DerivedClass._nodeMetas).toBeDefined();
            expect(DerivedClass._i18nNodes).toBeDefined();
            expect(DerivedClass._templateCompiled).toBe(true);
        });

        it('合并 body（子覆盖父）', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/utils/template-factory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Parent',
                method() { return 'parent'; },
                shared() { return 'parent-shared'; },
            });

            const DerivedClass = createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                body: {
                    method() { return 'derived'; },
                },
            });

            const instance = Object.create(DerivedClass.prototype);
            expect(instance.method()).toBe('derived');
            expect(instance.shared()).toBe('parent-shared');
        });

        it('支持两种 body 风格', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/utils/template-factory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Parent',
                getValue() { return 'parent'; },
            });

            const WithExplicitBody = createDerivedInnerClass(ParentClass, {
                type: 'Derived1',
                body: {
                    getValue() { return 'explicit'; },
                },
            });

            const WithTopLevel = createDerivedInnerClass(ParentClass, {
                type: 'Derived2',
                getValue() { return 'top-level'; },
            });

            const explicit = Object.create(WithExplicitBody.prototype);
            expect(explicit.getValue()).toBe('explicit');

            const topLevel = Object.create(WithTopLevel.prototype);
            expect(topLevel.getValue()).toBe('top-level');
        });

        it('overrides 中的方法形成链式队列', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/utils/template-factory');
            const Parent = require('@/composable').ComposableBase;
            const callOrder: string[] = [];

            const ParentClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Parent',
                overrides: ['greet'],
                greet() { callOrder.push('parent'); return 'parent'; },
            });

            const DerivedClass = createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                body: {
                    overrides: ['greet'],
                    greet() { callOrder.push('child'); return 'derived'; },
                },
            });

            const instance = Object.create(DerivedClass.prototype);
            const result = instance.greet();
            expect(callOrder).toEqual(['parent', 'child']);
            expect(result).toBe('derived');
        });

        it('非 overrides 中的方法直接覆盖', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/utils/template-factory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Parent',
                greet() { return 'parent'; },
            });

            const DerivedClass = createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                body: {
                    greet() { return 'derived'; },
                },
            });

            const instance = Object.create(DerivedClass.prototype);
            expect(instance.greet()).toBe('derived');
        });

        it('支持 nodeOverrides 更新组件类型', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/utils/template-factory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, {
                tag: 'div',
                children: [
                    { tag: 'span', name: 'label' },
                    { tag: 'div', name: 'content' },
                ],
            }, { type: 'Test' });

            class CustomComponent {}
            
            const DerivedClass = createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                nodeOverrides: {
                    content: {
                        type: CustomComponent,
                    },
                },
            });

            expect(DerivedClass._nodeMetas.content.componentClass).toBe(CustomComponent);
        });

        it('支持 cls 和 itemsCls', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/utils/template-factory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, { type: 'Test' });

            const DerivedClass = createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                cls: 'custom-class',
                itemsCls: 'items-class',
            });

            expect(DerivedClass.prototype.constructor).toBeDefined();
        });
    });

    describe('生命周期钩子（默认 overrides）', () => {
        it('onInitState 自动串联（父→子合并状态）', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/utils/template-factory');
            const Parent = require('@/composable').ComposableBase;
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Parent',
                onInitState() {
                    return { value: 'parent', extra: '' };
                },
            });

            const DerivedClass = createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                body: {
                    onInitState() {
                        return { extra: 'derived' };
                    },
                },
            });

            const instance = Object.create(DerivedClass.prototype);
            const state = instance.onInitState();
            expect(state.value).toBe('parent');
            expect(state.extra).toBe('derived');
        });

        it('onAfterInit 自动串联（父→子顺序执行）', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/utils/template-factory');
            const Parent = require('@/composable').ComposableBase;
            
            const callOrder: string[] = [];
            
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Parent',
                onAfterInit() {
                    callOrder.push('parent');
                },
            });

            const DerivedClass = createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                body: {
                    onAfterInit() {
                        callOrder.push('child');
                    },
                },
            });

            const instance = Object.create(DerivedClass.prototype);
            instance.onAfterInit();
            expect(callOrder).toEqual(['parent', 'child']);
        });

        it('多级生命周期钩子自动串联', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/utils/template-factory');
            const Parent = require('@/composable').ComposableBase;
            
            const callOrder: string[] = [];
            
            const L1 = createInnerClass(Parent, { tag: 'div' }, {
                type: 'L1',
                onAfterInit() {
                    callOrder.push('L1');
                },
            });

            const L2 = createDerivedInnerClass(L1, {
                type: 'L2',
                body: {
                    onAfterInit() {
                        callOrder.push('L2');
                    },
                },
            });

            const L3 = createDerivedInnerClass(L2, {
                type: 'L3',
                body: {
                    onAfterInit() {
                        callOrder.push('L3');
                    },
                },
            });

            const instance = Object.create(L3.prototype);
            instance.onAfterInit();
            expect(callOrder).toEqual(['L1', 'L2', 'L3']);
        });

        it('自定义 overrides 列表覆盖默认值', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/utils/template-factory');
            const Parent = require('@/composable').ComposableBase;
            const callOrder: string[] = [];

            const ParentClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Parent',
                overrides: ['customHook'],
                customHook() { callOrder.push('parent-custom'); },
                onAfterInit() { callOrder.push('parent-after'); },
            });

            const DerivedClass = createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                body: {
                    overrides: ['customHook'],
                    customHook() { callOrder.push('child-custom'); },
                    onAfterInit() { callOrder.push('child-after'); },
                },
            });

            const instance = Object.create(DerivedClass.prototype);
            instance.customHook();
            instance.onAfterInit();
            
            expect(callOrder).toEqual(['parent-custom', 'child-custom', 'child-after']);
        });
    });

    describe('applyChildNodeProps 优化', () => {
        it('replace 不调用 applyChildNodeProps', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/utils/template-factory');
            const { applyChildNodeProps } = require('@/component-core/utils/child-node-props');
            const Parent = require('@/composable').ComposableBase;
            
            applyChildNodeProps.mockClear();

            const ParentClass = createInnerClass(Parent, {
                tag: 'div',
                children: [{ tag: 'span', name: 'label' }],
            }, { type: 'Test' });

            createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                body: { greet() {} },
            });

            expect(applyChildNodeProps).not.toHaveBeenCalled();
        });

        it('replace 后原型通过原型链继承父类方法', () => {
            const { createInnerClass, createDerivedInnerClass } = require('@/component-core/utils/template-factory');
            const Parent = require('@/composable').ComposableBase;
            
            const ParentClass = createInnerClass(Parent, { tag: 'div' }, {
                type: 'Parent',
                sharedMethod() { return 'parent-shared'; },
            });

            const DerivedClass = createDerivedInnerClass(ParentClass, {
                type: 'Derived',
                body: { derivedMethod() { return 'derived'; } },
            });

            const instance = Object.create(DerivedClass.prototype);
            expect(instance.sharedMethod()).toBe('parent-shared');
            expect(instance.derivedMethod()).toBe('derived');
        });
    });
});
