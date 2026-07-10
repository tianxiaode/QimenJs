/**
 * 单元测试：ComponentBase
 */

import { ComponentBase, ComponentManager } from '@qimenjs/component-core';
import { ChildrenAbility } from '@qimenjs/component-abilities';
import { StyleAbility } from '@qimenjs/component-core';
import { VisibleAbility } from '@qimenjs/component-abilities';

class SimpleComponent extends ComponentBase {
    static readonly abilities = [ChildrenAbility, StyleAbility, VisibleAbility];

    constructor(props?: Record<string, any>) {
        super(props);
        this.el = document.createElement('div');
    }
}

describe('ComponentBase', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        const mgr = ComponentManager.getInstance();
        (mgr as any).byId.clear();
        (mgr as any).byCid.clear();
    });

    afterEach(() => {
        container.remove();
    });

    describe('constructor', () => {
        it('should generate unique cid', () => {
            const c1 = new SimpleComponent();
            const c2 = new SimpleComponent();
            expect(c1.cid).toBeTruthy();
            expect(c2.cid).toBeTruthy();
            expect(c1.cid).not.toBe(c2.cid);
        });

        it('should set id from props', () => {
            const comp = new SimpleComponent({ id: 'my-id' });
            expect(comp.id).toBe('my-id');
        });

        it('should set type from props', () => {
            const comp = new SimpleComponent({ type: 'button' });
            expect(comp.type).toBe('button');
        });

        it('should have default state', () => {
            const comp = new SimpleComponent();
            expect(comp.mounted).toBe(false);
            expect(comp.destroyed).toBe(false);
            expect(comp.parent).toBeNull();
        });
    });

    describe('mount', () => {
        it('should append el to container', () => {
            const comp = new SimpleComponent();
            comp.mount(container);
            expect(container.contains(comp.el)).toBe(true);
            expect(comp.mounted).toBe(true);
        });

        it('should set data-q-id attribute', () => {
            const comp = new SimpleComponent({ id: 'test-id' });
            comp.mount(container);
            expect(comp.el.getAttribute('data-q-id')).toBe('test-id');
        });

        it('should set __qComponent on el', () => {
            const comp = new SimpleComponent();
            comp.mount(container);
            expect((comp.el as any).__qComponent).toBe(comp);
        });

        it('should register to ComponentManager', () => {
            const comp = new SimpleComponent({ id: 'reg-test' });
            comp.mount(container);
            const mgr = ComponentManager.getInstance();
            expect(mgr.get('reg-test')).toBe(comp);
        });

        it('should mount using CSS selector', () => {
            container.id = 'mount-target';
            const comp = new SimpleComponent();
            comp.mount('#mount-target');
            expect(container.contains(comp.el)).toBe(true);
        });
    });

    describe('unmount', () => {
        it('should remove el from DOM', () => {
            const comp = new SimpleComponent();
            comp.mount(container);
            comp.unmount();
            expect(container.contains(comp.el)).toBe(false);
            expect(comp.mounted).toBe(false);
        });
    });

    describe('dispose', () => {
        it('should mark as destroyed', () => {
            const comp = new SimpleComponent();
            comp.mount(container);
            comp.dispose();
            expect(comp.destroyed).toBe(true);
        });

        it('should unregister from ComponentManager', () => {
            const comp = new SimpleComponent({ id: 'dispose-test' });
            comp.mount(container);
            comp.dispose();
            const mgr = ComponentManager.getInstance();
            expect(mgr.get('dispose-test')).toBeUndefined();
        });

        it('should clear parent reference', () => {
            const parent = new SimpleComponent();
            const child = new SimpleComponent();
            parent.addChild(child);
            child.dispose();
            expect(child.parent).toBeNull();
        });

        it('should not double-dispose', () => {
            const comp = new SimpleComponent();
            comp.mount(container);
            comp.dispose();
            comp.dispose(); // should not throw
            expect(comp.destroyed).toBe(true);
        });
    });

    describe('up', () => {
        it('should find ancestor by type', () => {
            const grandparent = new SimpleComponent();
            grandparent.type = 'form';
            const parent = new SimpleComponent();
            parent.type = 'vbox';
            const child = new SimpleComponent();

            grandparent.addChild(parent);
            parent.addChild(child);

            expect(child.up('form')).toBe(grandparent);
        });

        it('should return null when no ancestor matches', () => {
            const parent = new SimpleComponent();
            parent.type = 'vbox';
            const child = new SimpleComponent();
            parent.addChild(child);

            expect(child.up('form')).toBeNull();
        });
    });

    describe('markDirty', () => {
        it('should batch updates in microtask', async () => {
            const comp = new SimpleComponent();
            const updateSpy = jest.spyOn(comp, 'update');

            comp.markDirty('test');
            comp.markDirty('test'); // second call should be ignored

            expect(updateSpy).not.toHaveBeenCalled();

            await new Promise(resolve => setTimeout(resolve, 0));
            expect(updateSpy).toHaveBeenCalledTimes(1);
        });
    });
});
