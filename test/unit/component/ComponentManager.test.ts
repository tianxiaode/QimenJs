/**
 * 单元测试：ComponentManager
 */

import { ComponentBase, ComponentManager, getCmp } from '@qimenjs/component-core';

class TestComp extends ComponentBase {
    constructor(props?: Record<string, any>) {
        super(props);
        this.el = document.createElement('div');
    }
}

describe('ComponentManager', () => {
    let mgr: ComponentManager;
    let container: HTMLElement;

    beforeEach(() => {
        mgr = ComponentManager.getInstance();
        (mgr as any).byId.clear();
        (mgr as any).byCid.clear();
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
        it('should register component by cid', () => {
            const comp = new TestComp();
            mgr.register(comp);
            expect(mgr.get(comp.cid)).toBe(comp);
        });

        it('should register component by id', () => {
            const comp = new TestComp({ id: 'my-comp' });
            mgr.register(comp);
            expect(mgr.get('my-comp')).toBe(comp);
        });

        it('should warn on duplicate id', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const c1 = new TestComp({ id: 'dup' });
            const c2 = new TestComp({ id: 'dup' });
            mgr.register(c1);
            mgr.register(c2);
            expect(warnSpy).toHaveBeenCalled();
            warnSpy.mockRestore();
        });
    });

    describe('unregister', () => {
        it('should remove component from both indexes', () => {
            const comp = new TestComp({ id: 'remove-me' });
            mgr.register(comp);
            mgr.unregister(comp);
            expect(mgr.get('remove-me')).toBeUndefined();
            expect(mgr.get(comp.cid)).toBeUndefined();
        });
    });

    describe('get', () => {
        it('should find by id first', () => {
            const comp = new TestComp({ id: 'find-me' });
            mgr.register(comp);
            expect(mgr.get('find-me')).toBe(comp);
        });

        it('should find by cid if id not found', () => {
            const comp = new TestComp();
            mgr.register(comp);
            expect(mgr.get(comp.cid)).toBe(comp);
        });

        it('should return undefined for unknown key', () => {
            expect(mgr.get('unknown')).toBeUndefined();
        });
    });

    describe('getAll', () => {
        it('should return all registered components', () => {
            const c1 = new TestComp();
            const c2 = new TestComp();
            mgr.register(c1);
            mgr.register(c2);
            expect(mgr.getAll()).toHaveLength(2);
        });
    });

    describe('size', () => {
        it('should return registered count', () => {
            expect(mgr.size).toBe(0);
            mgr.register(new TestComp());
            expect(mgr.size).toBe(1);
        });
    });

    describe('getCmp', () => {
        it('should delegate to ComponentManager.get', () => {
            const comp = new TestComp({ id: 'global-get' });
            mgr.register(comp);
            expect(getCmp('global-get')).toBe(comp);
        });
    });
});
