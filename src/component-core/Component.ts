/**
 * Component — 组件基类
 *
 * 所有组件直接 extends Component，通过实例字段声明 tpl/events/type 等。
 * 构造函数启动异步初始化管线，el 立即可用。
 *
 * 生命周期：
 *   new Component(props)  →  Phase 1+2 同步（el 就绪）  →  Phase 3 异步（子组件实例化）  →  Phase 4 收尾
 *   component.ready       →  Promise<void>，等全部阶段完成
 *
 * @example
 * ```ts
 * class ButtonComponent extends Component {
 *     static templateName = 'Button';
 *     type = 'Button';
 * }
 * const btn = new ButtonComponent({ text: 'OK' });
 * container.appendChild(btn.el);   // 骨架立即可见
 * await btn.ready;                 // 等子组件 + 收尾
 * ```
 */

import { ComposableBase } from '@/composable';
import { COMPONENT_ABILITIES, IComponent } from './Component-abilities';

import { COMPONENT_LIFECYCLE_EVENTS } from '@/events';

import { string } from '@/utils';
import { ComponentClass, ComponentCoreOptions, IComponentCore, TemplateDecl } from './types';
import { ComponentDefs } from './ComponentDefs';
import { ComponentRegistrar } from './ComponentRegistrar';
import './badge.css';
import './indicator.css';
/** 组件基类，所有组件通过 extends 继承，提供能力组合、生命周期管线和 DOM 管理 */
export class Component extends ComposableBase implements IComponentCore {
    static type = 'component';
    static register() {
        ComponentRegistrar.getInstance().register(this);
    }
    resolveComponent(type: string): ComponentClass | undefined {
        return ComponentRegistrar.getInstance().get(type);
    }

    get type(): string {
        return (this.constructor as any).type ?? (this.constructor as any).name;
    }

    static setDefaultHandler(
        error?: (ctx: any, domain: string) => void,
        loading?: (entityKey: string, isLoading: boolean) => void
    ): void {
        if (error) Component.prototype.defaultEntityErrorHandler = error;
        if (loading) Component.prototype.defaultEntityLoadingHandler = loading;
    }

    /**
     * 组件模板 — getter 方式
     *
     * 子类通过重写 getter 返回模板定义，CompileEngine 会自动缓存编译产物。
     *
     * @example
     * ```ts
     * class ButtonComponent extends Component {
     *     get tpl() {
     *         return { tag: 'button', name: 'root' };
     *     }
     * }
     * ```
     */
    get tpl(): TemplateDecl {
        return {};
    }

    /**
     * 默认事件数据 — getter，子类 super 合并
     *
     * 基类自动包含：id、type、action。
     * 子类可覆盖添加组件特定数据（如 fieldName、index 等）。
     *
     * @example
     * class FormComponent extends Component {
     *     get defaultEventData() {
     *         return { ...super.defaultEventData, fieldName: this.fieldName };
     *     }
     * }
     */
    get defaultEventData(): Record<string, any> {
        return {
            id: this.id,
            type: this.type,
            action: this.action,
        };
    }

    /**
     * 自定义事件数据 — body 中定义，编译时挂原型
     *
     * 与 defaultEventData 分离：defaultEventData 是类继承链，
     * getCustomEventData 是组件实例级别的动态数据。
     */
    getCustomEventData(): Record<string, any> {
        return {};
    }

    constructor(options?: ComponentCoreOptions) {
        super();
        this.id = this.id ?? options?.id ?? string.getId(`cmp-${this.type}`);
        this.hasParent = options?.hasParent ?? false;
        this.container = options?.container;
        delete options?.id;
        delete options?.hasParent;
        delete options?.container;

        this._initializing = true;
        this.ready = new Promise(resolve => (this._readyResolve = resolve));
        this.onBeforeInit();
        this._buildDOM(options);
    }

    update(options?: ComponentCoreOptions) {
        this._applyOptions(options);
    }

    onBeforeInit(): void {}
    onAfterInit(): void {}

    override onBeforeDispose(): void {
        this._disposing = true;

        if (typeof this.onBeforeUnmount === 'function') {
            this.onBeforeUnmount();
        }

        this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.BEFORE_UNMOUNT);

        if (this.parent && this.slotName && !this.parent._disposing && !this.isItemContainer) {
            const parentNodeMapMgr = this.parent.nodeMapMgr;
            if (parentNodeMapMgr) {
                const node = parentNodeMapMgr.get(this.slotName);
                if (node && node.component === this) {
                    parentNodeMapMgr.restoreSkeleton(this.slotName);
                }
            }
        }

        if (typeof this._disposeChildComponents === 'function') {
            this._disposeChildComponents();
        }

        if (this.el?.parentElement) {
            this.el.remove();
        }

        this.meta = {};
        this.props = {};
        this._dirtyNodes = {};

        this._initializing = false;
    }

    override onDisposed(): void {
        this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.DISPOSE);
    }
}

Component.use(COMPONENT_ABILITIES);
Component.define(ComponentDefs);

/** Component 类的能力方法接口，将 IComponent 的能力方法合并到 Component 类型 */
export interface Component extends IComponent {}
