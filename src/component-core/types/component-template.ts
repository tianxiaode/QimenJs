/**
 * component-template.ts — 组件模板定义
 *
 * ComponentTemplate = tpl（DOM 骨架）+ body（行为配置），
 * 是 withTemplate 的输入类型。
 *
 * 直接类模式：只有单模板，不再支持多模板 when 条件选择。
 * 变体派生统一通过 .replace() 实现。
 *
 * ══════════════════════════════════════════════════════════════
 * 组件模板结构
 * ══════════════════════════════════════════════════════════════
 *
 * tpl: 模板结构定义（TplNode）
 *   - 定义 DOM 骨架和组件树
 *   - 编译时生成 HTML + nodeMetas
 *   - 运行时克隆模板、构建 nodeMap
 *
 * body: 组件行为配置（BodyDef）
 *   - 静态属性：type/entityKey/eventKey/floatKey/dragKey/listens/forwards
 *   - 初始化配置：floats/drags/animation/abilities/nodes/localData
 *   - 生命周期钩子：onBeforeInit/onAfterInit/onMounted/onResize/onUpdated/onBeforeUnmount/onBeforeDispose
 *   - 自定义方法：任意方法名
 *
 * @see TplNode - 模板节点定义
 * @see BodyDef - 组件行为定义
 */

import type { TplNode, ListenItem, AnimationDecl } from './tpl-node-types';

// ══════════════════════════════════════════════════════════════
// 生命周期钩子
// ══════════════════════════════════════════════════════════════

/**
 * 组件生命周期钩子 — 在 body 中定义，函数自动挂原型
 *
 * 调用顺序：
 *   onBeforeInit → 模板注入 → onAfterInit → onMounted → [运行中] → onBeforeUnmount → onBeforeDispose → [框架销毁]
 *
 * 注意：onDisposed 不暴露给组件，销毁由框架内部保证执行，不可覆写。
 * 组件清理逻辑统一放在 onBeforeDispose 中。
 */
export interface LifecycleHooks {
    /** 初始化前（模板注入前） */
    onBeforeInit?: () => void;
    /** 初始化后（模板注入、事件绑定、能力注入完成） */
    onAfterInit?: () => void;
    /** 挂载后（DOM 已渲染，可访问 el 和 nodeMap） */
    onMounted?: () => void;
    /** 元素尺寸变化（定义此方法才自动绑 ResizeObserver，否则不绑） */
    onResize?: (entry: ResizeObserverEntry) => void;
    /** 更新后（属性或内容变更后） */
    onUpdated?: () => void;
    /** 卸载前（组件即将从 DOM 移除） */
    onBeforeUnmount?: () => void;
    /** 销毁前（组件清理的唯一入口，框架销毁不可覆写） */
    onBeforeDispose?: () => void;
}

// ══════════════════════════════════════════════════════════════
// 节点配置
// ══════════════════════════════════════════════════════════════

/**
 * 节点配置 — 声明式节点属性覆盖
 *
 * 替代 replace() 中的 cls/itemsCls，
 * 在 body 中声明式配置节点属性，编译时提取，运行时由 initNodeProps 应用。
 *
 * 字段语义：
 * - addCls: 追加 CSS 类（与现有 cls 拼接，替代 replace 的 cls/itemsCls）
 * - cls: 替换 CSS 类（覆盖 TplNode 中的 cls）
 * - hidden: 覆盖隐藏状态
 * - type: 替换子组件类型
 * - events: 替换事件声明（全量替换，不合并）
 * - initConfig: 合并子组件初始配置
 * - style/flex/grid/role/attrs: 覆盖对应属性
 */
export interface NodeConfig {
    addCls?: string;
    cls?: string;
    hidden?: boolean;
    hiddenMode?: string;
    type?: any;
    events?: Record<string, any>;
    initConfig?: Record<string, any>;
    style?: string | Record<string, any>;
    flex?: boolean | Record<string, any>;
    grid?: boolean | Record<string, any>;
    role?: string;
    attrs?: Record<string, string>;
    [key: string]: any;
}

export type NodesConfig = Record<string, NodeConfig>;

// ══════════════════════════════════════════════════════════════
// 本地数据配置
// ══════════════════════════════════════════════════════════════

/**
 * 本地数据配置 — key→数据数组，运行时自动注入组件
 *
 * 在 body 中声明式定义本地数据，不经过 Entity 系统。
 * RuntimeEngine 初始化时自动调用 setLocalData 注册到组件。
 *
 * 与 props.localData 合并规则：props 中同名 key 覆盖 body 中的定义。
 */
export type LocalDataConfig = Record<string, any[]>;

// ══════════════════════════════════════════════════════════════
// Body 定义
// ══════════════════════════════════════════════════════════════

/**
 * 组件 body 定义 — 组件行为和配置的声明
 *
 * body 只接受以下三类内容：
 *
 * 1. static 类（编译时设为类静态属性）：
 *     type / entityKey / eventKey / floatKey / dragKey / listens / forwards
 *
 * 2. 函数（编译时挂到原型）：
 *    - 生命周期钩子：onBeforeInit / onAfterInit / onMounted / onResize / onUpdated / onBeforeUnmount / onBeforeDispose
 *    - 事件 handler：on{Name}{Event}（如 onBtnClick）
 *    - 拖拽回调：on{Name}Drag{Event}（如 onHandleDragStart）
 *    - 浮动层回调：on{Name}Float{Event}（如 onDropBtnFloatClose）
 *    - 自定义方法：任意方法名
 *
 * 3. getter/setter（编译时 defineProperty 到原型）：
 *    - 计算属性：get/set 定义
 *
 * 不接受纯数据值（如 _pool: []、title: 'Hello'）：
 *    - 默认属性值 → 写在 TplNode 节点定义里
 *    - 实例内部状态 → 推荐使用 _applyState 模式
 *
 * _applyState 模式：
 *   1. 在 onAfterInit 中初始化内部状态 + 首次调用 _applyState
 *   2. setter 中调用 _applyState 自动刷新 DOM
 *   3. dispose 时框架自动清理 DOM，无需手动释放
 *
 * @example
 * body: {
 *     onAfterInit() {
 *         this._pool = [];
 *         this._pressed = false;
 *         this._applyState();
 *     },
 *     _applyState() {
 *         this.el.classList.toggle('q-toggle--pressed', this._pressed);
 *         this.el.classList.toggle('q-toggle--disabled', this.disabled);
 *         this.el.setAttribute('aria-pressed', String(this._pressed));
 *     },
 *     get pressed() { return this._pressed; },
 *     set pressed(v) { this._pressed = v; this._applyState(); },
 * }
 *
 * @example
 * body: {
 *     type: 'myComponent',
 *     entityKey: 'users',
 *     eventKey: 'formKey',
 *     listens: [
 *         { source: 'formKey', events: { save: 'onSave' } },
 *         { entity: 'users', events: { listed: 'onUsersLoaded' } },
 *         { float: 'dropBtn', events: { close: 'onClose' } },
 *         { drag: 'handle', events: { start: 'onDragStart' } },
 *         { route: 'router', events: { change: 'onRouteChange' } },
 *     ],
 *     animation: {
 *         enter: 'fadeIn',
 *         leave: 'fadeOut',
 *         duration: 200,
 *     },
 *     nodes: {
 *         root: { addCls: 'q-form' },
 *         itemContainer: { addCls: 'q-form__fields' },
 *     },
 *     onMounted() { ... },
 *     onResize(entry) { ... },
 *     onBtnClick(ctx, el) { ... },
 *     onUsersListed(data) { ... },
 * }
 */
export interface BodyDef extends LifecycleHooks {
    // ─── static: 编译时设为类静态属性 ───

    /** 组件类型标识 */
    type?: string;

    /**
     * 实体 key，TplNode events 中 entities 引用
     *
     * 父组件实例化子组件时向下传播：
     *   - 子组件有定义且 fixed → 保留子组件的值
     *   - 子组件有定义且非 fixed → 替换为父组件的值
     *   - 子组件无定义 → 不管
     */
    entityKey?: string | { key: string; fixed?: boolean };

    /**
     * 组件事件 key，ComponentEventBus 通道标识
     *
     * 父组件实例化子组件时向下传播：
     *   - 子组件有定义且 fixed → 保留子组件的值
     *   - 子组件有定义且非 fixed → 替换为父组件的值
     *   - 子组件无定义 → 不管
     */
    eventKey?: string | { key: string; fixed?: boolean };

    /** 统一事件订阅数组 */
    listens?: ListenItem[];

    /** 本地数据激活 key，声明组件渲染使用的数据源 */
    localDataKey?: string;

    // ─── init: 运行时由 InitAbility 初始化 ───

    /** 节点配置，声明式覆盖节点属性，替代 replace 的 cls/itemsCls */
    nodes?: NodesConfig;

    /** 本地数据，key→数据数组，运行时自动注入组件 */
    localData?: LocalDataConfig;

    /** 组件动画配置 — 声明式，初始化/销毁时自动触发 */
    animation?: AnimationDecl;

    // ─── 其他：函数→原型方法，getter/setter→defineProperty ───

    [key: string]: any;
}

// ══════════════════════════════════════════════════════════════
// 组件模板定义
// ══════════════════════════════════════════════════════════════

/**
 * 组件模板定义
 *
 * 完整的组件模板由两部分组成：
 * 1. tpl - DOM 骨架结构
 * 2. body - 组件行为和配置
 *
 * @see withTemplate - 创建组件的工厂函数
 * @see TplNode - 模板节点定义
 * @see BodyDef - 组件行为定义
 */
export interface ComponentTemplate {
    /**
     * 模板根节点定义
     *
     * 定义组件的 DOM 骨架结构，包括标签、类名、子节点等。
     * 编译时递归遍历生成 HTML，运行时克隆模板构建 nodeMap。
     */
    tpl: TplNode;

    /**
     * 组件行为配置
     *
     * 定义组件的行为、状态管理、生命周期钩子等。
     * 包括静态属性、初始化配置、生命周期方法、自定义方法。
     */
    body?: BodyDef;
}
