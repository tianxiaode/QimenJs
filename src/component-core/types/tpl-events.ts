/**
 * TplEvents 类型定义 — 统一事件委托声明
 *
 * 与 tpl/body 同级定义，所有 DOM 事件统一委托到组件根 el，
 * 通过 containsElement 匹配分发，$items 规则通过 getTargetItem 定位 item。
 *
 * ══════════════════════════════════════════════════════════════
 * 声明格式
 * ══════════════════════════════════════════════════════════════
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
 * - 普通节点：containsElement(nodeName, target) 判断 target 所属
 * - $items 节点：containsElement 判断容器 → getTargetItem 定位 item → itemType 匹配
 * - 数据合并：itemPayload → data 声明提取 → getEventData 兜底
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
     * - true: 配合 keyProp，运行时从 item 取 keyProp 值作为方法名
     * - string: 显式指定 mgr 方法名
     */
    entities?: boolean | string;

    /** 转发为路由事件（通过 RouteEventBus 解耦转发） */
    router?: string;

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
 * 编译时将 TplEvents 展开为 DelegatedEventRule[]，
 * 运行时通过 containsElement + getTargetItem 匹配后分发。
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

    /** 事件数据声明 */
    data?: string[] | Record<string, string[]>;

    /** 内部 handler 方法名（已解析） */
    handler?: string;

    /** 转发为组件事件 */
    emits?: string[];

    /** 转发为桥接事件 */
    bridges?: string[];

    /** 转发为实体操作 */
    entities?: boolean | string;

    /** 转发为路由事件 */
    router?: string;

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
