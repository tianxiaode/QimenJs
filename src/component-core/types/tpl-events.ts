/**
 * 事件委托类型定义 — 节点级事件声明
 *
 * ══════════════════════════════════════════════════════════════
 * 节点级事件声明
 * ══════════════════════════════════════════════════════════════
 *
 * 事件声明内联到 TplNode 上，通过 emits 和 action 字段声明。
 * 详见 tpl-node-types.ts（TplNode.emits / TplNode.action）和 tpl-node-def.ts。
 *
 * emits 字段：声明节点的 DOM 事件到组件事件的映射
 *   { emits: { click: 'click' } }
 *   { emits: { click: 'dropClick' } }
 *   { emits: { click: 'click', mouseenter: 'hoverOn' } }
 *
 * action 字段：声明节点的语义动作，自动合并到事件数据
 *   { action: 'save' }  → 事件数据中包含 { action: 'save' }
 *
 * data 字段：声明节点的额外事件数据字段，自动收集并合并
 *   { data: ['name', 'getFormData'] }  → 从组件取 name 属性 + 调用 getFormData()
 *   { data: { emit: ['name'], entity: ['getEntityData'] } }  → 按事件类型区分
 *
 * 编译流程：
 *   TplNode.emits → CompileEngine → NodeMetadata.emits
 *   TplNode.action → CompileEngine → NodeMetadata.action
 *   TplNode.data → CompileEngine → NodeMetadata.data
 *
 * 运行时流程：
 *   1. Pipeline 中 bindNodeEventMeta 步骤：
 *      - 为节点 el 设置 NODE_EVENT_META = { nodeName, eventTypes: Set, action?, data? }
 *      - 为组件 el 设置 COMPONENT_ROOT 标记（边界保护）
 *   2. 事件委托触发时 handleDelegatedEvent：
 *      - 从 event.target 向上遍历 parentElement
 *      - 查找最近的 NODE_EVENT_META（匹配 eventType）
 *      - 碰到 COMPONENT_ROOT 停止（防止越界）
 *      - 找到匹配 → 合并事件数据 → 执行 emit
 *
 * 事件数据收集：
 *   - action: 节点声明的语义动作（自动加入）
 *   - data: 节点声明的额外数据字段（自动收集）
 *   - 两者合并构成最终事件数据
 *
 * 匹配机制：
 *   从 event.target 向上遍历查找 NODE_EVENT_META，碰到 COMPONENT_ROOT 停止
 *   子组件自己声明事件能力，父组件通过 item.on('click', handler) 监听
 *   不需要 $items 或 containsElement
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
    /** 节点名 */
    nodeName: string;

    /** DOM 事件名 */
    event: string;

    /**
     * 语义动作名 — 从 TplNode.action 继承
     *
     * 节点声明的 action 字段自动合并到事件数据中，
     * 用于 entity/route 等语义化事件的标识。
     */
    action?: string;

    /**
     * 事件数据声明 — 从 TplNode.data 继承
     *
     * 支持两种形式：
     *   1. 数组 — 所有事件类型共享
     *      data: ['name', 'getFormData']
     *   2. 对象 — 按事件类型区分
     *      data: { emit: ['name'], entity: ['getEntityData'] }
     */
    data?: string[] | Record<string, string[]>;

    /** 转发为组件事件 */
    emits?: string[];

    /** 转发为桥接事件 */
    bridges?: string[];

    /**
     * 转发为实体操作
     * - string: 硬编码实体动作名
     */
    entities?: string;

    /**
     * 转发为路由事件
     * - string: 硬编码路由名
     */
    router?: string;

    /** 转发为系统事件 */
    system?: string[];

    /** 只执行一次 */
    once?: boolean;

    /** 防抖时间 */
    debounce?: number;

    /** 节流时间 */
    throttle?: number;

    /** 是否需要内部绑定 */
    needsBinding: boolean;
}
