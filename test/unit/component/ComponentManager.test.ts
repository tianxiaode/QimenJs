/**
 * 单元测试：ComponentManager
 *
 * 注意：当前 ComponentBase 不再自动生成 cid，
 * 组件需要设置 id 才能通过 id 查找。
 * ComponentManager.register 仍按 cid 注册，但 cid 为 undefined，
 * 因此同一时间只能有一个无 id 的组件在 byCid 中。
 */

import { ComponentBase, ComponentManager, getCmp } from '@qimenjs/component-core';
import { EventSourceRegistrar } from '@qimenjs/events';

class TestComp extends ComponentBase {
    constructor(props?: Record<string, any>) {
        super(props);
        this.initElement();
    }
}

describe('ComponentManager', () => {
    let mgr: ComponentManager;
    let container: HTMLElement;

    beforeEach(() => {
        mgr = ComponentManager.getInstance();
        (mgr as any).byId.clear();
        (mgr as any).byCid.clear();
        // Clean up EventSourceRegistrar to avoid cross-test contamination
        EventSourceRegistrar.getInstance().clear();
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    describe('getInstance', () => {
        it('should return singleton', () => {
            expect(ComponentManager.getInstance()).toBe(mgr);
        });
    });

    describe('register', () => {
        it('should register component by id when id is set', () => {
            const comp = new TestComp();
            comp.id = 'my-comp';
            mgr.register(comp as any);
            expect(mgr.get('my-comp')).toBe(comp);
        });

        it('should throw on duplicate id due to EventSourceRegistrar', () => {
            const c1 = new TestComp();
            c1.id = 'dup';
            const c2 = new TestComp();
            c2.id = 'dup';
            mgr.register(c1 as any);
            // EventSourceRegistrar throws when same eventKey is registered by different component
            expect(() => mgr.register(c2 as any)).toThrow();
        });
    });

    describe('unregister', () => {
        it('should remove component from both indexes', () => {
            const comp = new TestComp();
            comp.id = 'remove-me';
            mgr.register(comp as any);
            mgr.unregister(comp as any);
            expect(mgr.get('remove-me')).toBeUndefined();
        });
    });

    describe('get', () => {
        it('should find by id', () => {
            const comp = new TestComp();
            comp.id = 'find-me';
            mgr.register(comp as any);
            expect(mgr.get('find-me')).toBe(comp);
        });

        it('should return undefined for unknown key', () => {
            expect(mgr.get('unknown')).toBeUndefined();
        });
    });

    describe('getAll', () => {
        it('should return registered component', () => {
            const c1 = new TestComp();
            c1.id = 'comp-1';
            mgr.register(c1 as any);
            expect(mgr.getAll()).toHaveLength(1);
            expect(mgr.getAll()).toContain(c1);
        });
    });

    describe('size', () => {
        it('should return registered count', () => {
            expect(mgr.size).toBe(0);
            const comp = new TestComp();
            comp.id = 'size-test';
            mgr.register(comp as any);
            expect(mgr.size).toBe(1);
        });
    });

    describe('getCmp', () => {
        it('should delegate to ComponentManager.get', () => {
            const comp = new TestComp();
            comp.id = 'global-get';
            mgr.register(comp as any);
            expect(getCmp('global-get')).toBe(comp);
        });
    });
});
