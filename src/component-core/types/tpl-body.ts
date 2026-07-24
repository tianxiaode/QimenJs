/**
 * Body 类型定义 — 组件模板 body 部分的完整类型系统
 *
 * 本文件是 body 相关所有类型的唯一定义源，
 * 与 tpl-body-def.ts（字段定义常量）配合使用。
 *
 * 详细设计说明见 tpl-body-def.ts 顶部注释。
 *
 * ══════════════════════════════════════════════════════════════
 * 双层架构下的 Body
 * ══════════════════════════════════════════════════════════════
 *
 * body 挂在内部类（InnerComponent）原型上，定义组件行为。
 * 闭包基类（ComponentFactory）不持有 body，只负责生成内部类。
 *
 * 新架构下 replace 的变化：
 *   - 旧：replace 通过 nodeOverrides 覆盖节点属性 + body 追加方法
 *   - 新：replace 基于已有内部类派生新内部类，可换模板 + 追加 body
 *   - 同结构小改（如 Date 改 attrs）仍可用 replace + nodeOverrides
 *   - 结构差异大的变体直接用 withTemplate 新建闭包类 + Ability 组合
 */

// ══════════════════════════════════════════════════════════════
// 事件订阅
// ══════════════════════════════════════════════════════════════

/**
 * 事件映射值 — 字符串简写 或 带选项对象
 *
 * once 等选项在事件级别定义，避免多个事件全部 once。
 *
 * @example
 * ```ts
 * events: {
 *     save: 'onSave',                              // 简写
 *     cancel: { handler: 'onCancel', once: true }, // 带选项
 * }
 * ```
 */
export type EventMapping = string | { handler: string; once?: boolean };

/**
 * 桥接事件订阅
 *
 * @example
 * ```ts
 * { source: 'formKey', events: { save: 'onSave', cancel: { handler: 'onCancel', once: true } } }
 * ```
 */
export interface BridgeListen {
    /** 桥接事件源 key */
    source: string;
    /** 事件映射：源事件名 → 处理方法名或带选项对象 */
    events: Record<string, EventMapping>;
}

/**
 * 实体事件订阅
 *
 * @example
 * ```ts
 * { entity: 'users', events: { listed: 'onUsersLoaded', created: { handler: 'onUserCreated', once: true } } }
 * ```
 */
export interface EntityListen {
    /** 实体 key */
    entity: string;
    /** 事件映射：实体事件名 → 处理方法名或带选项对象 */
    events: Record<string, EventMapping>;
}

/**
 * 浮动层事件订阅
 *
 * @example
 * ```ts
 * { float: 'dropBtn', events: { close: 'onClose', open: { handler: 'onOpen', once: true } } }
 * ```
 */
export interface FloatListen {
    /** 浮动层节点 name */
    float: string;
    /** 事件映射：浮动层事件名 → 处理方法名或带选项对象 */
    events: Record<string, EventMapping>;
}

/**
 * 拖拽事件订阅
 *
 * @example
 * ```ts
 * { drag: 'handle', events: { start: 'onDragStart', end: { handler: 'onDragEnd', once: true } } }
 * ```
 */
export interface DragListen {
    /** 拖拽节点 name */
    drag: string;
    /** 事件映射：拖拽事件名 → 处理方法名或带选项对象 */
    events: Record<string, EventMapping>;
}

/**
 * 系统事件订阅
 *
 * @example
 * ```ts
 * { system: true, events: { 'i18n:localeChange': 'onLocaleChange' } }
 * { system: true, events: { 'window:resize': 'onWindowResize' } }
 * ```
 */
export interface SystemListen {
    /** 标识为系统事件订阅 */
    system: true;
    /** 事件映射：系统事件名 → 处理方法名或带选项对象 */
    events: Record<string, EventMapping>;
}

/**
 * 路由事件订阅
 *
 * @example
 * ```ts
 * { route: 'router', events: { change: 'onRouteChange', 'change:users': 'onUsersRoute' } }
 * ```
 */
export interface RouteListen {
    /** 路由源 key（通常为 'router'） */
    route: string;
    /** 事件映射：路由事件名 → 处理方法名或带选项对象 */
    events: Record<string, EventMapping>;
}

/**
 * 统一事件订阅 — 数组格式，通过 key 名区分来源类型
 *
 * TplNode events 是【发布端】，body listens 是【订阅端】。一出进，不应混谈。
 *
 * 注册流程统一：
 *   _setupListens() {
 *       for (const item of this.listens) {
 *           if (item.source) EventBridge.on(this.eventKey, item.source, item.events);
 *           if (item.entity) EntityEventBus.on(this.entityKey, item.entity, item.events);
 *           if (item.float)  FloatSystem.on(this.floatKey, item.float, item.events);
 *           if (item.drag)   DragSystem.on(this.dragKey, item.drag, item.events);
 *           if (item.system) SystemEventBus.on(item.events);
 *           if (item.route)  RouteEventBus.on(item.route, item.events);
 *       }
 *   }
 *
 * @example
 * ```ts
 * listens: [
 *     { source: 'formKey', events: { save: 'onSave' } },
 *     { entity: 'users',   events: { listed: 'onUsersLoaded' } },
 *     { float: 'dropBtn',  events: { close: 'onClose' } },
 *     { drag: 'handle',    events: { start: 'onDragStart' } },
 *     { system: true, events: { 'i18n:localeChange': 'onLocaleChange' } },
 *     { system: true, events: { 'window:resize': 'onWindowResize' } },
 *     { route: 'router', events: { change: 'onRouteChange' } },
 * ]
 * ```
 */
export type ListenItem =
    | BridgeListen
    | EntityListen
    | FloatListen
    | DragListen
    | SystemListen
    | RouteListen;

// ══════════════════════════════════════════════════════════════
// 浮动层配置
// ══════════════════════════════════════════════════════════════

/** 浮动层触发方式 */
export type FloatTrigger = 'click' | 'hover' | 'focus' | 'manual' | 'always';

/**
 * 浮动层定义 — type 是唯一特殊字段，去掉 type 后直接作为组件构造参数
 *
 * 触发方式由 trigger 字段控制，不需要在 TplNode events 中声明：
 * - 有 trigger → 系统自动在锚点元素上绑定对应事件
 * - 无 trigger → 手动控制（代码调用 onFloat）
 *
 * 两种浮动模式：
 *
 * 1. 节点触发型：key 匹配节点 name，自动锚定该节点
 *    floats: {
 *        dropBtn: { type: 'DropPanel', align: 'bottom', trigger: 'click' },
 *        // key='dropBtn' → 锚定 nodeMap.dropBtn.el，点击触发
 *    }
 *
 * 2. 组件级浮动：key 是语义名，必须指定 anchor
 *    floats: {
 *        tooltip: { type: 'Tips', anchor: 'self', trigger: 'hover' },
 *        // anchor='self' → 锚定组件自身 el，悬停触发
 *        tooltip: { type: 'Tips', anchor: 'self', trigger: ['hover', 'click'] },
 *        // 悬停或点击都触发
 *        badge: { type: 'Badge', anchor: 'icon', trigger: 'always' },
 *        // anchor='icon' → 锚定 nodeMap.icon.el，始终显示
 *    }
 *
 * 处理流程：
 *   1. 取出 type → 解析组件类
 *   2. 删掉 type → 剩余配置
 *   3. new Component(remainingConfig) → 直接传入构造函数
 *
 * 统一了所有浮动场景：下拉面板、菜单、提示框、徽章等。
 */
export interface FloatDecl {
    /** 浮动层组件类型（唯一特殊字段，去掉后剩余配置直接作为构造参数） */
    type: string;
    /**
     * 锚定目标：
     * - 省略 → key 即为节点 name，自动锚定该节点
     * - 'self' → 锚定组件自身 el
     * - 节点 name → 锚定指定节点
     */
    anchor?: string | 'self';
    /**
     * 触发方式（有值则系统自动绑定，无值则手动控制）：
     * - 'click': 点击触发
     * - 'hover': 悬停触发
     * - 'focus': 聚焦触发
     * - 'manual': 手动控制
     * - 'always': 始终显示（如 badge，初始化时显示一次）
     * - 数组：多种触发方式组合（如 ['hover', 'click']）
     */
    trigger?: FloatTrigger | FloatTrigger[];
    /** 显示延迟（毫秒），trigger 为 hover 时生效 */
    showDelay?: number;
    /** 隐藏延迟（毫秒），trigger 为 hover 时生效 */
    hideDelay?: number;
    /** 组件构造参数（由具体组件类型决定） */
    [key: string]: any;
}

export type FloatsConfig = Record<string, FloatDecl>;

// ══════════════════════════════════════════════════════════════
// 拖拽配置
// ══════════════════════════════════════════════════════════════

/**
 * 拖拽定义 — 行为配置 + 可选影子组件 + 回调
 *
 * key=节点name（触发源），触发方式由 trigger 字段控制。
 *
 * 与 floats 不同，drags 的配置分两部分：
 * - 拖拽行为配置：axis、bounds 等 → 给 DragProcessor 用
 * - 拖拽影子组件：ghost 字段 → 影子组件类型
 *
 * 拖拽回调通过 body 中定义方法实现（函数自动挂原型）：
 *   body: {
 *       drags: { handle: { axis: 'y' } },
 *       onHandleDragStart(ctx) { ... },
 *       onHandleDragEnd(ctx) { ... },
 *   }
 *
 * @example
 * ```ts
 * drags: {
 *     handle: { axis: 'y', bounds: 'parent' },
 *     card:   { ghost: 'DragGhost', axis: 'both', bounds: { left: 0, top: 0 } },
 * }
 * ```
 */
export interface DragDecl {
    /** 拖拽影子组件类型（可选） */
    ghost?: string;
    /** 拖拽轴向：'x' | 'y' | 'both' */
    axis?: 'x' | 'y' | 'both';
    /** 拖拽边界约束 */
    bounds?:
        | HTMLElement
        | { left?: number; top?: number; right?: number; bottom?: number }
        | string;
    /** 拖拽时添加的 CSS 类 */
    activeClass?: string;
    /** 网格吸附步长 */
    grid?: number;
}

export type DragsConfig = Record<string, DragDecl>;

// ══════════════════════════════════════════════════════════════
// 动画配置
// ══════════════════════════════════════════════════════════════

/**
 * 组件动画配置 — 声明式，自动触发
 *
 * 在 body 中声明，运行时自动在对应生命周期播放：
 * - enter: 组件初始化完成后自动播放
 * - leave: 组件销毁前自动播放
 *
 * 动画是组件行为，不是节点属性：
 * - CSS transition 写在 TplNode 的 cls/style 里
 * - 进入/退出动画在这里声明，由框架自动触发
 * - 浮层组件（如 Menu）自己管自己的动画，触发组件（如 Button）只管 floats 声明
 *
 * @example
 * ```ts
 * body: {
 *     animation: {
 *         enter: 'slideInUp',
 *         leave: 'slideOutDown',
 *         duration: 200,
 *     }
 * }
 * ```
 */
export interface AnimationDecl {
    /** 进入动画预设名（如 fadeIn / slideInUp / scaleIn） */
    enter?: string;
    /** 进入动画自定义 Keyframe（与 enter 二选一） */
    enterKeyframes?: Keyframe[];
    /** 退出动画预设名（如 fadeOut / slideOutDown / scaleOut） */
    leave?: string;
    /** 退出动画自定义 Keyframe（与 leave 二选一） */
    leaveKeyframes?: Keyframe[];
    /** 动画时长（毫秒），默认 300 */
    duration?: number;
    /** 缓动函数，默认 'ease' */
    easing?: string;
    /** 是否启用动画，默认 true */
    enabled?: boolean;
}

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
 *
 * @example
 * ```ts
 * body: {
 *     onBeforeInit() { ... },   // 初始化前
 *     onAfterInit() { ... },    // 初始化后
 *     onMounted() { ... },      // 挂载后
 *     onResize(entry) { ... },  // 元素尺寸变化（有此方法才绑 ResizeObserver）
 *     onUpdated() { ... },      // 更新后
 *     onBeforeUnmount() { ... },// 卸载前
 *     onBeforeDispose() { ... },// 销毁前（组件清理的唯一入口）
 * }
 * ```
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
// Body 定义
// ══════════════════════════════════════════════════════════════

/**
 * 组件 body 定义 — 组件行为和配置的声明
 *
 * body 只接受以下三类内容：
 *
 * 1. static 类（编译时设为类静态属性）：
 *    type / entityKey / eventKey / floatKey / dragKey / listens / forwards
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
 *    - 实例内部状态 → 推荐使用 _applyState 模式（见下方）
 *
 * ══════════════════════════════════════════════════════════════
 * 推荐做法：_applyState 模式
 * ══════════════════════════════════════════════════════════════
 *
 * 内部状态初始化和状态→DOM 同步集中到 _applyState 方法：
 *
 * 1. 在 onAfterInit 中初始化内部状态 + 首次调用 _applyState
 * 2. setter 中调用 _applyState 自动刷新 DOM
 * 3. dispose 时框架自动清理 DOM，无需手动释放
 *
 * @example
 * ```ts
 * body: {
 *     // ❌ 不要这样写纯数据值
 *     // _pool: [],
 *     // _pressed: false,
 *
 *     onAfterInit() {
 *         // ✅ 在钩子中初始化内部状态
 *         this._pool = [];
 *         this._pressed = false;
 *         this._applyState();
 *     },
 *
 *     // ✅ _applyState 集中处理状态→DOM 同步
 *     _applyState() {
 *         this.el.classList.toggle('q-toggle--pressed', this._pressed);
 *         this.el.classList.toggle('q-toggle--disabled', this.disabled);
 *         this.el.setAttribute('aria-pressed', String(this._pressed));
 *     },
 *
 *     // ✅ setter 中调 _applyState 自动刷新
 *     get pressed() { return this._pressed; },
 *     set pressed(v) { this._pressed = v; this._applyState(); },
 * }
 * ```
 *
 * @example
 * ```ts
 * body: {
 *     type: 'myComponent',
 *     entityKey: 'users',
 *     eventKey: 'formKey',
 *     floatKey: 'myFloats',
 *     dragKey: 'myDrags',
 *     listens: [
 *         { source: 'formKey', events: { save: 'onSave' } },
 *         { entity: 'users', events: { listed: 'onUsersLoaded' } },
 *         { float: 'dropBtn', events: { close: 'onClose' } },
 *         { drag: 'handle', events: { start: 'onDragStart' } },
 *         { route: 'router', events: { change: 'onRouteChange' } },
 *     ],
 *     floats: {
 *         dropBtn: { type: 'DropPanel', align: 'bottom' },
 *         helpIcon: { type: 'Tips', placement: 'top' },
 *     },
 *     drags: {
 *         handle: { axis: 'y', bounds: 'parent' },
 *     },
 *     abilities: [DragAbility],
 *     onMounted() { ... },
 *     onResize(entry) { ... },
 *     onBtnClick(ctx, el) { ... },
 *     onUsersListed(data) { ... },
 * }
 * ```
 */
/**
 * 节点配置 — 声明式节点属性覆盖
 *
 * 统一替代 nodeOverrides 和 replace() 中的 cls/itemsCls，
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
 *
 * @example
 * ```ts
 * body: {
 *     nodes: {
 *         root: { addCls: 'q-form' },
 *         itemContainer: { addCls: 'q-form__fields' },
 *         fieldBody: { type: InputFieldBodyComponent, events: { actionClick: { handler: true } } },
 *         dropIcon: { hidden: false },
 *     }
 * }
 * ```
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

export interface BodyDef extends LifecycleHooks {
    // ─── static: 编译时设为类静态属性 ───

    /** 组件类型标识 */
    type?: string;

    /** 实体 key，TplNode events 中 entities 引用 */
    entityKey?: string;

    /** 桥接事件 key，TplNode events 中 bridges 引用 */
    eventKey?: string;

    /** 浮动层 key */
    floatKey?: string;

    /** 拖拽 key */
    dragKey?: string;

    /** 统一事件订阅数组 */
    listens?: ListenItem[];

    // ─── init: 运行时由 InitAbility 初始化 ───

    /** 浮动层配置，key=节点name，type+配置=构造参数 */
    floats?: FloatsConfig;

    /** 拖拽配置，key=节点name，行为配置+可选影子组件 */
    drags?: DragsConfig;

    /** 组件动画配置，声明式，初始化/销毁时自动触发 */
    animation?: AnimationDecl;

    /** 附加能力，替代 .with() 的声明式注入 */
    abilities?: any[];

    /** 节点配置，声明式覆盖节点属性，替代 nodeOverrides 和 replace 的 cls/itemsCls */
    nodes?: NodesConfig;

    // ─── 其他：函数→原型方法，getter/setter→defineProperty ───

    [key: string]: any;
}
