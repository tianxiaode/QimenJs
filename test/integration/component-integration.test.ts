/**
 * 集成测试：ComponentBase + Abilities + ComponentManager
 */

import { ComponentBase } from '@qimenjs/component-core';
import { ComponentManager } from '@qimenjs/component-core';
import { ChildrenAbility } from '@qimenjs/component-abilities';
import { StyleAbility } from '@qimenjs/component-core';
import { VisibleAbility } from '@qimenjs/component-abilities';
import { DisableAbility } from '@qimenjs/component-abilities';
import { ValueAbility } from '@qimenjs/component-abilities';
import { LoadingAbility } from '@qimenjs/component-abilities';
import { SizeAbility } from '@qimenjs/component-abilities';
import { ComposableBase } from '@qimenjs/composable';
import type { AbilityDefinition } from '@qimenjs/composable';

/**
 * EventBindingAbility - 提供 onDom 方法
 * 
 * 从 src/component-abilities/event/EventBindingAbility.ts 内联，
 * 因为它未从主入口导出。
 */
const EventBindingAbility: AbilityDefinition = {
    onDom(event: string, handler: (e: Event) => void): () => void {
        if (!this.el) return () => {};
        this.el.addEventListener(event, handler);
        const off = () => {
            if (this.el) {
                this.el.removeEventListener(event, handler);
            }
        };
        this.onCleanup(off);
        return off;
    },
};

/**
 * ClassListAbility - 提供 addClass/removeClass/toggleClass/hasClass 方法
 *
 * 这些方法被 DisableAbility/LoadingAbility/SizeAbility 等调用，
 * 但当前未在 ComponentBase 的标准能力中实现。
 * 此处内联提供测试用实现。
 */
const ClassListAbility: AbilityDefinition = {
    addClass(name: string): void {
        if (!this.el || !name) return;
        this.el.classList.add(name);
    },

    removeClass(name: string): void {
        if (!this.el || !name) return;
        this.el.classList.remove(name);
    },

    toggleClass(name: string, force?: boolean): void {
        if (!this.el || !name) return;
        this.el.classList.toggle(name, force);
    },

    hasClass(name: string): boolean {
        if (!this.el || !name) return false;
        return this.el.classList.contains(name);
    },
};

/**
 * LifecycleAbility - 提供 mount/unmount 方法
 *
 * ChildrenAbility.removeChild/removeAll 调用 child.unmount()，
 * 但当前 ComponentBase 不提供 mount/unmount 方法。
 * 此处内联提供测试用实现。
 */
const LifecycleAbility: AbilityDefinition = {
    mounted: {
        get(): boolean {
            return this.abilityState('LifecycleAbility:mounted', () => false);
        },
    },

    destroyed: {
        get(): boolean {
            return this.abilityState('LifecycleAbility:destroyed', () => false);
        },
    },

    mount(container: HTMLElement | string): void {
        const target = typeof container === 'string'
            ? document.querySelector(container)
            : container;
        if (target && this.el) {
            target.appendChild(this.el);
            this.setAbilityState('LifecycleAbility:mounted', true);
            if (this.id) {
                this.el.setAttribute('data-q-id', this.id);
            }
            (this.el as any).__qComponent = this;
            ComponentManager.getInstance().register(this as any);
        }
    },

    unmount(): void {
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
        this.setAbilityState('LifecycleAbility:mounted', false);
    },
};

/**
 * 创建测试用组件类
 */
class TestComponent extends ComponentBase.with([
    ChildrenAbility,
    StyleAbility,
    VisibleAbility,
    DisableAbility,
    ValueAbility,
    LoadingAbility,
    SizeAbility,
    EventBindingAbility,
    ClassListAbility,
    LifecycleAbility,
]) {

    constructor(props?: Record<string, any>) {
        super(props);
        this.initElement();
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
        it('should create component with el', () => {
            const comp = new TestComponent();
            expect(comp.el).toBeInstanceOf(HTMLElement);
            expect(comp.tag).toBe('div');
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

        it('should remove child (which also disposes it)', () => {
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

        it('should remove all children (which also disposes them)', () => {
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
            comp.flush();
            expect(comp.className).toBe('foo bar');
        });

        it('should set and get style', () => {
            const comp = new TestComponent();
            comp.style = 'color: red;';
            comp.flush();
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
            comp.type = 'test';
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
            comp.type = 'test';
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
            comp.type = 'test';
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
