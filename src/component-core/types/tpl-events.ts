/**
 * DOM 事件委托类型定义 — 全委托模式（三层嵌套 domEvents）
 *
 * ══════════════════════════════════════════════════════════════
 * 新方案：全委托模式 — { [domEvent]: { [componentPath]: { [action]: eventConfig } } }
 * ══════════════════════════════════════════════════════════════
 *
 * 事件体系三部分：
 *   ① domEvents — DOM 委托事件与转发（本文件）
 *   ② childEvents — nodeMap 子组件事件订阅（tpl-body.ts HandlersListen）
 *   ③ listens — 事件监听（tpl-body.ts ListenItem[]）
 *
 * 核心规则：
 *   1. domEvents 三层嵌套：DOM事件 → 组件路径 → action → eventConfig
 *   2. 使用方在当前组件 el 上绑定 DOM 事件，委托匹配目标组件
 *   3. 组件路径沿 nodeMap 逐层定位，天然跨层穿透，无需层层 on 转发
 *   4. 按钮不需要定义 domEvents，完全被动
 *   5. domEvents 就是声明式监听：handler:true 本地监听，emits 转发，可共存
 *
 * domEvents 定义示例：
 *
 *   domEvents = {
 *       keypress: {
 *           'toolbar.Button': {
 *               'save':   { handler: true, emits: ['save'], entities: true },
 *               'create': { handler: true, emits: ['create'] },
 *           },
 *       },
 *       click: {
 *           'toolbar.Button': {
 *               'save':   { emits: ['save'] },
 *               'create': { emits: ['create'] },
 *           },
 *       },
 *   }
 *
 * 三层结构：
 *   第一层 key = DOM 事件名（click / keypress / change 等）
 *   第二层 key = 组件路径（[nodeName].[componentName]...），首段为 nodeName（nodeMap key）
 *   第三层 key = action 名，区分同类型多实例
 *
 * 运行时流程：
 *   在当前组件 el 上绑定 DOM 事件（如 click）
 *   → 事件触发 → 查 domEvents[click]
 *   → 遍历组件路径 → nodeMap 逐层定位（首段为 nodeName） → el.contains(event.target) 匹配
 *   → 找到目标组件 → 检查 action 匹配 → 执行 eventConfig
 *
 * 前缀机制：
 *   组件定义时声明节点前缀（prefix: 'drop'），事件名 = prefix + eventName
 *   prefix:'' + click → 'click'
 *   prefix:'drop' + click → 'dropClick'
 *   前缀解决同一组件内多节点的同事件区分（root vs dropIcon）
 *
 * 组件事件能力声明：
 *   static actions = ['create', 'edit', 'delete', 'save']
 *   使用方据此知道能 on 什么，TypeScript 也可提示
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
 * 运行时匹配：当前组件 el 上 DOM 事件触发 → 组件路径定位 → el.contains → action 匹配
 */
export interface DelegatedEventRule {
    /** DOM 事件名（第一层 key） */
    event: string;

    /** 组件路径（第二层 key，格式 [nodeName].[componentName]...，如 'toolbar.Button'） */
    componentPath: string;

    /** action 名（第三层 key，如 'save'） */
    action: string;

    /**
     * 节点事件前缀 — 事件名 = prefix + eventName（首字母大写）
     *
     * prefix:'' + click → 'click'
     * prefix:'drop' + click → 'dropClick'
     */
    prefix?: string;

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

    /** DOM 事件委托 → 调用组件本地方法 */
    handler?: boolean;

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
 * domEvents 三层嵌套类型
 *
 * { [domEvent]: { [componentPath]: { [action]: eventConfig } } }
 */
export interface DomEventsMap {
    [domEvent: string]: {
        [componentPath: string]: {
            [action: string]: Omit<
                DelegatedEventRule,
                'event' | 'componentPath' | 'action' | 'needsBinding'
            >;
        };
    };
}

// 事件体系三部分：
// ① domEvents — DOM 委托事件与转发（本文件 DomEventsMap）
// ② childEvents — nodeMap 子组件事件订阅（tpl-body.ts ChildEventsListen）
// ③ listens — 事件监听（tpl-body.ts ListenItem[]，四路分流：source/entity/system/route）
