/**
 * LayoutNode 类型定义
 *
 * Layout 节点描述组件类型、属性、子节点、事件处理器、条件渲染、循环渲染等，
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
 * meta 是一个扁平对象，在 JS 对象字面量 Layout 中声明额外的能力、方法和自定义数据。
 * 渲染时，框架用与 ComposableBase.setupAbilityDefinition 相同的逻辑将 meta 中的属性
 * 复制到组件实例上：
 * - abilities 数组：展开后逐个注入（getter/setter/方法/值）
 * - 函数：bind 到组件实例后注入
 * - getter/setter 对象：直接作为 PropertyDescriptor 注入
 * - 普通值：直接注入
 *
 * @example
 * ```js
 * {
 *     type: 'Toolbar',
 *     meta: {
 *         abilities: [CrudAbility, PaginationAbility],
 *         onEntityCreated(data) { this.mgr.reload(); },
 *         beforeList() { console.log('loading...'); },
 *         customTitle: '我的工具栏',
 *     }
 * }
 * ```
 */
export interface LayoutMeta {
    /** 额外能力数组，展开后逐个注入组件实例 */
    abilities?: any[];
    /** 其他自定义属性（方法、getter/setter、数据） */
    [key: string]: any;
}

/**
 * Layout 节点定义
 *
 * 描述组件类型、属性、子节点、事件处理器等，是渲染的核心数据结构。
 * 支持 ExtJS 风格 JS 对象字面量定义（主推）和纯 JSON 定义（补充）。
 */
export interface LayoutNode {
    /** 组件类型（对应 ComponentRegistrar 中注册的 type） */
    type: string;

    /** 开发者指定的业务标识（多重职责：查找/事件前缀/source/target） */
    id?: string;

    /** 绑定的 Schema 字段名 */
    field?: string;

    /** 组件属性 */
    props?: Record<string, any>;

    /** 子节点 */
    children?: LayoutNode[];

    /**
     * 元数据：额外能力、自定义方法和数据
     *
     * 渲染时自动注入到组件实例，无需定义派生类。
     * - abilities 数组展开后逐个注入
     * - 函数 bind 到组件实例后注入
     * - getter/setter 对象直接作为 PropertyDescriptor 注入
     * - 普通值直接注入
     */
    meta?: LayoutMeta;

    /** 事件处理器映射：字符串映射 / HandlerAction / 函数 / 混合数组 */
    handlers?: Record<string, string | HandlerAction | ((...args: any[]) => any) | (string | HandlerAction | ((...args: any[]) => any))[]>;

    /** 条件渲染：boolean 或表达式字符串 */
    visible?: boolean | string;

    /** 循环渲染 */
    repeat?: RepeatConfig;

    /** 布局插槽 */
    slots?: Record<string, LayoutNode | LayoutNode[]>;

    /** 响应式配置 */
    responsive?: ResponsiveConfig;

    /** stateTriggers 声明式事件绑定 */
    stateTriggers?: StateTrigger[];
}
