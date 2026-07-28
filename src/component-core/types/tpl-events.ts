/**
 * 事件委托类型定义 — tplEvents 声明式事件系统
 *
 * ══════════════════════════════════════════════════════════════
 * 新方案：action 路径 + 监听驱动 + 前缀匹配
 * ══════════════════════════════════════════════════════════════
 *
 * 核心规则：
 *   1. tplEvents 是唯一事件定义入口，节点上不写 emits/action
 *   2. 监听驱动绑定：没有 on() 就不绑定，首次 on 时懒绑定，最后 off 时解绑
 *   3. action 路径定位：tplEvents 的 key 是 action 路径，沿 nodeMap + action 逐层定位
 *
 * tplEvents 定义示例：
 *
 *   // 组件定义 — 声明节点前缀
 *   tplEvents = {
 *       root: { prefix: '' },          // click → 'click', keypress → 'keypress'
 *       dropIcon: { prefix: 'drop' },  // click → 'dropClick', keypress → 'dropKeypress'
 *   }
 *
 *   // 使用方 — 按 action 路径声明委托
 *   tplEvents = {
 *       'toolbar.save': { click: { emits: ['save'] } },
 *       'toolbar.create': { click: { emits: ['create'] } },
 *       'toolbar.search': { change: { emits: ['searchChange'] } },
 *   }
 *
 * 前缀机制：
 *   节点声明 prefix，事件名 = prefix + eventName（首字母大写）
 *   prefix:'' + click → 'click'
 *   prefix:'drop' + click → 'dropClick'
 *   prefix:'search' + change → 'searchChange'
 *   前缀解决同一组件内多节点的同事件区分（root vs dropIcon）
 *
 * action 路径：
 *   tplEvents 的 key 是 action 路径，从外到内逐层定位
 *   'toolbar.save' → action='toolbar' 的子组件 → action='save' 的子组件 → 绑定委托
 *   统一用 action 定位，不用 name（action 是语义标识，name 是结构标识）
 *   action 路径解决同类型多实例区分（两个 Button，一个 save 一个 create）
 *
 * 两条事件通道：
 *   节点通道：DOM 事件委托（tplEvents），可跨组件边界穿透
 *   组件通道：child.on() 显式监听，跨组件边界层层转发
 *
 * 监听驱动：
 *   没人 on → 不绑定
 *   有人 on('save', handler) → 懒绑定 'toolbar.save' 的 click 委托
 *   全部 off('save') → 解绑
 *   子组件自带 tplEvents + 使用方追加 tplEvents，运行时合并，按需激活
 *
 * 组件事件能力声明：
 *   static actions = ['create', 'edit', 'delete', 'save']
 *   使用方据此知道能 on 什么，TypeScript 也可提示
 *
 * 详见 docs/design-decisions/2026-07-29-event-delegation-action-path-design.md
 */

// ══════════════════════════════════════════════════════════════
// 运行时委托元数据（编译时从 TplNode.emits 产出）
// ══════════════════════════════════════════════════════════════

/**
 * 扁平化后的单条委托规则（运行时使用）
 *
 * 编译时从 TplNode.emits/action/data 生成 DelegatedEventRule[]。
 *
 * 运行时匹配：
 *   从 event.target 向上遍历查找 NODE_EVENT_META
 *
 * 事件数据合成：
 *   action(语义动作) + data(额外字段)
 */
export interface DelegatedEventRule {
    /** 节点名或 action 路径（如 'toolbar.save'） */
    nodeName: string;

    /** DOM 事件名 */
    event: string;

    /**
     * 节点事件前缀 — 事件名 = prefix + eventName（首字母大写）
     *
     * prefix:'' + click → 'click'
     * prefix:'drop' + click → 'dropClick'
     * prefix:'search' + change → 'searchChange'
     */
    prefix?: string;

    /**
     * 语义动作名 — 事件数据中自动包含 { action }
     */
    action?: string;

    /**
     * 事件数据声明 — 从 TplNode.data 继承
     */
    data?: string[] | Record<string, string[]>;

    /** 转发为组件事件 */
    emits?: string[];

    /** 转发为桥接事件 */
    bridges?: string[];

    /**
     * 转发为实体操作
     */
    entities?: string;

    /**
     * 转发为路由事件
     */
    router?: string;

    /** 转发为系统事件 */
    system?: string[];

    /** 本地监听：调用组件方法 on${CapitalNodeName}${CapitalEvent}() */
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
