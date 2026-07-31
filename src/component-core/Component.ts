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

import type { INodeMapManager } from './types/node-map-manager-types';
import type { ComponentProps } from './types/init-context';
import type { DomEventsMap } from './types/tpl-events';
import type { DragDecl, DropDecl } from './types/tpl-node-types';
import { createInitContext } from './types/init-context';

import { ComponentError, KernelErrorCode } from '@/error';
import { MOUNT_PHASE, INSTANTIATE_PHASE, FINALIZE_PHASE, runPhase } from './engine/pipeline';
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
     * 拖拽开关 — 控制组件是否可拖拽
     *
     * 两种使用场景：
     * 1. **Self-Drag（自身拖动）**：如 Dialog 窗口拖动
     *    - drag: true → 启用，使用 dragHandle 或模板中的 drag 节点作为手柄
     *    - drag: false → 禁用
     *
     * 2. **Drag & Drop（拖放交互）**：如卡片拖入容器
     *    - drag: true → 启用，dragType 自动使用 component.type
     *    - drag: { type: 'item' } → 启用，伪装为 'item' 类型
     *
     * @example
     * class DialogComponent extends Component {
     *   drag = true;                    // 启用拖拽
     *   dragHandle = 'header';           // 手柄为 header 节点
     *   // new DialogComponent({ drag: false }) → 禁用
     * }
     *
     * class CardComponent extends Component {
     *   drag = true;                    // 拖拽类型自动为 'Card'（类名派生）
     *   // 拖到容器时，容器 accept: ['Card'] 即可匹配
     * }
     */
    drag?: boolean | DragDecl;

    /**
     * 拖拽手柄节点 — 指定哪个节点作为拖拽触发区域
     *
     * 可选值：
     * - 节点 name（如 'header'、'handle'）
     * - 不设置时，自动查找模板中 drag: true 的节点
     * - 若模板无 drag 节点，使用组件自身 el
     *
     * @example
     * class DialogComponent extends Component {
     *   drag = true;
     *   dragHandle = 'header';  // header 节点为拖拽手柄
     * }
     */
    dragHandle?: string;

    /**
     * 放置区开关 — 控制组件是否可接收拖放
     *
     * - `true`：启用，使用 dropZone 或模板中的 drop 节点作为放置区
     * - `false`：禁用（覆盖模板中的 drop 声明）
     * - `DropDecl`：启用并带配置（accept、activeClass 等）
     * - `undefined`：使用模板中的默认声明
     *
     * @example
     * class ContainerComponent extends Component {
     *   drop = true;                     // 启用放置区
     *   dropZone = 'content';             // content 节点为放置区
     *   // 或在模板中声明：{ name: 'content', tag: 'div', drop: { accept: ['Card'] } }
     *   // new ContainerComponent({ drop: false }) → 禁用
     * }
     */
    drop?: boolean | DropDecl;

    /**
     * 放置区节点 — 指定哪个节点作为放置目标
     *
     * 可选值：
     * - 节点 name（如 'content'、'dropZone'）
     * - 不设置时，自动查找模板中 drop: true 的节点
     * - 若模板无 drop 节点，使用组件自身 el
     *
     * @example
     * class ContainerComponent extends Component {
     *   drop = true;
     *   dropZone = 'content';  // content 节点为放置区
     * }
     */
    dropZone?: string;

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
        this.drag = (this.props as any).drag;
        this.dragHandle = (this.props as any).dragHandle;
        this.drop = (this.props as any).drop;
        this.dropZone = (this.props as any).dropZone;
        this.parent = this.props.parent;
        this.slotName = this.props.slotName;
        this.meta = {};
        this._dirtyNodes = {};
        this.dirtySet = new Set();
        this._initializing = true;
        this._disposing = false;
        this.id = this.props.id || getId('cmp');
        this._initFloatsFromProps();
        this._ready = this.init();
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
     * Phase 2: INSTANTIATE — 异步（TaskQueue 队列化子组件渲染）
     * Phase 3: FINALIZE — 同步
     */
    async init(): Promise<void> {
        const ctx = createInitContext(this, this.props);

        try {
            await runPhase(MOUNT_PHASE, ctx);
            if (!ctx.nodeMapMgr) return;

            await runPhase(INSTANTIATE_PHASE, ctx);

            await runPhase(FINALIZE_PHASE, ctx);
        } catch (err) {
            this.logger?.error?.(
                `[Component] Pipeline failed for ${this.type} (${this.id}) at step "${ctx.steps[ctx.steps.length - 1] ?? 'unknown'}"`,
                {
                    completedSteps: ctx.steps,
                    nodeMapMgrReady: !!ctx.nodeMapMgr,
                    error: err,
                }
            );

            if (err instanceof ComponentError) {
                throw err;
            }
            throw new ComponentError(
                `Component "${this.type}" initialization failed: ${err instanceof Error ? err.message : String(err)}`,
                KernelErrorCode.COMPONENT_INIT_FAILED,
                { type: this.type, completedSteps: ctx.steps, cause: err }
            );
        } finally {
            this._initializing = false;
            this._flushNodeProps?.();
            this._commitFloats();
            this._commitDrags();
            this._commitDrops?.();
        }
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

    /**
     * 注册组件（无模板）
     *
     * 将组件类注册到 ComponentRegistrar，不绑定独立模板，
     * 沿原型链自动推导父类模板。适用于继承型组件（如 TabBarComponent → TabsComponent）。
     *
     * @example
     * ```ts
     * class TabBarComponent extends TabsComponent {}
     * TabBarComponent.register();  // 自动继承 TabsComponent 的模板
     * ```
     */
    static register(): void {
        ComponentRegistrar.getInstance().register(this);
    }

    /**
     * 注册组件并使用模板
     *
     * 将模板绑定到组件类并注册到 ComponentRegistrar。
     * 多次使用同一模板对象的组件会自动共享编译产物，避免重复编译。
     *
     * @param tpl - 模板定义（TplNode）
     *
     * @example
     * ```ts
     * class ButtonComponent extends Component {}
     * ButtonComponent.useTemplate(BUTTON_TPL);
     * ```
     */
    static useTemplate(tpl: TplNode): void {
        Object.defineProperty(this, '_tpl', {
            value: tpl,
            writable: true,
            configurable: true,
        });
        ComponentRegistrar.getInstance().register(this, tpl);
    }

    static inspectTpl(): void {
        const cls = this as any;
        const tpl: TplNode | undefined = cls._tpl;
        if (!tpl) {
            console.log(`  ⚠ ${cls.name} 未注册模板（先调用 ${cls.name}.useTemplate(tpl)）`);
            return;
        }
        TplInspector.inspect(tpl, cls.name);
    }

    private _disposeChildComponents(): void {
        this.nodeMapMgr?.disposeAll();
    }
}

Component.use(COMPONENT_ABILITIES);

export interface Component extends IComponent {}
