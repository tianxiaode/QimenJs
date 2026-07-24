/**
 * TplEvents 类型定义 — 组件级事件委托声明
 *
 * 与 tpl/body 同级定义，取代 TplNode 中的 events 字段。
 * 所有 DOM 事件统一委托到组件根 el，通过 nodeElMap (WeakMap) 反查匹配。
 *
 * ══════════════════════════════════════════════════════════════
 * 声明格式
 * ══════════════════════════════════════════════════════════════
 *
 * key = 节点名（nodeName），value 有两种形式：
 *
 * 1. 数组 — 纯声明，零绑定，事件冒泡给父组件委托处理
 *    btn: ['click']
 *    field: ['input', 'focus', 'blur']
 *
 * 2. 对象 — 需要内部处理的事件，在对应 el 上绑定监听器
 *    eye: { click: { handler: true } }
 *    field: { input: { handler: 'onInput', debounce: 300 }, focus: { handler: true } }
 *
 * ══════════════════════════════════════════════════════════════
 * 绑定策略
 * ══════════════════════════════════════════════════════════════
 *
 * ┌──────────────────────┬──────────────────────────────────────┐
 * │ 声明格式             │ 绑定方式                             │
 * ├──────────────────────┼──────────────────────────────────────┤
 * │ btn: ['click']       │ 零绑定，冒泡到父组件委托             │
 * │ eye: { click: {...}} │ 在 eye el 上绑定，handler 处理后冒泡 │
 * └──────────────────────┴──────────────────────────────────────┘
 *
 * 匹配机制：运行时从 nodeMap 构建 WeakMap<el, nodeName>，
 * 委托处理器从 e.target 向上遍历查找，天然隔离子组件边界。
 *
 * @example
 * ```ts
 * const ButtonComponent = Component.withTemplate(BUTTON_TEMPLATE, {
 *     type: 'Button',
 *     tplEvents: {
 *         btn: ['click'],                        // 纯声明，零绑定
 *         eye: { click: { handler: true } },     // 内部处理
 *         field: { input: { handler: 'onInput', debounce: 300 } },
 *     },
 *     body: { ... },
 * })
 * ```
 */

// ══════════════════════════════════════════════════════════════
// 节点级事件声明
// ══════════════════════════════════════════════════════════════

/**
 * 单个事件声明（需要内部处理时使用）
 *
 * 有此声明的事件会在对应节点的 el 上绑定监听器，
 * handler 处理后事件继续冒泡到父组件。
 */
export interface TplEventAction {
    /**
     * 内部 handler 方法
     * - true: 自动推导 on{NodeName}{Event}（推荐）
     * - string: 显式指定方法名
     */
    handler?: boolean | string;

    /** 转发为组件事件，持有方通过 on(name, fn) 监听 */
    emits?: string[];

    /** 转发为桥接事件（通过 EventBridge 解耦转发） */
    bridges?: string[];

    /** 转发为实体操作，值为 mgr 方法名 */
    entities?: string;

    /** handler 只执行一次 */
    once?: boolean;

    /** 防抖时间（毫秒） */
    debounce?: number;

    /** 节流时间（毫秒） */
    throttle?: number;
}

/**
 * 节点级事件声明 — 两种形式
 *
 * 1. 字符串数组 — 纯声明，零绑定，冒泡给父
 *    btn: ['click']
 *
 * 2. 对象 — 需要内部处理的事件
 *    eye: { click: { handler: true } }
 */
export type NodeEventDecl = string[] | Record<string, TplEventAction>;

/**
 * 组件级事件委托声明 — 与 tpl/body 同级
 *
 * key = 节点名（nodeName），value 为该节点的事件声明。
 *
 * @example
 * ```ts
 * tplEvents: {
 *     btn: ['click'],
 *     field: ['input', 'focus', 'blur'],
 *     eye: { click: { handler: true } },
 * }
 * ```
 */
export interface TplEvents {
    [nodeName: string]: NodeEventDecl;
}

// ══════════════════════════════════════════════════════════════
// 运行时委托元数据（编译时从 tplEvents 产出）
// ══════════════════════════════════════════════════════════════

/**
 * 扁平化后的单条委托规则（运行时使用）
 *
 * 编译时将 TplEvents 展开为 DelegatedEventRule[]，
 * 运行时委托处理器通过 nodeElMap 匹配后分发。
 */
export interface DelegatedEventRule {
    /** 节点名 */
    nodeName: string;

    /** DOM 事件名 */
    event: string;

    /** 内部 handler 方法名（已解析） */
    handler?: string;

    /** 转发为组件事件 */
    emits?: string[];

    /** 转发为桥接事件 */
    bridges?: string[];

    /** 转发为实体操作 */
    entities?: string;

    /** 只执行一次 */
    once?: boolean;

    /** 防抖时间 */
    debounce?: number;

    /** 节流时间 */
    throttle?: number;

    /** 是否需要内部绑定（有 handler/emits/bridges/entities） */
    needsBinding: boolean;
}
