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

import type { NodeMetadata } from './types/compiled-types';
import type { INodeMapManager } from './types/node-map-manager-types';
import type { ComponentProps, BadgeQuickConfig, TooltipQuickConfig } from './types/init-context';
import type { DomEventsMap } from './types/tpl-events';
import type { FloatDecl } from './types/tpl-body';
import { createInitContext } from './types/init-context';

import {
    MOUNT_PHASE,
    FILL_PHASE,
    INSTANTIATE_PHASE,
    FINALIZE_PHASE,
    runPhase,
} from './engine/pipeline';
import { getId } from '@/utils/string/id';
import { ComponentRegistrar, TplInspector } from './engine';
import { TplNode } from './types';

export class Component extends ComposableBase {
    static get type(): string {
        return (this as any).name.replace(/Component$/, '');
    }

    type: string;

    /** 实例唯一 ID */
    id!: string;

    /**
     * 语义动作名 — 组件实例级属性
     *
     * 构造时可从 props 传入，运行时可通过 setter 更改。
     * DomEventsEngine 第三层 key 匹配此值。
     *
     * @example
     * new ButtonComponent({ action: 'save' });
     * btn.action = 'create';  // 运行时更改
     */
    action: string;

    domEvents?: DomEventsMap;
    bridgeKey?: string | { key: string; fixed?: boolean };
    entityKey?: string | { key: string; fixed?: boolean };

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
     * 浮动层声明 — 子类可覆盖合并
     *
     * 基类从 props.badge / props.tooltip 自动生成 Badge/Tooltip 浮层。
     * 子类覆盖时通过 super.floats 合并基类浮层。
     *
     * @example
     * class DropdownComponent extends ButtonComponent {
     *     get floats() {
     *         const parent = super.floats ?? {};
     *         return { ...parent, dropIcon: { type: 'Menu', ... } };
     *     }
     * }
     */
    get floats(): Record<string, FloatDecl> | undefined {
        const props = this.props as ComponentProps;
        const result: Record<string, FloatDecl> = {};

        if (props.badge !== null && props.badge !== undefined) {
            const badgeConfig: BadgeQuickConfig =
                typeof props.badge === 'string' || typeof props.badge === 'number'
                    ? { text: String(props.badge) }
                    : props.badge;
            result.badge = {
                type: 'Badge',
                trigger: 'always',
                anchor: badgeConfig.anchor ?? 'self',
                data: { text: badgeConfig.text, visible: badgeConfig.visible },
            } as FloatDecl;
        }

        if (props.tooltip !== null && props.tooltip !== undefined) {
            const tooltipConfig: TooltipQuickConfig =
                typeof props.tooltip === 'string' ? { tooltip: props.tooltip } : props.tooltip;
            result.tooltip = {
                type: 'Tooltip',
                trigger: 'hover',
                anchor: tooltipConfig.anchor ?? 'self',
                placement: tooltipConfig.placement ?? 'top',
                showDelay: tooltipConfig.showDelay,
                hideDelay: tooltipConfig.hideDelay,
                data: { tooltip: tooltipConfig.tooltip },
            } as FloatDecl;
        }

        return Object.keys(result).length > 0 ? result : undefined;
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

    el!: HTMLElement;
    meta: Record<string, any>;
    props: ComponentProps;
    nodeMapMgr!: INodeMapManager;

    get isItemContainer(): boolean {
        return false;
    }

    parent?: any;
    slotName?: string;

    _initializing: boolean;
    _templateInitialized: boolean = false;
    _dirtyNodes: Record<string, Record<string, any>>;
    _disposing: boolean;
    dirtySet!: Set<string>;

    private _ready: Promise<void> = Promise.resolve();

    constructor(props?: ComponentProps) {
        super();
        this.type = (this.constructor as any).name.replace(/Component$/, '');
        this.props = props ?? {};
        this.action = this.props.action ?? '';
        this.bridgeKey = this.props.bridgeKey;
        this.entityKey = this.props.entityKey;
        this.parent = this.props.parent;
        this.slotName = this.props.slotName;
        this.meta = {};
        this._dirtyNodes = {};
        this.dirtySet = new Set();
        this._initializing = true;
        this._disposing = false;
        this._ready = this.init();
    }

    get nodeMap(): Record<string, NodeMetadata> {
        return this.nodeMapMgr?.getAll() ?? {};
    }

    /**
     * 获取指定节点的子组件实例
     *
     * @param name - 节点名称
     * @returns 子组件实例，不存在或无组件则返回 undefined
     *
     * @example
     * ```ts
     * // 获取 header 节点的子组件
     * const headerComp = this.getComponent('header');
     * if (headerComp) {
     *   headerComp.title = 'New Title';
     * }
     * ```
     */
    getComponent(name: string): any | undefined {
        return this.nodeMapMgr?.getComponent(name);
    }

    get ready(): Promise<void> {
        return this._ready;
    }

    get readyAll(): Promise<void> {
        return this._readyAll();
    }

    private async _readyAll(): Promise<void> {
        await this._ready;
        const mgr = this.nodeMapMgr;
        if (!mgr) return;
        for (const node of Object.values(mgr.getAll())) {
            if (node.component && typeof (node.component as any).readyAll === 'function') {
                await (node.component as any).readyAll;
            } else if (node.component && (node.component as any).ready) {
                await (node.component as any).ready;
            }
        }
    }

    /**
     * 异步初始化管线
     *
     * Phase 1: MOUNT — 同步（首个 await 前，el 立即可用）
     * Phase 2: FILL — 同步
     * Phase 3: INSTANTIATE — 异步（TaskQueue 队列化子组件渲染）
     * Phase 4: FINALIZE — 同步
     */
    async init(): Promise<void> {
        const ctx = createInitContext(this, this.props);

        try {
            await runPhase(MOUNT_PHASE, ctx);
            if (!ctx.nodeMapMgr) return;

            if (FILL_PHASE.steps.length > 0) {
                await runPhase(FILL_PHASE, ctx);
            }

            await runPhase(INSTANTIATE_PHASE, ctx);

            await runPhase(FINALIZE_PHASE, ctx);

            this.id = this.props.id || getId('cmp');
        } finally {
            this._initializing = false;
            this._flushNodeProps?.();
        }
    }

    containsElement(nodeName: string, target: Element): boolean {
        const node = this.nodeMap[nodeName];
        if (!node) return false;
        const el = node.component ? node.component.el : node.el;
        return el ? el.contains(target) : false;
    }

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

        this._disposeChildComponents();

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

    static register(tpl?: TplNode): void {
        if (tpl) {
            Object.defineProperty(this, '_tpl', {
                value: tpl,
                writable: true,
                configurable: true,
            });
        }
        ComponentRegistrar.getInstance().register(this, tpl);
    }

    static inspectTpl(): void {
        const cls = this as any;
        const tpl: TplNode | undefined = cls._tpl;
        if (!tpl) {
            console.log(`  ⚠ ${cls.name} 未注册模板（先调用 ${cls.name}.register(tpl)）`);
            return;
        }
        TplInspector.inspect(tpl, cls.name);
    }

    private _disposeChildComponents(): void {
        this.nodeMapMgr.disposeAll();
    }
}

Component.use(COMPONENT_ABILITIES);

export interface Component extends IComponent {}
