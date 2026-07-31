/**
 * DOM 事件委托类型定义 — 全委托模式（三层嵌套 domEvents）
 *
 * ══════════════════════════════════════════════════════════════
 * 全委托模式 — { [domEvent]: { [componentPath]: { [action]: eventConfig } } }
 * ══════════════════════════════════════════════════════════════
 *
 * 事件体系三部分：
 *   ① domEvents — DOM 委托事件与转发（本文件）
 *   ② childEvents — nodeMap 子组件事件订阅（tpl-body.ts HandlersListen）
 *   ③ listens — 事件监听（tpl-body.ts ListenItem[]，四路分流：source/entity/system/route）
 *
 * 核心规则：
 *   1. domEvents 三层嵌套：DOM事件 → 组件路径 → action → eventConfig
 *   2. 使用方在当前组件 el 上绑定 DOM 事件，委托匹配目标组件
 *   3. 组件路径首段为 nodeMap key（nodeName），直接定位；后续段为子组件类型
 *   4. 按钮不需要定义 domEvents，完全被动
 *   5. domEvents 就是声明式监听：handler:true 本地监听，emits 转发，可共存
 *
 * 三层结构：
 *   第一层 key = DOM 事件名（click / keypress / change 等）
 *   第二层 key = 组件路径（[nodeName].[componentName]...），首段为 nodeName（nodeMap key）
 *   第三层 key = action 名，区分同类型多实例
 *
 * 方法名推导（基于 nodeName，即 componentPath 首段）：
 *   on{NodeName}{Action}{Event}
 *
 *   - 无 action：onCloseBtnClick（路径 'closeBtn'）
 *   - 有 action：onToolbarSaveClick（路径 'toolbar.Button'，action 'save'）
 *   - 同节点多 action：onHeaderActionClick / onHeaderSaveClick（路径 'header.Button'）
 *
 * 运行时流程：
 *   在当前组件 el 上绑定 DOM 事件（如 click）
 *   → 事件触发 → 查 domEvents[click]
 *   → 取 componentPath 首段 → nodeMap[nodeName] 直接定位 → el.contains(event.target) 匹配
 *   → 检查 action 匹配 → 执行 eventConfig
 *
 * 详见 docs/design-decisions/2026-07-29-event-delegation-action-path-design.md
 */

// ══════════════════════════════════════════════════════════════
// 运行时委托元数据
// ══════════════════════════════════════════════════════════════

/**
 * 单条委托规则（运行时使用）
 *
 * 全委托模式下，从 domEvents 三层嵌套编译生成。
 * 运行时匹配：当前组件 el 上 DOM 事件触发 → nodeMap 定位 → el.contains → action 匹配
 */
export interface DelegatedEventRule {
    /** DOM 事件名（第一层 key） */
    event: string;

    /** 组件路径（第二层 key，格式 [nodeName].[componentName]...，如 'toolbar.Button'） */
    componentPath: string;

    /** action 名（第三层 key，如 'save'）。空字符串 '' 表示无 action 场景 */
    action: string;

    /**
     * 是否为 action 通配符模式
     *
     * 当 emits 包含 '[action]' 占位符时自动标记为 true，
     * 表示匹配任何 action 值，运行时用实际 action 替换 '[action]'。
     */
    wildcardAction?: boolean;

    /**
     * 事件数据声明
     */
    data?: string[] | Record<string, string[]>;

    /** 转发为组件事件 */
    emits?: string[];

    /** 转发为桥接事件 */
    bridges?: string[];

    /** 转发为实体操作 */
    entities?: string;

    /** 转发为路由事件 */
    router?: string;

    /** 转发为系统事件 */
    system?: string[];

    /**
     * DOM 事件委托 → 调用组件本地方法
     *
     * - true：自动推导方法名（on{NodeName}{Action}{Event}）
     * - string：使用自定义方法名
     */
    handler?: boolean | string;

    /** 只执行一次 */
    once?: boolean;

    /** 防抖时间 */
    debounce?: number;

    /** 节流时间 */
    throttle?: number;

    /** 是否需要内部绑定 */
    needsBinding: boolean;
}

/**
 * 单条事件配置（三层嵌套中的最内层对象）
 *
 * 不含 event / componentPath / action / needsBinding，
 * 用于 domEvents 的第三层 value，也可用于其他场景（如 item events）。
 */
export type DomEventConfig = Omit<
    DelegatedEventRule,
    'event' | 'componentPath' | 'action' | 'needsBinding'
>;

/**
 * 节点事件配置 — 单条 DOM 事件的监听与转发配置
 *
 * 等价于 DomEventConfig，用于 ItemGroup 等场景中为子节点声明事件。
 *
 * @example
 * ```ts
 * // ItemGroup 子节点的事件配置
 * { click: { handler: true, emits: ['itemClick'] } }
 * ```
 */
export type TplEventAction = DomEventConfig;

/**
 * domEvents 两层或三层嵌套类型
 *
 * 三层模式（显式 action）：
 *   { [domEvent]: { [componentPath]: { [action]: eventConfig } } }
 *   示例：{ click: { 'header.action': { collapse: { handler: true, emits: ['collapse'] } } } }
 *
 * 两层模式（[action] 占位符自动匹配）：
 *   { [domEvent]: { [componentPath]: eventConfig } }
 *   示例：{ click: { 'header.action': { handler: true, emits: ['[action]'] } } }
 *
 * 隐式 root 简写（省略 root 直接写配置键）：
 *   { [domEvent]: { [configKey]: value } }
 *   示例：{ input: { handler: '_onInput' } } ← 等价于 { input: { root: { handler: '_onInput' } } }
 *
 * 两层模式下：
 * - handler 方法名使用匹配组件的实际 action
 * - emits 中的 '[action]' 被替换为实际 action
 * - 支持逗号分隔多路径：'path1,path2': eventConfig
 */
export interface DomEventsMap {
    [domEvent: string]: {
        [componentPath: string]:
            | DomEventConfig
            | { [action: string]: DomEventConfig }
            | boolean
            | string
            | number
            | string[]
            | Record<string, string[]>;
    };
}

// 事件体系三部分：
// ① domEvents — DOM 委托事件与转发（本文件 DomEventsMap）
// ② childEvents — nodeMap 子组件事件订阅（tpl-body.ts ChildEventsListen）
// ③ listens — 事件监听（tpl-body.ts ListenItem[]，四路分流：source/entity/system/route）