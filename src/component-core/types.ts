/**
 * 组件节点元数据类型
 *
 * 从 ComponentBase 拆分出来的类型定义，
 * 供 ComponentBase、NodeMapAbility、ElementEventAbility 等共享。
 */

/**
 * 内部事件绑定 — 事件直接绑定到组件方法
 *
 * 由 data-event="event" 解析生成，方法名从 data-content 自动推导。
 * 推导规则：单 group → onName（如 onField, onIcon），
 *          多 group → onGroupName（如 onDialogClose, onInputField）。
 */
export interface InternalEventBinding {
    /** DOM 事件类型（如 click, input, scroll） */
    event: string;
    /** 组件方法名（从 data-content 推导，如 onDialogClose, onField） */
    handler: string;
    /** 是否只触发一次 */
    once?: boolean;
    /** 是否事件委托 */
    delegate?: boolean;
    /** 事件委托目标选择器（由 data-target 声明） */
    delegateTarget?: string;
    /** 节点元数据引用 */
    node: NodeMetadata;
}

/**
 * 外部事件映射 — 事件发射给外部监听者
 *
 * 由 data-emit="event" 解析生成。
 * 触发时 this.emit('group:event', event)。
 * 与 EventBridge/handlers 结合，有定义就绑定，没有就不处理。
 *
 * key 为 emit 名（group:event），value 为对应的节点元数据。
 */
export type ExternalEventMap = Record<string, NodeMetadata>;

/**
 * 事件映射 — 内部事件 + 外部事件
 *
 * 由 buildNodeMap 在扫描模板时统一构建。
 */
export interface EventMap {
    /** 内部事件列表：事件绑定到组件方法 */
    internal: InternalEventBinding[];
    /** 外部事件映射：事件发射给外部监听者，key=emit名，value=节点 */
    external: ExternalEventMap;
}

/**
 * NodeMetadata — 模板节点元信息
 *
 * nodeMap 中每个条目存储节点的完整元数据，
 * 承载元素引用、附属声明等，各能力按需读取。
 *
 * 扩展方式：在 HTML 中通过 data-* 附属属性声明，buildNodeMap 统一收集。
 */
export interface NodeMetadata {
    /** DOM 元素引用 */
    el: HTMLElement;
    /** data-content 原始值（如 "input:field"） */
    raw: string;
    /** 解析后的分组/区域（冒号前缀，如 "input"） */
    group: string;
    /** 解析后的名称（冒号后缀，如 "field"） */
    name: string;
    /** 事件委托目标选择器（由 data-target 声明） */
    delegateTarget?: string;
    /** JSON 组件定义引用（由 data-json 声明） */
    jsonRef?: string;
    /** JSON 渲染模式（由 data-json-mode 声明） */
    jsonMode?: 'replace' | 'child';
    /** 嵌套模板引用（由 data-template 声明） */
    templateRef?: string;
    /** i18n 翻译 key（由 data-i18n 声明，如 "btn.save"） */
    i18nKey?: string;
    /**
     * 子组件类引用（由 data-json 声明，JSON 模式可直接传组件类）
     * 有值表示此节点是组件占位节点，而非普通 DOM 节点
     */
    componentClass?: new (props?: Record<string, any>) => any;
    /**
     * 子组件实例（渲染后填充）
     * 通过 node.component 访问子组件实例，调用子组件的方法和属性
     */
    component?: any;
    /**
     * DOM 位置索引 — 用于节点替换时定位
     *
     * replace 模式下记录占位节点的父元素和位置，
     * 当需要切换组件或 DOM 节点时，可销毁旧组件后在原位挂载新的。
     * child 模式下为 null（子组件挂载在占位节点内部，位置固定）。
     */
    parentNode?: HTMLElement | null;
    /** 在父元素子节点列表中的位置索引（replace 模式使用） */
    nodeIndex?: number;
}

/**
 * 节点位置索引 — 记录 data-content 节点在模板 DOM 树中的位置路径
 *
 * 第一次实例化时由 buildNodeMap 生成，存到类原型上共享。
 * 后续实例化用索引表 + el.children 直接定位节点，跳过 querySelectorAll。
 */
export type NodeIndexPath = Record<string, number[]>;

/**
 * 节点模板元数据 — 不含 el 引用的模板信息
 *
 * 第一次实例化时由 buildNodeMap 生成，存到类原型上共享。
 */
export interface NodeTemplateMeta {
    raw: string;
    group: string;
    name: string;
    delegateTarget?: string;
    jsonRef?: string;
    jsonMode?: 'replace' | 'child';
    templateRef?: string;
    /** 内容操作模式（从元素标签推导） */
    mode: 'value' | 'src' | 'html';
    /** 内部事件属性值（data-event 的原始值，如 "click?once"） */
    eventAttr?: string;
    /** 外部事件属性值（data-emit 的原始值，如 "click"） */
    emitAttr?: string;
    /** i18n 翻译 key（由 data-i18n 声明，如 "btn.save"） */
    i18nKey?: string;
    /** 初始隐藏状态（由 data-hidden 声明，运行时设置 el.hidden） */
    hidden?: boolean;
}
