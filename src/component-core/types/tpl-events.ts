/**
 * TplEvents 类型定义 — 统一事件委托声明
 *
 * ══════════════════════════════════════════════════════════════
 * 节点级事件声明（新方案，推荐）
 * ══════════════════════════════════════════════════════════════
 *
 * 事件声明已内联到 TplNode 上，通过 emits 和 action 字段声明。
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
 *   - defaultEventData: 组件注册时声明的基础字段
 *   - action: 节点声明的语义动作（自动加入）
 *   - data: 节点声明的额外数据字段（自动收集）
 *   - rule.data: tplEvents 中声明的额外字段（旧方案，仍支持）
 *   - 四者合并构成最终事件数据
 *
 * ══════════════════════════════════════════════════════════════
 * 兼容方案：组件级 tplEvents（旧方案，仍支持）
 * ══════════════════════════════════════════════════════════════
 *
 * 与 tpl/body 同级定义，所有 DOM 事件统一委托到组件根 el，
 * 通过 containsElement 匹配分发，$items 规则通过 getTargetItem 定位 item。
 *
 * key = 节点名（nodeName），value 有三种形式：
 *
 * 1. 数组 — 纯声明，零绑定，事件冒泡给父组件委托处理
 *    btn: ['click']
 *    field: ['input', 'focus', 'blur']
 *
 * 2. 对象 — 需要内部处理的事件，在对应 el 上绑定监听器
 *    eye: { click: { handler: true } }
 *    field: { input: { handler: 'onInput', debounce: 300 } }
 *
 * 3. $items — ItemGroup 容器内子组件事件，按组件类型匹配
 *    itemContainer: {
 *        scroll: { handler: true },
 *        $items: {
 *            Button:   { click: { emits: ['itemClick'] } },
 *            MenuItem: { click: { emits: ['select'] } },
 *        }
 *    }
 *
 * ══════════════════════════════════════════════════════════════
 * $items 专用特性
 * ══════════════════════════════════════════════════════════════
 *
 * keyProp — 从 item 组件取属性值作为事件名前缀（默认 'name'）
 *   Icon: { click: { handler: true } }
 *   // Icon(name='eye') → onEyeClick, Icon(name='clear') → onClearClick
 *
 *   Icon: { click: { emits: ['actionClick'] } }
 *   // Icon(name='eye') → emit 'eyeActionClick' + 'actionClick'
 *
 *   Button: { click: { entities: true } }
 *   // Button(name='save') → entityEmit('save')
 *
 *   NavItem: { click: { emits: ['switch'], router: true } }
 *   // NavItem(name='users') → emit 'usersSwitch', routerEmit('users')
 *
 * data — 事件数据声明，支持属性取值和方法调用
 *   // 数组形式（所有事件类型共享）
 *   data: ['name', 'path', 'getFormData']
 *   // 'name'/'path' → 从 item 组件取属性值
 *   // 'getFormData' → 调用 instance.getFormData() 合入返回值
 *
 *   // 对象形式（按事件类型区分）
 *   data: { emit: ['name'], entity: ['getEntityData'], router: ['path'] }
 *
 * defaultEventData — 组件注册时声明的基础数据字段（ComponentRegistrar.register 第三个参数）
 *   registrar.register('Button', ButtonComponent, { defaultEventData: ['name'] })
 *   registrar.register('Input', InputComponent,  { defaultEventData: ['name', 'getFormValue'] })
 *
 *   编译时自动合并：effectiveData = defaultEventData ∪ data（去重）
 *   tplEvents 中只需声明额外字段，基础数据自动带上
 *
 *   例：Input 注册了 defaultEventData: ['name', 'getFormValue']
 *   tplEvents: { Input: { input: { emits: ['inputChange'] } } }
 *   // 编译后 data 自动包含 ['name', 'getFormValue']，无需显式声明
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
 * │ $items: {...}        │ 容器内按 item type 匹配分发          │
 * └──────────────────────┴──────────────────────────────────────┘
 *
 * 匹配机制：
 * - 新方案（节点级 emits）：从 event.target 向上遍历查找 NODE_EVENT_META，碰到 COMPONENT_ROOT 停止
 * - 旧方案（组件级 tplEvents）：containsElement(nodeName, target) 判断 target 所属
 * - $items 节点：containsElement 判断容器 → getTargetItem 定位 item → itemType 匹配
 * - 数据合并：defaultEventData(基础) + action(语义动作) + data(节点额外字段) + rule.data(tplEvents额外字段) → 最终事件数据
 *
 * @example
 * ```ts
 * // 普通组件
 * const ButtonComponent = Component.withTemplate({
 *     tpl: BUTTON_TEMPLATE,
 *     tplEvents: {
 *         btn: ['click'],
 *         eye: { click: { handler: true } },
 *     },
 *     body: { type: 'button' },
 * })
 *
 * // ItemGroup 组件
 * const MenuComponent = ItemGroupStaticComponent.replace({
 *     type: 'Menu',
 *     tplEvents: {
 *         itemContainer: {
 *             $items: {
 *                 MenuItem: { click: { emits: ['click'], entities: true } },
 *             },
 *         },
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

    /**
     * 转发为实体操作
     *
     * 编码: entity:{entityKey}:{entityName}
     * - true: 仅用于 $items 节点，entityName = item[keyProp]
     * - string: 用于非 $items 节点（无 item 可取），硬编码实体动作名
     *
     * @example
     * ```ts
     * // $items 场景: 从子组件动态取值
     * $items: { Button: { click: { entities: true } } }
     *   // 若 entityKey='users', item.name='Save' → entity:users:Save
     *
     * // 普通节点: 硬编码动作名
     * btn: { click: { entities: 'Save' } }
     *   // 若 entityKey='users' → entity:users:Save
     * ```
     */
    entities?: boolean | string;

    /**
     * 转发为路由事件（通过 RouteEventBus 解耦转发）
     *
     * 编码: route:{routeKey}:{routeName}
     * - true: 仅用于 $items 节点，routeName = item[keyProp]
     * - string: 用于非 $items 节点（无 item 可取），硬编码路由名
     *
     * @example
     * ```ts
     * nav: { click: { router: 'Settings' } }
     *   // 若 routeKey='main' → route:main:Settings
     * ```
     */
    router?: boolean | string;

    /** 转发为系统事件（通过 SystemEventBus 解耦转发） */
    system?: string | string[];

    /**
     * $items 专用：从 item 组件取此属性值作为 emit 名前缀
     *
     * 例：keyProp: 'name'，item.name = 'eye'，emits: ['ActionClick']
     * → emit 'eyeActionClick'
     */
    keyProp?: string;

    /**
     * 事件数据声明
     *
     * 支持两种形式：
     * 1. 数组 — 所有事件类型共享
     *    data: ['name', 'path', 'getFormData']
     *    - 'name'/'path' → 从 item 组件取属性值
     *    - 'getFormData' → 调用 instance.getFormData() 取返回值
     *
     * 2. 对象 — 按事件类型区分
     *    data: {
     *        emit: ['name'],
     *        entity: ['getEntityData', 'name'],
     *        router: ['path'],
     *    }
     */
    data?: string[] | Record<string, string[]>;

    /** handler 只执行一次 */
    once?: boolean;

    /** 防抖时间（毫秒） */
    debounce?: number;

    /** 节流时间（毫秒） */
    throttle?: number;
}

/**
 * ItemGroup 容器内子组件事件声明
 *
 * key = 子组件类型名（Button/Input/MenuItem 等），
 * value = 该类型子组件的事件声明。
 */
export interface ItemTypeEvents {
    [componentType: string]: Record<string, TplEventAction>;
}

/**
 * 节点级事件声明 — 三种形式
 *
 * 1. 字符串数组 — 纯声明，零绑定，冒泡给父
 *    btn: ['click']
 *
 * 2. 对象 — 需要内部处理的事件
 *    eye: { click: { handler: true } }
 *
 * 3. 含 $items 的对象 — 容器节点 + 子组件类型事件
 *    itemContainer: {
 *        scroll: { handler: true },
 *        $items: { Button: { click: { emits: ['itemClick'] } } }
 *    }
 */
export type NodeEventDecl =
    | string[]
    | (Record<string, TplEventAction> & { $items?: ItemTypeEvents });

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
 * 编译时从两个来源生成 DelegatedEventRule[]：
 *   1. TplNode.emits/action/data（新方案，节点级声明）
 *   2. TplEvents（旧方案，组件级声明，仍支持）
 *
 * 运行时匹配：
 *   新方案：从 event.target 向上遍历查找 NODE_EVENT_META
 *   旧方案：通过 containsElement + getTargetItem 匹配后分发
 *
 * 事件数据合成：
 *   defaultEventData(注册) + action(语义动作) + data(额外字段) + itemPayload + extraData
 */
export interface DelegatedEventRule {
    /** 节点名 */
    nodeName: string;

    /** DOM 事件名 */
    event: string;

    /** 子组件类型名（$items 规则使用，如 "Button"） */
    itemType?: string;

    /** $items 专用：从 item 组件取此属性值作为 emit 名前缀 */
    keyProp?: string;

    /**
     * 语义动作名 — 从 TplNode.action 或 TplEventAction.action 继承
     *
     * 节点声明的 action 字段自动合并到事件数据中，
     * 用于 entity/route 等语义化事件的标识。
     */
    action?: string;

    /**
     * 事件数据声明 — 从 TplNode.data（新方案）或 TplEventAction.data（旧方案）继承
     *
     * 支持两种形式：
     *   1. 数组 — 所有事件类型共享
     *      data: ['name', 'getFormData']
     *   2. 对象 — 按事件类型区分
     *      data: { emit: ['name'], entity: ['getEntityData'] }
     */
    data?: string[] | Record<string, string[]>;

    /** 内部 handler 方法名（已解析） */
    handler?: string;

    /** 转发为组件事件 */
    emits?: string[];

    /** 转发为桥接事件 */
    bridges?: string[];

    /**
     * 转发为实体操作
     * - true: $items 节点专用，entityName = item[keyProp]
     * - string: 非 $items 节点，硬编码实体动作名
     */
    entities?: boolean | string;

    /**
     * 转发为路由事件
     * - true: $items 节点专用，routeName = item[keyProp]
     * - string: 非 $items 节点，硬编码路由名
     */
    router?: boolean | string;

    /** 转发为系统事件 */
    system?: string[];

    /** 只执行一次 */
    once?: boolean;

    /** 防抖时间 */
    debounce?: number;

    /** 节流时间 */
    throttle?: number;

    /** 是否需要内部绑定（有 handler/emits/bridges/entities/router/system） */
    needsBinding: boolean;
}
