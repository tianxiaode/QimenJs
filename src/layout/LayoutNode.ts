/**
 * LayoutNode 类型定义
 *
 * Layout 节点描述组件类型、子节点、事件处理器、附加函数等，
 * 是渲染的核心数据结构。
 */

/**
 * 事件处理器配置
 *
 * 当 handler 需要附加选项（如 once、params）时使用。
 * handler 字段指向实际处理方式：字符串为 extraFns 中的方法名，函数为直接处理。
 *
 * @example
 * ```js
 * // 简单模式：直接字符串或函数
 * handlers: { click: 'onSubmit' }
 * handlers: { click: () => this.emit('submit') }
 *
 * // 配置模式：需要 once 或 params
 * handlers: { click: { handler: 'onSubmit', once: true } }
 * handlers: { change: { handler: 'onSearch', params: { debounce: 300 } } }
 * ```
 */
export interface HandlerConfig {
    /** 处理方式：字符串为 extraFns 中的方法名，函数为直接处理 */
    handler: string | ((...args: any[]) => any);
    /** 是否只执行一次，执行后自动解绑 */
    once?: boolean;
    /** 附加参数，传递给处理函数 */
    params?: Record<string, any>;
}

/**
 * stateTriggers 声明式事件绑定
 *
 * 接收方声明监听哪些事件源的哪些事件类型，框架自动绑定到 EventBus
 */
export interface StateTrigger {
    /** 监听的事件源（组件 id），不填则监听全局事件总线 */
    source?: string;
    /** 事件到 handler 的映射，key 为事件类型，value 为方法名 */
    events: Record<string, string>;
    /** 是否只执行一次 */
    once?: boolean;
}

/**
 * 翻译表达式
 *
 * Layout 定义中的翻译表达式，格式为 { "$t": "key" }
 */
export interface TranslationExpr {
    /** 翻译 key */
    $t: string;
    /** 翻译参数 */
    params?: Record<string, any>;
    /** 格式化类型 */
    format?: 'date' | 'time' | 'number' | 'currency';
    /** 格式化样式 */
    formatStyle?: string;
}

/**
 * 循环渲染配置
 */
export interface RepeatConfig {
    /** 数据源标识 */
    source: string;
    /** 循环变量名，默认为 'item' */
    itemVar?: string;
    /** 索引变量名，默认为 'index' */
    indexVar?: string;
}

/**
 * 响应式配置
 */
export interface ResponsiveConfig {
    sm?: Partial<LayoutNode>;
    md?: Partial<LayoutNode>;
    lg?: Partial<LayoutNode>;
}

/**
 * Layout 元数据定义
 *
 * meta 是纯数据容器，复制到组件实例后通过 this.meta.xxx 访问。
 * 不包含 abilities，abilities 是独立字段，展开后逐个注入组件实例。
 *
 * @example
 * ```js
 * {
 *     type: ComponentTypes.TOOLBAR,
 *     abilities: [CrudAbility, PaginationAbility],
 *     meta: {
 *         customTitle: '我的工具栏',
 *     }
 * }
 * // 组件中：this.meta.customTitle
 * ```
 */
export interface LayoutMeta {
    /** 自定义属性 */
    [key: string]: any;
}

/**
 * 样式属性
 *
 * 对应 StyleAbility 的声明式配置，渲染时由 add() 提取并赋给组件的 StyleAbility setter。
 * 所有属性都是可选的，只传需要设置的。
 */
export interface StyleProps {
    /** CSS 类名，支持 AtomicCSS 原子类（如 'q-flex q-items-center'） */
    className?: string;
    /** 内联样式对象，如 { fontSize: '16px', color: 'red' } */
    style?: Record<string, string> | string;
}

/**
 * 可访问性属性
 *
 * 对应 ARIA 无障碍属性，渲染时由 add() 提取并设置到 DOM 元素。
 * 所有属性都是可选的，只传需要设置的。
 */
export interface AccessibilityProps {
    /** ARIA 角色，如 'button'、'navigation'、'toolbar'、'grid' */
    role?: string;
    /** ARIA 标签文本，用于无障碍读屏 */
    ariaLabel?: string;
    /** ARIA 描述 ID 列表，引用描述元素的 id */
    ariaDescribedBy?: string;
    /** ARIA 标签 ID 列表，引用标签元素的 id */
    ariaLabelledBy?: string;
    /** ARIA 隐藏，true 时对读屏软件不可见 */
    ariaHidden?: boolean;
    /** ARIA 禁用状态 */
    ariaDisabled?: boolean;
    /** ARIA 展开/折叠状态 */
    ariaExpanded?: boolean;
    /** ARIA 选中状态 */
    ariaSelected?: boolean;
    /** ARIA 按下状态 */
    ariaPressed?: boolean;
    /** ARIA 必填状态 */
    ariaRequired?: boolean;
    /** ARIA 无效状态 */
    ariaInvalid?: boolean;
    /** ARIA 活动区域类型，如 'polite'、'assertive' */
    ariaLive?: 'off' | 'polite' | 'assertive';
    /** ARIA 控制元素 ID 列表 */
    ariaControls?: string;
    /** ARIA 拥有元素 ID 列表 */
    ariaOwns?: string;
    /** ARIA 弹出类型，如 'true'、'dialog'、'menu'、'listbox' */
    ariaHasPopup?: 'true' | 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid' | 'false';
    /** ARIA 当前项类型，如 'page'、'step'、'true' */
    ariaCurrent?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
    /** ARIA 层级（用于树形/标题等） */
    ariaLevel?: number;
    /** ARIA 值文本 */
    ariaValueText?: string;
    /** ARIA 值最小值 */
    ariaValueMin?: number;
    /** ARIA 值最大值 */
    ariaValueMax?: number;
    /** ARIA 值当前值 */
    ariaValueNow?: number;
    /** ARIA 模态状态 */
    ariaModal?: boolean;
    /** ARIA 只读状态 */
    ariaReadOnly?: boolean;
    /** ARIA 自动补全类型 */
    ariaAutoComplete?: 'inline' | 'list' | 'both' | 'none';
    /** ARIA 错误消息 ID */
    ariaErrorMessage?: string;
    /** ARIA 行数（用于 grid/table） */
    ariaRowCount?: number;
    /** ARIA 列数（用于 grid/table） */
    ariaColCount?: number;
    /** ARIA 行索引 */
    ariaRowIndex?: number;
    /** ARIA 列索引 */
    ariaColIndex?: number;
    /** ARIA 行跨度 */
    ariaRowSpan?: number;
    /** ARIA 列跨度 */
    ariaColSpan?: number;
    /** ARIA 集合中总项数 */
    ariaSetSize?: number;
    /** ARIA 在集合中的位置 */
    ariaPosInSet?: number;
}

/**
 * 实体管理配置
 *
 * Layout 中直接传入 EntityManager 派生类，初始化时 new 创建实例。
 * Manager 自身已包含 domain/schema/type 等全部配置。
 *
 * Manager 类型对应 managers.ts 中的 5 种派生类：
 * - LocalReadonlyEntityManager：本地只读（list/get/refresh/filter/sort）
 * - LocalCrudEntityManager：本地 CRUD（+ create/update/delete/save/toggle）
 * - RemoteReadonlyEntityManager：远程只读（+ 分页导航 prev/next/jump/changeSize）
 * - RemoteCrudEntityManager：远程 CRUD（+ create/update/delete/toggle）
 * - RemoteTreeEntityManager：远程树形（+ expand/collapse/move/getSubTree）
 *
 * @example
 * ```js
 * import { RemoteCrudEntityManager } from '@qimenjs/entity';
 *
 * class UserManager extends RemoteCrudEntityManager {
 *     entityName = 'User';
 *     url = '/api/users';
 *     schema = { ... };
 * }
 *
 * {
 *     type: ComponentTypes.TABLE,
 *     entity: UserManager,                // 类引用：直接 new UserManager()
 * }
 * ```
 */
export interface EntityProps {
    /**
     * 实体管理器类引用
     *
     * 直接传入 managers.ts 中的派生类（LocalReadonlyEntityManager /
     * LocalCrudEntityManager / RemoteReadonlyEntityManager /
     * RemoteCrudEntityManager / RemoteTreeEntityManager 的子类），
     * 初始化时 new 创建实例。
     */
    entity?: new (...args: any[]) => any;
}

/**
 * 生命周期钩子
 *
 * 在 Layout 定义中声明式注册生命周期回调，渲染时 bind(component) 后注入。
 * 与 extraFns 类似，但钩子函数在特定生命周期节点自动调用。
 */
export interface LifecycleHooks {
    /** 组件挂载后回调（mount 完成后） */
    onMounted?: (...args: any[]) => any;
    /** 组件卸载前回调（unmount 前调用） */
    onBeforeUnmount?: (...args: any[]) => any;
    /** 组件销毁前回调（dispose 前调用） */
    onBeforeDispose?: (...args: any[]) => any;
    /** 组件销毁后回调（dispose 后调用） */
    onDisposed?: (...args: any[]) => any;
    /** 组件更新回调（update 后调用） */
    onUpdated?: (...args: any[]) => any;
}

/**
 * Tooltip 提示框配置
 *
 * 配合 ContentAbility 的 tips 浮层前缀使用，
 * 渲染时由 add() 提取并赋给组件的浮层管理器。
 */
export interface TooltipProps {
    /** 提示文本内容，支持 i18n 前缀（如 'i18n:tooltip.save'） */
    tooltip?: string;
    /** 提示框弹出方向，默认 'top' */
    tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
    /** 提示框与锚点的间距（px），默认 4 */
    tooltipOffset?: number;
    /** 提示框延迟显示时间（毫秒），默认 0 */
    tooltipShowDelay?: number;
    /** 提示框延迟隐藏时间（毫秒），默认 0 */
    tooltipHideDelay?: number;
    /** 提示框最大宽度（px） */
    tooltipMaxWidth?: number;
    /** 提示框组件类型名（对应 ComponentRegistrar 中注册的 type），默认 'Tips' */
    tooltipType?: string;
}

/**
 * 动画配置
 *
 * 对应 AnimationAbility 的声明式配置，渲染时由 add() 提取并赋给组件的 AnimationAbility。
 */
export interface AnimationProps {
    /** 进入动画名称（CSS @keyframes 名称） */
    enterAnimation?: string;
    /** 进入动画选项 */
    enterAnimationOptions?: {
        /** 动画时长（毫秒），默认 250 */
        duration?: number;
        /** 缓动函数，默认 'ease' */
        easing?: string;
        /** 填充模式，默认 'forwards' */
        fill?: 'none' | 'forwards' | 'backwards' | 'both' | 'auto';
    };
    /** 离开动画名称（CSS @keyframes 名称） */
    leaveAnimation?: string;
    /** 离开动画选项 */
    leaveAnimationOptions?: {
        /** 动画时长（毫秒），默认 250 */
        duration?: number;
        /** 缓动函数，默认 'ease' */
        easing?: string;
        /** 填充模式，默认 'forwards' */
        fill?: 'none' | 'forwards' | 'backwards' | 'both' | 'auto';
    };
    /** 是否启用动画，默认 true */
    animationEnabled?: boolean;
}

/**
 * 权限控制配置
 *
 * 配合权限注册表使用。组件声明所需权限码，
 * 权限能力监听权限更新事件，根据权限状态控制组件的可见性/可用性。
 *
 * 权限控制流程：
 * 1. 初始状态：权限注册表为空，按 defaultBehavior 决定组件行为
 * 2. 权限拉取完成：存入权限注册表，发出 'permission:change' 事件
 * 3. 权限能力监听事件，根据权限码匹配结果控制组件
 *
 * @example
 * ```js
 * const sys = createDomainPermissions('system');
 *
 * {
 *     type: ComponentTypes.BUTTON,
 *     permission: {
 *         code: sys('user:delete'),      // → ['system:user:delete']
 *         behavior: 'disable',           // 无权限时禁用
 *     }
 * }
 * {
 *     type: ComponentTypes.BUTTON,
 *     permission: {
 *         code: sys('admin:settings'),
 *         behavior: 'hidden',            // 无权限时隐藏
 *     }
 * }
 * {
 *     type: ComponentTypes.MENU_ITEM,
 *     permission: {
 *         code: sys('report:export'),
 *         behavior: 'removed',           // 无权限时从 DOM 移除
 *     }
 * }
 * ```
 */
export interface PermissionProps {
    /** 权限配置 */
    permission?: {
        /** 权限码数组，配合 createDomainPermissions 工厂函数使用 */
        code: string[];
        /** 权限匹配模式：all 需要全部满足，any 满足任一即可，默认 'any' */
        matchMode?: 'all' | 'any';
        /** 无权限时的行为，默认 'disable' */
        behavior?: 'disable' | 'hidden' | 'removed';
        /** 权限未加载时的默认行为，默认 'visible'（先显示，权限到了再控制） */
        defaultBehavior?: 'visible' | 'disable' | 'hidden' | 'removed';
        /** 无权限时的提示文本（behavior 为 disable 时可选） */
        noPermissionTip?: string;
        /** 权限变更时的自定义回调，返回 false 阻止默认行为 */
        onPermissionChange?: (hasPermission: boolean) => boolean | void;
    };
}

/**
 * 位置/尺寸/布局约束属性
 *
 * 这些属性直接定义在 LayoutNode 顶层，渲染时由 add() 提取并赋给组件的 PositionAbility setter。
 * 所有属性都是可选的，只传需要设置的。
 */
export interface PositionProps {
    // ── 定位 ──
    x?: number;
    y?: number;
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;

    // ── 尺寸 ──
    width?: number;
    height?: number;

    // ── 约束 ──
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;

    // ── 间距 ──
    margin?: string;
    padding?: string;

    // ── 滚动 ──
    scrollable?: boolean;

    // ── 居中 ──
    center?: boolean;

    // ── 隐藏模式 ──
    hideMode?: 'display' | 'visibility' | 'opacity';

    // ── 层叠与全屏 ──
    alwaysOnTop?: boolean;
    fullscreen?: boolean;

    // ── 视觉 ──
    shadow?: string;

    // ── 焦点 ──
    focused?: boolean;

    // ── 其他 ──
    tabIndex?: number;
    zIndex?: number;
}

/**
 * Layout 节点定义
 *
 * 描述组件类型、子节点、事件处理器、附加函数等，是渲染的核心数据结构。
 * 支持 ExtJS 风格 JS 对象字面量定义（主推）和纯 JSON 定义（补充）。
 *
 * 位置/尺寸等属性直接定义在顶层（PositionProps），渲染时按类型拆解赋给对应能力的 setter。
 *
 * @example
 * ```js
 * {
 *     type: ComponentTypes.BUTTON,
 *     x: 100, y: 50, width: 200,          // PositionProps 顶层
 *     handlers: { click: 'onSubmit' },     // 事件绑定
 *     extraFns: {                          // 附加函数，bind this 后挂到实例
 *         onSubmit() { this.emit('submit'); }
 *     },
 *     abilities: [CrudAbility],            // 附加能力，展开后注入实例
 *     meta: {                              // 纯数据，this.meta.xxx 访问
 *         customTitle: '提交',
 *     },
 *     children: [...]
 * }
 * ```
 */
export interface LayoutNode extends PositionProps, StyleProps, AccessibilityProps, EntityProps, TooltipProps, AnimationProps, PermissionProps {
    /** 组件类型（对应 ComponentRegistrar 中注册的 type） */
    type: string;

    /**
     * 模板ID — 指定组件使用的 HTML 模板
     *
     * 默认用 type 从 TemplateRegistrar 查找模板。
     * 当同一组件类型需要不同模板时（如 Input 有普通/搜索/密码等多种样式），
     * 通过 template 覆盖默认的 type 查找。
     *
     * @example
     * ```js
     * // 默认：用 type='Input' 查找模板
     * { type: ComponentTypes.INPUT }
     *
     * // 指定模板：用 template='InputSearch' 查找模板
     * { type: ComponentTypes.INPUT, template: 'InputSearch' }
     * ```
     */
    template?: string;

    /** 根元素标签名，覆盖组件类默认的 static tag */
    tag?: string;

    /** 开发者指定的业务标识（多重职责：查找/事件前缀/source/target） */
    id?: string;

    /** 绑定的 Schema 字段名 */
    field?: string;

    /** 子节点 */
    children?: LayoutNode[];

    /**
     * 附加能力数组，展开后逐个注入组件实例
     *
     * 和 ComposableBase.setupAbilityDefinition 相同的复制逻辑：
     * getter/setter → PropertyDescriptor，函数 → bind(this)，普通值 → 直接注入
     */
    abilities?: any[];

    /**
     * 事件处理器映射：绑定 DOM 事件
     *
     * key 为事件语义（GestureSemantic | InputSignal），value 为处理方式：
     * - 字符串：对应 extraFns 中的方法名
     * - 函数：直接处理
     * - HandlerConfig：带 once/params 等附加选项
     *
     * @example
     * ```js
     * handlers: { click: 'onSubmit' }                          // 简单模式
     * handlers: { click: () => this.emit('submit') }           // 函数模式
     * handlers: { click: { handler: 'onSubmit', once: true } } // 配置模式
     * ```
     */
    handlers?: Record<string, string | ((...args: any[]) => any) | HandlerConfig | (string | ((...args: any[]) => any) | HandlerConfig)[]>;

    /**
     * 事件桥接声明：声明哪些事件走事件桥发布
     *
     * bridges 中声明的事件，触发时自动通过 this.emit 发布到事件总线，
     * 其他组件可通过 eventBus.on 监听。
     *
     * 与 handlers 的区别：
     * - bridges：只声明发布，走事件桥，其他组件监听
     * - handlers：绑定具体函数，直接执行
     *
     * @example
     * ```js
     * bridges: ['saveBtn:click', 'cancelBtn:click']
     * ```
     */
    bridges?: string[];

    /**
     * 附加函数：bind this 后挂到组件实例
     *
     * 渲染时每个函数 bind(component) 后通过 Object.defineProperty 注入实例，
     * 可在 handlers 中通过方法名引用。
     */
    extraFns?: Record<string, (...args: any[]) => any>;

    /**
     * 生命周期钩子：在特定生命周期节点自动调用
     *
     * 渲染时每个函数 bind(component) 后注入，在对应生命周期节点自动触发。
     * 与 extraFns 类似，但钩子函数由框架在特定时机调用，而非手动调用。
     */
    lifecycle?: LifecycleHooks;

    /**
     * 元数据：纯数据容器
     *
     * 复制到组件实例后通过 this.meta.xxx 访问。
     * 不包含 abilities，abilities 是独立字段。
     */
    meta?: LayoutMeta;

    /** 条件渲染：boolean 或表达式字符串 */
    visible?: boolean | string;

    /** 循环渲染 */
    repeat?: RepeatConfig;

    /** 响应式配置 */
    responsive?: ResponsiveConfig;

    /** stateTriggers 声明式事件绑定 */
    stateTriggers?: StateTrigger[];

    /**
     * 剩余属性：非保留字、非已知 Props 的顶层属性
     *
     * 非 RESERVED_KEYS / KNOWN_PROP_KEYS 的顶层属性自动归集，渲染时作为组件 props 传入。
     */
    props?: Record<string, any>;
}
