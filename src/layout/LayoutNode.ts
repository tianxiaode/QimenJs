/**
 * LayoutNode 类型定义
 *
 * Layout 节点描述组件类型、子节点、事件处理器、附加函数等，
 * 是渲染的核心数据结构。
 */

/**
 * 结构化事件动作定义
 *
 * 可序列化、可存储、可传输，支持 close/submit/reset/navigate/toggle/emit/custom 等内置动作类型
 */
export interface HandlerAction {
    /** 动作类型 */
    action: 'close' | 'open' | 'submit' | 'reset' | 'toggle' | 'show' | 'hide' | 'navigate' | 'emit' | 'custom';
    /** 动作目标（组件 id） */
    target?: string;
    /** 动作参数 */
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
export interface LayoutNode extends PositionProps {
    /** 组件类型（对应 ComponentRegistrar 中注册的 type） */
    type: string;

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
     * - 字符串：对应 extraFns 中的方法名或 HandlerAction
     * - HandlerAction：声明式动作（close/submit/navigate 等）
     * - 函数：直接处理
     */
    handlers?: Record<string, string | HandlerAction | ((...args: any[]) => any) | (string | HandlerAction | ((...args: any[]) => any))[]>;

    /**
     * 附加函数：bind this 后挂到组件实例
     *
     * 渲染时每个函数 bind(component) 后通过 Object.defineProperty 注入实例，
     * 可在 handlers 中通过方法名引用。
     */
    extraFns?: Record<string, (...args: any[]) => any>;

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
}
