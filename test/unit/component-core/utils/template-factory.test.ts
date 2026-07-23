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

import { createInnerClass, createReplaceFactory } from '@/component-core/utils/template-factory';

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
    describe('createInnerClass', () => {
        it('返回一个 class extends ParentClass', () => {
            class Parent {}
            const Cls = createInnerClass(Parent, { tag: 'div' });
            expect(typeof Cls).toBe('function');
            expect(Object.getPrototypeOf(Cls.prototype)).toBe(Parent.prototype);
        });

        it('继承父类原型方法', () => {
            class Parent {
                greet() {
                    return 'hi';
                }
            }
            const Cls = createInnerClass(Parent, { tag: 'div' });
            const instance = Object.create(Cls.prototype);
            expect(typeof instance.greet).toBe('function');
        });

        it('编译模板后设置 _templateCompiled', () => {
            class Parent {}
            const Cls = createInnerClass(Parent, { tag: 'div' });
            expect(Cls._templateCompiled).toBe(true);
        });

        it('提供 create/with/replace 静态方法', () => {
            class Parent {}
            const Cls = createInnerClass(Parent, { tag: 'div' });
            expect(typeof Cls.create).toBe('function');
            expect(typeof Cls.with).toBe('function');
            expect(typeof Cls.replace).toBe('function');
        });
    });

    describe('createReplaceFactory', () => {
        it('返回工厂函数', () => {
            class Parent {}
            const InnerClass = createInnerClass(Parent, { tag: 'div' });
            const variants = [{ innerClass: InnerClass }];
            const factory = createReplaceFactory(variants, {});
            expect(typeof factory).toBe('function');
            expect(typeof factory.create).toBe('function');
            expect(typeof factory.with).toBe('function');
            expect(typeof factory.replace).toBe('function');
        });
    });
});
