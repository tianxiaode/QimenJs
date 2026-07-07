/**
 * 集成测试：ComponentBase + Abilities + ComponentManager
 */

import { ComponentBase } from '@qimenjs/component';
import { ComponentManager } from '@qimenjs/component';
import { ChildrenAbility } from '@qimenjs/component';
import { StyleAbility } from '@qimenjs/component';
import { VisibleAbility } from '@qimenjs/component';
import { DisableAbility } from '@qimenjs/component';
import { ValueAbility } from '@qimenjs/component';
import { EventBindingAbility } from '@qimenjs/component';
import { LoadingAbility } from '@qimenjs/component';
import { SizeAbility } from '@qimenjs/component';
import { ComposableBase } from '@qimenjs/composable';

/**
 * 创建测试用组件类
 */
class TestComponent extends ComponentBase {
    static override readonly abilities = [
        ChildrenAbility,
        StyleAbility,
        VisibleAbility,
        DisableAbility,
        ValueAbility,
        EventBindingAbility,
        LoadingAbility,
        SizeAbility,
    ];

    constructor(props?: Record<string, any>) {
        super(props);
        this.el = document.createElement('div');
        this.el.className = 'test-component';
    }
}

describe('ComponentBase Integration', () => {
    let container: HTMLElement;

    beforeEach(() => {
        // 清理 ComponentManager
        const mgr = ComponentManager.getInstance();
        (mgr as any).byId.clear();
        (mgr as any).byCid.clear();

        // 创建挂载容器
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    describe('ComponentBase lifecycle', () => {
        it('should create component with el and cid', () => {
            const comp = new TestComponent();
            expect(comp.el).toBeInstanceOf(HTMLElement);
            expect(comp.cid).toBeTruthy();
            expect(comp.mounted).toBe(false);
            expect(comp.destroyed).toBe(false);
        });

        it('should mount and set data-q-id', () => {
            const comp = new TestComponent();
            comp.id = 'test-1';
            comp.mount(container);

            expect(comp.mounted).toBe(true);
            expect(comp.el.getAttribute('data-q-id')).toBe('test-1');
            expect((comp.el as any).__qComponent).toBe(comp);
        });

        it('should unmount and remove from DOM', () => {
            const comp = new TestComponent();
            document.body.appendChild(comp.el);
            comp.mount(container);
            comp.unmount();

            expect(comp.el.parentNode).toBeNull();
        });

        it('should dispose and clean up', () => {
            const comp = new TestComponent();
            comp.id = 'dispose-test';
            comp.mount(container);

            const mgr = ComponentManager.getInstance();
            expect(mgr.get('dispose-test')).toBe(comp);

            comp.dispose();
            expect(comp.destroyed).toBe(true);
            expect(mgr.get('dispose-test')).toBeUndefined();
        });
    });

    describe('ComponentManager', () => {
        it('should register and retrieve by id', () => {
            const comp = new TestComponent();
            comp.id = 'mgr-test';
            comp.mount(container);

            const mgr = ComponentManager.getInstance();
            expect(mgr.get('mgr-test')).toBe(comp);
        });

        it('should register and retrieve by cid', () => {
            const comp = new TestComponent();
            comp.mount(container);

            const mgr = ComponentManager.getInstance();
            expect(mgr.get(comp.cid)).toBe(comp);
        });

        it('should return undefined for non-existent id', () => {
            const mgr = ComponentManager.getInstance();
            expect(mgr.get('non-existent')).toBeUndefined();
        });
    });

    describe('ChildrenAbility', () => {
        it('should add and retrieve children', () => {
            const parent = new TestComponent();
            const child = new TestComponent();
            child.id = 'child-1';

            parent.addChild(child);

            expect(parent.children).toContain(child);
            expect(parent.childCount).toBe(1);
            expect(parent.getChild('child-1')).toBe(child);
            expect(child.parent).toBe(parent);
        });

        it('should add child at specific index', () => {
            const parent = new TestComponent();
            const child1 = new TestComponent();
            const child2 = new TestComponent();
            const child3 = new TestComponent();

            parent.addChild(child1);
            parent.addChild(child2);
            parent.addChild(child3, 1);

            expect(parent.children[1]).toBe(child3);
            expect(parent.indexOf(child3)).toBe(1);
        });

        it('should remove child', () => {
            const parent = new TestComponent();
            const child = new TestComponent();

            parent.addChild(child);
            parent.removeChild(child);

            expect(parent.children).not.toContain(child);
            expect(child.parent).toBeNull();
        });

        it('should query children by type', () => {
            const parent = new TestComponent();
            const child1 = new TestComponent();
            child1.type = 'button';
            const child2 = new TestComponent();
            child2.type = 'input';
            const child3 = new TestComponent();
            child3.type = 'button';

            parent.addChild(child1);
            parent.addChild(child2);
            parent.addChild(child3);

            expect(parent.queryChild('button')).toBe(child1);
            expect(parent.queryChildren('button')).toEqual([child1, child3]);
        });

        it('should remove all children', () => {
            const parent = new TestComponent();
            parent.addChild(new TestComponent());
            parent.addChild(new TestComponent());

            parent.removeAll();
            expect(parent.childCount).toBe(0);
        });

        it('should iterate children with eachChild', () => {
            const parent = new TestComponent();
            parent.addChild(new TestComponent());
            parent.addChild(new TestComponent());

            const indices: number[] = [];
            parent.eachChild((child: any, index: number) => {
                indices.push(index);
            });
            expect(indices).toEqual([0, 1]);
        });
    });

    describe('StyleAbility', () => {
        it('should set and get className', () => {
            const comp = new TestComponent();
            comp.className = 'foo bar';
            expect(comp.className).toBe('foo bar');
        });

        it('should add and remove class', () => {
            const comp = new TestComponent();
            comp.addClass('active');
            expect(comp.className).toContain('active');

            comp.removeClass('active');
            expect(comp.className).not.toContain('active');
        });

        it('should toggle class', () => {
            const comp = new TestComponent();
            comp.toggleClass('highlight');
            expect(comp.className).toContain('highlight');

            comp.toggleClass('highlight');
            expect(comp.className).not.toContain('highlight');
        });

        it('should set and get style', () => {
            const comp = new TestComponent();
            comp.style = 'color: red;';
            expect(comp.style).toBe('color: red;');
        });
    });

    describe('VisibleAbility', () => {
        it('should show and hide component', () => {
            const comp = new TestComponent();
            comp.mount(container);

            comp.hide();
            expect(comp.visible).toBe(false);
            expect(comp.el.style.display).toBe('none');

            comp.show();
            expect(comp.visible).toBe(true);
            expect(comp.el.style.display).not.toBe('none');
        });

        it('should toggle visibility', () => {
            const comp = new TestComponent();
            comp.mount(container);

            expect(comp.visible).toBe(true);
            comp.toggle();
            expect(comp.visible).toBe(false);
        });
    });

    describe('DisableAbility', () => {
        it('should set disabled state', () => {
            const comp = new TestComponent();
            comp.mount(container);

            comp.disabled = true;
            expect(comp.disabled).toBe(true);
            expect(comp.el.getAttribute('aria-disabled')).toBe('true');

            comp.disabled = false;
            expect(comp.disabled).toBe(false);
        });
    });

    describe('ValueAbility', () => {
        it('should set and get value', () => {
            const comp = new TestComponent();
            comp.value = 'hello';
            expect(comp.value).toBe('hello');
        });

        it('should call onChange callback', () => {
            const comp = new TestComponent();
            const onChange = jest.fn();
            comp.onChange = onChange;

            comp.value = 'new value';
            expect(onChange).toHaveBeenCalledWith('new value');
        });
    });

    describe('LoadingAbility', () => {
        it('should set loading state', () => {
            const comp = new TestComponent();
            comp.mount(container);

            comp.loading = true;
            expect(comp.loading).toBe(true);
            expect(comp.el.getAttribute('aria-busy')).toBe('true');

            comp.loading = false;
            expect(comp.loading).toBe(false);
        });
    });

    describe('SizeAbility', () => {
        it('should set size', () => {
            const comp = new TestComponent();
            comp.mount(container);

            comp.size = 'large';
            expect(comp.size).toBe('large');
        });
    });

    describe('EventBindingAbility', () => {
        it('should bind DOM event and clean up on dispose', () => {
            const comp = new TestComponent();
            comp.mount(container);
            document.body.appendChild(comp.el);

            const handler = jest.fn();
            comp.onDom('click', handler);

            // 触发点击
            comp.el.click();
            expect(handler).toHaveBeenCalledTimes(1);

            // dispose 后应自动清理
            comp.dispose();
            comp.el.click();
            expect(handler).toHaveBeenCalledTimes(1); // 不再增加
        });
    });
});
