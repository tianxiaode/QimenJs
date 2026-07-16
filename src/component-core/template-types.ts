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
 * 层次化 content 结构（v2）：
 * - props: 组件自身 HTML 元素的配置（壳）
 * - content: 组件内部子节点的配置（瓤），每个子节点拥有独立的属性命名空间
 * - 递归渲染时，每层把自己的 content 对应部分传给子节点构造器
 * - 不需要透传，不需要 Ability 搬运纯赋值属性
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
     * content 值作为 propName 和 nodeMap 索引键。
     * 如果子组件有 expose 声明，编译时自动生成便捷方法：
     * - 子组件 expose: { class: 'iconClass', size: 'size' }
     * - content:'icon' → setIconClass(v) / setIconSize(v)
     * - content:'leftIcon' → setLeftIconClass(v) / setLeftIconSize(v)
     *
     * 无 expose 的子组件只生成主属性 getter/setter。
     *
     * 当 name 缺省时，content 同时作为 nodeMap 索引键
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

    // ─── 布局 ───

    /**
     * 布局模式 — 编译时生成内联 flex 样式，不需要写 CSS
     *
     * - 'hbox': 水平布局（flex-direction: row）
     * - 'vbox': 垂直布局（flex-direction: column）
     * - 'fit': 自适应填充
     * - 'grid': 网格布局（flex-wrap: wrap）
     * - 'center': 居中布局
     */
    layout?: 'hbox' | 'vbox' | 'fit' | 'grid' | 'center';

    /** 布局间距 — 数字自动加 px，字符串原样使用 */
    gap?: number | string;

    /** 交叉轴对齐 — 'start' | 'center' | 'end' | 'stretch' */
    align?: 'start' | 'center' | 'end' | 'stretch';

    /** 主轴分布 — 'start' | 'center' | 'end' | 'between' | 'around' */
    pack?: 'start' | 'center' | 'end' | 'between' | 'around';

    /** 是否换行 */
    wrap?: boolean;

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
 * v2 模式：
 * - tpl 定义 DOM 骨架（子节点通过 name 标识）
 * - props 定义组件自身配置（壳）
 * - body 定义组件行为/方法
 * - childProps 不在组件定义时写，由使用方通过 props.childProps 传入
 * - 递归结构：{ props, body, childProps } 每层都有，天然递归
 *
 * @example
 * ```ts
 * // 组件定义
 * const ButtonTemplate: ComponentTemplate = {
 *     tpl: {
 *         tag: 'div',
 *         className: 'q-button',
 *         children: [
 *             { name: 'icon', type: IconComponent, className: 'q-button__icon' },
 *             { tag: 'span', name: 'text', className: 'q-button__text' },
 *         ]
 *     },
 *     props: { size: 'md', disabled: false },
 *     body: { type: 'button' },
 * };
 *
 * // 使用方传 childProps
 * { type: ButtonComponent, props: {
 *     childProps: {
 *         icon: { props: { className: 'fa-bars' } },
 *         text: { props: { innerHTML: '保存' } },
 *     }
 * } }
 * ```
 */
export interface ComponentTemplate {
    /** 模板根节点定义（DOM 骨架） */
    tpl: TplNode;

    /** 组件自身 HTML 元素的配置（壳），v2 新增 */
    props?: PropsDef;

    /**
     * 复制到组件实例的属性和方法
     *
     * 特殊 key 处理：
     * - type: 设为静态属性（组件类型标识）
     * - bridges: 映射为 eventBridge 静态属性（桥接事件配置）
     * - 函数: 复制到原型（组件方法）
     * - 其他: 存到 static defaults（默认属性值）
     *
     * @example
     * ```ts
     * body: {
     *     type: 'myComponent',
     *     bridges: {
     *         pagination: 'myPager',
     *         crud: { source: 'myGrid', actions: ['create', 'delete'] },
     *     },
     *     onPageChange(e) { ... },
     *     onCreate(e) { ... },
     * }
     * ```
     */
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
    /** 对应的属性名（如 'icon'、'text'、'dropIcon'） */
    propName: string;
    /** 是否为组件节点（type 节点），为 true 时 getter/setter 操作 component */
    isComponent?: boolean;
    /** 子组件主属性名（仅 isComponent 时有效） */
    componentPropName?: string;
    /**
     * 子组件的 expose 列表 — content 名列表（如 ['content']）
     *
     * 运行时按规则自动生成 getter/setter：
     * - 默认属性：{propName}ClassName / {propName}Style / {propName}Size
     * - content 透传：{propName}{ContentName}ClassName / Style / Size
     *
     * 后缀和 DOM/组件属性名一致，零映射：
     * - ClassName → component.el.className
     * - Style → component.el.style
     * - Size → component.size
     *
     * 例如 Icon._expose = ['content']，Button content:'icon'：
     * - iconClassName → component.el.className = v
     * - iconStyle → component.el.style = v
     * - iconSize → component.size = v
     * - iconContentClassName → component.content.el.className = v
     * - iconContentStyle → component.content.el.style = v
     * - iconContentSize → component.content.size = v
     */
    expose?: string[];
}

// ─── 层次化 content 结构（v2）──────────────────────────────────

/**
 * 子节点 content 定义
 *
 * 每个子节点拥有独立的属性命名空间：
 * - props: 子节点自身 HTML 元素的配置
 * - content: 子节点的子节点配置（递归）
 *
 * 递归渲染时，每层把自己的 content 对应部分传给子节点构造器，
 * 不需要透传，不需要 Ability 搬运纯赋值属性。
 */
export interface ContentNodeDef {
    /** 子节点类型（组件类引用或组件类型字符串） */
    type?: string | (new (props?: any) => any);
    /** 子节点自身 HTML 元素的配置（壳） */
    props?: Record<string, any>;
    /** 子节点的子节点配置（瓤），递归结构 */
    content?: Record<string, ContentNodeDef>;
    /** DOM 事件声明 */
    events?: Record<string, DomEventDecl>;
    /** 初始隐藏状态 */
    hidden?: boolean;
    /** i18n 翻译 key */
    i18n?: string;
}

/**
 * 组件 content 定义
 *
 * key 是子节点名（如 icon、text、dropIcon），
 * value 是子节点的完整配置（props + content 递归）。
 *
 * @example
 * ```ts
 * content: {
 *     icon: { type: IconComponent, props: { className: 'q-button__icon' }, content: { content: { className: 'q-icon save' } } },
 *     text: { props: { className: 'q-button__text' } },
 *     dropIcon: { type: IconComponent, props: { className: 'q-expand-arrow', hidden: true }, content: { content: { className: 'q-icon arrow-down' } } },
 * }
 * ```
 */
export type ContentDef = Record<string, ContentNodeDef>;

/**
 * 组件 props 定义
 *
 * 组件自身 HTML 元素的配置，纯数据，编译期直接赋值。
 * 不需要 Ability 搬运，不需要透传。
 *
 * @example
 * ```ts
 * props: {
 *     size: 'md',        // 枚举规格档位
 *     disabled: false,    // 布尔状态
 *     width: undefined,   // 精确尺寸，不设则由 size 决定
 *     height: undefined,
 * }
 * ```
 */
export interface PropsDef {
    /** 规格档位：sm / md / lg */
    size?: 'sm' | 'md' | 'lg';
    /** 禁用状态 */
    disabled?: boolean;
    /** 精确宽度，有值时覆盖 size 的默认尺寸 */
    width?: number | string;
    /** 精确高度，有值时覆盖 size 的默认尺寸 */
    height?: number | string;
    /** 是否可见（有行为，保留为能力） */
    visible?: boolean;
    /** CSS 类名 */
    className?: string;
    /** 内联样式 */
    style?: string | Record<string, any>;

    /** 其他自定义属性 */
    [key: string]: any;
}
