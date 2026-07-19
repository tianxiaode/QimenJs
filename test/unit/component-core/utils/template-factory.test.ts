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

import { createTemplateClass, createReplaceClass } from '@/component-core/utils/template-factory';

jest.mock('@/component-core/utils/template-compiler', () => ({
    compilePendingTemplate: jest.fn((ctor: any) => {
        ctor._templateCompiled = true;
    }),
}));

jest.mock('@/component-core/utils/template-init', () => ({
    initFromTemplate: jest.fn(),
}));

jest.mock('@/logger', () => ({
    Logger: {
        for: jest.fn(() => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() })),
    },
}));

describe('template-factory', () => {
    describe('createTemplateClass', () => {
        it('返回一个构造函数', () => {
            class Parent {}
            const Cls = createTemplateClass(Parent, { template: '<div/>' });
            expect(typeof Cls).toBe('function');
        });

        it('复制父类原型方法', () => {
            class Parent {
                greet() {
                    return 'hi';
                }
            }
            const Cls = createTemplateClass(Parent, { template: '<div/>' });
            const instance = Object.create(Cls.prototype);
            expect(typeof instance.greet).toBe('function');
        });

        it('设置 _pendingTemplate 和 _templateCompiled', () => {
            class Parent {}
            const template = { template: '<div/>' };
            const Cls = createTemplateClass(Parent, template);
            expect(Cls._pendingTemplate).toBe(template);
            expect(Cls._templateCompiled).toBe(false);
        });

        it('提供 create 静态方法', () => {
            class Parent {}
            const Cls = createTemplateClass(Parent, { template: '<div/>' });
            expect(typeof Cls.create).toBe('function');
        });

        it('初始化完成后发送 init 事件', () => {
            class Parent {}
            const emitSpy = jest.fn();
            const Cls = createTemplateClass(Parent, { template: '<div/>' });
            const instance = Object.create(Cls.prototype);
            instance.emit = emitSpy;
            Cls.call(instance, {});
            expect(emitSpy).toHaveBeenCalledWith('init', { props: {} });
        });

        it('有 eventKey 时发送桥接事件', () => {
            class Parent {}
            const emitSpy = jest.fn();
            const bridgeEmitSpy = jest.fn();
            const Cls = createTemplateClass(Parent, { template: '<div/>' });
            const instance = Object.create(Cls.prototype);
            instance.emit = emitSpy;
            instance.bridgeEmit = bridgeEmitSpy;
            instance.eventKey = 'myKey';
            Cls.call(instance, {});
            expect(bridgeEmitSpy).toHaveBeenCalledWith('myKey', 'init', { props: {} });
        });
    });

    describe('createReplaceClass', () => {
        it('返回一个构造函数', () => {
            class Parent {}
            const Cls = createReplaceClass(Parent, {});
            expect(typeof Cls).toBe('function');
        });

        it('复制父类原型方法', () => {
            class Parent {
                greet() {
                    return 'hi';
                }
            }
            const Cls = createReplaceClass(Parent, {});
            const instance = Object.create(Cls.prototype);
            expect(typeof instance.greet).toBe('function');
        });

        it('body 中的方法挂到原型', () => {
            class Parent {}
            const body = {
                customMethod() {
                    return 42;
                },
            };
            const Cls = createReplaceClass(Parent, { body });
            const instance = Object.create(Cls.prototype);
            expect((instance as any).customMethod()).toBe(42);
        });

        it('body 中的 type 不挂到原型', () => {
            class Parent {}
            const body = {
                type: 'MyType',
                customMethod() {
                    return 42;
                },
            };
            const Cls = createReplaceClass(Parent, { body });
            const instance = Object.create(Cls.prototype);
            expect((instance as any).type).toBeUndefined();
        });
    });
});
