/**
 * template-types.ts — 新模板定义类型
 *
 * 组件模板的完整定义结构，包含 tpl（DOM/组件树）和 body（属性/方法）。
 *
 * 核心设计：
 * - tpl 是根节点定义，包含 tag 或 type，以及 children
 * - tag 和 type 互斥：tag 是 DOM 节点，type 是组件
 * - events 统一声明 DOM 事件，聚合 handler/emits/bridges 三种用途
 * - body 复制到组件实例，提供属性和方法
 *
 * @example
 * ```ts
 * const ButtonTemplate: ComponentTemplate = {
 *     tpl: {
 *         tag: 'div',
 *         className: 'q-button',
 *         children: [
 *             { tag: 'span', name: 'icon', content: 'icon', className: 'q-button__icon' },
 *             { tag: 'span', name: 'text', content: 'text', className: 'q-button__text' },
 *         ]
 *     },
 *     body: {
 *         type: 'button',
 *     }
 * };
 * ```
 */

/**
 * 单个 DOM 事件声明
 *
 * 聚合一个 DOM 事件的所有用途：
 * - handler: 内部处理方法（自动推导或显式指定）
 * - emits: 转发为组件事件（持有方通过 component.on 监听）
 * - bridges: 转发为桥接事件（通过 EventBridge 解耦转发）
 *
 * @example
 * ```ts
 * events: {
 *     click: { emits: ['click'], bridges: ['click'] },
 *     input: { handler: 'onSearch', debounce: 300, emits: ['input'] },
 *     close: { handler: true, once: true },
 * }
 * ```
 */
export interface DomEventDecl {
    /**
     * 内部 handler 方法
     *
     * - true: 自动推导（click → onClick）
     * - string: 显式指定方法名（如 'onSearch'）
     * - 省略/undefined: 不需要内部 handler
     */
    handler?: boolean | string;

    /**
     * 转发为组件事件列表
     *
     * 每项为转发后的事件名，持有方通过 component.on(name, fn) 监听。
     * - 'click' → 同名转发
     * - 'close' → 重命名转发（如 DOM 的 click 转发为 close 事件）
     */
    emits?: string[];

    /**
     * 转发为桥接事件列表
     *
     * 每项为桥接后的事件名，通过 EventBridge.bridgeEmit(eventKey, name, data) 转发。
     * - 'click' → 同名桥接
     * - 'save' → 重命名桥接
     */
    bridges?: string[];

    /** 是否只触发一次 */
    once?: boolean;

    /** 防抖时间（毫秒） */
    debounce?: number;

    /** 节流时间（毫秒） */
    throttle?: number;

    /** 是否事件委托 */
    delegate?: boolean;

    /** 事件委托目标选择器 */
    delegateTarget?: string;
}

/**
 * 模板节点定义
 *
 * tag 和 type 互斥：
 * - tag: DOM 节点
 * - type: 组件
 */
export interface TplNode {
    // ─── 节点类型（互斥） ───

    /** DOM 标签名（如 div、span、input），与 type 互斥 */
    tag?: string;

    /** 组件类型名（如 ButtonComponent），与 tag 互斥 */
    type?: string;

    // ─── 节点标识 ───

    /**
     * 节点名称 — 作为 nodeMap 索引键
     *
     * 缺省时用 content 兜底。
     * 多区域组件用冒号语法：name: 'dialog:header'
     */
    name?: string;

    /**
     * 内容语义描述 — 决定属性对接方式
     *
     * - 'title' / 'text' / 'icon' 等语义标识
     * - 也用于推导内容操作模式（html/value/src）
     * - 当 name 缺省时，content 同时作为 nodeMap 索引键
     */
    content?: string;

    // ─── 事件 ───

    /**
     * DOM 事件声明 — 聚合 handler/emits/bridges
     *
     * key 为 DOM 事件名（如 click、input），value 为事件声明对象。
     * 同一 DOM 事件只绑定一次 this.bind()，在回调中统一处理所有转发。
     *
     * @example
     * ```ts
     * events: {
     *     click: { emits: ['click'], bridges: ['click'] },
     *     input: { handler: 'onSearch', debounce: 300, emits: ['input'] },
     *     close: { handler: true, once: true },
     * }
     * ```
     */
    events?: Record<string, DomEventDecl>;

    // ─── 样式 ───

    /** CSS 类名 */
    className?: string;

    /** 内联样式（字符串或对象） */
    style?: string | Record<string, any>;

    // ─── 子节点 ───

    /** 子节点定义 */
    children?: TplNode[];

    // ─── 组件专属 ───

    /** 组件挂载模式：true=替换模式，false=挂载模式（默认） */
    replace?: boolean;

    /** 传递给子组件的静态属性 */
    props?: Record<string, any>;

    // ─── 其他 ───

    /** i18n 翻译 key */
    i18n?: string;

    /** 初始隐藏状态 */
    hidden?: boolean;

    /** 文本内容 */
    text?: string;

    /** 其他 HTML 属性 */
    attrs?: Record<string, string>;
}

/**
 * 组件模板完整定义
 *
 * @example
 * ```ts
 * const ButtonTemplate: ComponentTemplate = {
 *     tpl: {
 *         tag: 'div',
 *         className: 'q-button',
 *         children: [
 *             { tag: 'span', name: 'icon', content: 'icon' },
 *             { tag: 'span', name: 'text', content: 'text' },
 *         ]
 *     },
 *     body: {
 *         type: 'button',
 *         onClick(e) { this.pressed = true },
 *     }
 * };
 * ```
 */
export interface ComponentTemplate {
    /** 模板根节点定义 */
    tpl: TplNode;

    /** 复制到组件实例的属性和方法 */
    body?: Record<string, any>;
}

// ─── 内容节点信息 ──────────────────────────────────────────

/**
 * 内容节点信息 — 编译时收集，运行时直接遍历
 *
 * 只收集有 content 语义的节点（text/title/icon 等），
 * 运行时无需遍历整个 nodeMap 再 if 过滤。
 *
 * 刷新逻辑：
 * - i18nKey 有值 → 翻译后写入
 * - i18nKey 无值 → 直接赋值（由 getter/setter 处理）
 */
export interface ContentInfo {
    /** nodeMap 索引 — group */
    group: string;
    /** nodeMap 索引 — name */
    name: string;
    /** 内容操作模式 */
    mode: 'value' | 'src' | 'html';
    /** i18n 翻译 key，有值时需要翻译 */
    i18nKey?: string;
    /** 对应的属性名（如 'text'、'icon'、'dialogTitle'） */
    propName: string;
}
