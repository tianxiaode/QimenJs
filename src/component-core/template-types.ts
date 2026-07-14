/**
 * template-types.ts — 新模板定义类型
 *
 * 组件模板的完整定义结构，包含 tpl（DOM/组件树）和 body（属性/方法）。
 *
 * 核心设计：
 * - tpl 是根节点定义，包含 tag 或 type，以及 children
 * - tag 和 type 互斥：tag 是 DOM 节点，type 是组件
 * - events/forwards/bridges 三类事件各司其职
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
 * 事件声明语法
 *
 * - 'click' — 事件源名
 * - 'click=close' — 源事件 click，映射为目标事件 close
 * - 'click?once' — 只触发一次
 * - 'click=close?once' — 映射 + 只触发一次
 */
export type EventDecl = string;

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

    // ─── 三类事件 ───

    /**
     * 内部事件 — 触发组件自身 handler
     *
     * handler 名自动推导：'click' → onClick
     * 支持 before/after 钩子：beforeClick / afterClick
     */
    events?: EventDecl[];

    /**
     * 转发事件 — 通过 eventScope 转发给持有方
     *
     * 'click' → 同名转发，持有方通过 component.on('click', fn) 监听
     * 'click=close' → 重命名转发，持有方通过 component.on('close', fn) 监听
     * 'click=save' → 重命名转发，将 click 转发为 save 事件
     */
    forwards?: EventDecl[];

    /**
     * 桥接事件 — 通过 EventBridge 解耦转发
     *
     * 'click' → 同名桥接，EventBridge.bridgeEmit(eventKey, 'click', data)
     * 'click=click:save' → 带命名空间桥接，EventBridge.bridgeEmit(eventKey, 'click:save', data)
     * 'click=save' → 重命名桥接，EventBridge.bridgeEmit(eventKey, 'save', data)
     */
    bridges?: EventDecl[];

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
