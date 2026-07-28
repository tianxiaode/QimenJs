/**
 * common-props.ts — 节点属性映射表（类型 + 数据）
 *
 * NodePropDef / NodePropMap 是 _getNodeProp / _setNodeProp 的类型基础，
 * DEFAULT_NODE_PROP_MAP 是默认映射数据。
 *
 * 三种操作路径（由 NodePropDef 字段决定）：
 * - cssProp 有值 → el.style[cssProp]
 * - attr 有值   → el.setAttribute(attr) / el.getAttribute(attr)
 * - 其他        → el[domAttr]
 *
 * 值转换器见 utils/string/css.ts（resolvePx / resolveMarginPadding / resolveBorder）
 */

/**
 * 节点属性映射定义 — 纯数据，驱动 _getNodeProp / _setNodeProp
 *
 * 原型上的 getter/setter 极简转发，不生成复杂闭包：
 *   get() { return this._getNodeProp(nodeName, prop); }
 *   set(v) { this._setNodeProp(nodeName, prop, v); }
 */
export interface NodePropDef {
    /** DOM 属性名（如 className, hidden, innerHTML） */
    domAttr: string;
    /** CSS 属性名（如 width, height），有值时操作 el.style[cssProp] */
    cssProp?: string;
    /** HTML 属性名（如 aria-label, data-id），有值时走 setAttribute/getAttribute */
    attr?: string;
    /** 数字值是否自动加 px（如 width: 100 → '100px'） */
    autoPx?: boolean;
}

/**
 * 节点属性映射表 — key 为属性简称，value 为 DOM 操作映射
 *
 * 扩展属性只需在此表加条目，getter/setter 自动生成。
 */
export type NodePropMap = Record<string, NodePropDef>;

export const DEFAULT_NODE_PROP_MAP: NodePropMap = {
    cls: { domAttr: 'className' },
    style: { domAttr: 'style' },
    hidden: { domAttr: 'hidden' },
    text: { domAttr: 'textContent' },
    html: { domAttr: 'innerHTML' },
    value: { domAttr: 'value' },
    src: { domAttr: 'src' },
    href: { domAttr: 'href' },
    width: { domAttr: 'style', cssProp: 'width', autoPx: true },
    height: { domAttr: 'style', cssProp: 'height', autoPx: true },
    x: { domAttr: 'style', cssProp: 'left', autoPx: true },
    y: { domAttr: 'style', cssProp: 'top', autoPx: true },
    margin: { domAttr: 'style', cssProp: 'margin' },
    padding: { domAttr: 'style', cssProp: 'padding' },
    fontSize: { domAttr: 'style', cssProp: 'fontSize', autoPx: true },
    color: { domAttr: 'style', cssProp: 'color' },
    bg: { domAttr: 'style', cssProp: 'background' },
    cursor: { domAttr: 'style', cssProp: 'cursor' },
    border: { domAttr: 'style', cssProp: 'border' },
    disabled: { domAttr: 'disabled' },
    checked: { domAttr: 'checked' },
    placeholder: { domAttr: 'placeholder' },
    role: { domAttr: 'role', attr: 'role' },
    tabIndex: { domAttr: 'tabIndex', attr: 'tabindex' },
    ariaLabel: { domAttr: 'ariaLabel', attr: 'aria-label' },
    ariaChecked: { domAttr: 'ariaChecked', attr: 'aria-checked' },
    ariaDisabled: { domAttr: 'ariaDisabled', attr: 'aria-disabled' },
    ariaExpanded: { domAttr: 'ariaExpanded', attr: 'aria-expanded' },
    ariaSelected: { domAttr: 'ariaSelected', attr: 'aria-selected' },
    ariaHidden: { domAttr: 'ariaHidden', attr: 'aria-hidden' },
    hint: { domAttr: 'title', attr: 'title' },
}; /**
 * common-props 类型定义
 */

/**
 * 边距/内边距配置
 *
 * 支持分别设置四个方向的值，或使用 horizontal/vertical 批量设置。
 * 数字值会自动添加 px 单位。
 *
 * @example
 * ```ts
 * // 分别设置四个方向
 * const margin: MarginPadding = {
 *     top: 10,
 *     right: 20,
 *     bottom: 10,
 *     left: 20
 * };
 *
 * // 使用 horizontal/vertical 批量设置
 * const padding: MarginPadding = {
 *     horizontal: 20,  // left + right
 *     vertical: 10     // top + bottom
 * };
 *
 * // 字符串值直接使用
 * const margin: MarginPadding = {
 *     top: '1rem',
 *     bottom: '2em'
 * };
 * ```
 *
 * @see resolveMarginPadding - 值转换器
 */
export interface MarginPadding {
    /** 上边距/内边距 */
    top?: number | string;
    /** 右边距/内边距 */
    right?: number | string;
    /** 下边距/内边距 */
    bottom?: number | string;
    /** 左边距/内边距 */
    left?: number | string;
    /** 水平边距/内边距（left + right） */
    horizontal?: number | string;
    /** 垂直边距/内边距（top + bottom） */
    vertical?: number | string;
}

/**
 * 单边边框配置
 *
 * 定义单个方向的边框样式，用于 Border 的 top/right/bottom/left 字段。
 *
 * @example
 * ```ts
 * const topBorder: BorderSide = {
 *     width: 2,
 *     style: 'solid',
 *     color: 'red'
 * };
 * ```
 */
export interface BorderSide {
    /** 边框宽度，数字会自动添加 px */
    width?: number | string;
    /** 边框样式（solid/dashed/dotted/none 等） */
    style?: string;
    /** 边框颜色 */
    color?: string;
}

/**
 * 边框配置
 *
 * 支持统一设置四边，或分别设置各边。
 * 统一设置和分边设置可以组合使用，分边设置优先级更高。
 *
 * @example
 * ```ts
 * // 统一设置四边
 * const border: Border = {
 *     width: 1,
 *     style: 'solid',
 *     color: '#ccc'
 * };
 *
 * // 分别设置各边
 * const border: Border = {
 *     top: { width: 2, style: 'solid', color: 'red' },
 *     right: { width: 1, style: 'dashed', color: 'blue' },
 *     bottom: { width: 2, style: 'solid', color: 'red' },
 *     left: { width: 1, style: 'dashed', color: 'blue' }
 * };
 *
 * // 组合使用：统一设置 + 单边覆盖
 * const border: Border = {
 *     width: 1,
 *     style: 'solid',
 *     color: '#ccc',
 *     bottom: { width: 2, color: 'red' }  // 只覆盖 width 和 color，style 继承
 * };
 * ```
 *
 * @see resolveBorder - 值转换器
 */
export interface Border {
    /** 统一边框宽度（四边相同） */
    width?: number | string;
    /** 统一边框样式（四边相同） */
    style?: string;
    /** 统一边框颜色（四边相同） */
    color?: string;
    /** 上边框配置（优先级高于统一设置） */
    top?: BorderSide;
    /** 右边框配置（优先级高于统一设置） */
    right?: BorderSide;
    /** 下边框配置（优先级高于统一设置） */
    bottom?: BorderSide;
    /** 左边框配置（优先级高于统一设置） */
    left?: BorderSide;
}

/**
 * 属性操作目标
 *
 * 定义属性值的设置位置：
 * - 'el': 直接设置到元素属性（如 className、hidden）
 * - 'style': 设置到元素的 style 对象（如 width、height）
 * - 'bg': 设置背景相关样式（特殊处理 background 属性）
 */
export type PropTarget = 'el' | 'style' | 'bg';

/**
 * 通用属性定义
 *
 * 扩展属性系统的配置定义，用于声明属性名、操作目标、值类型和转换器。
 * 与 NodePropDef 配合使用，提供更灵活的属性处理机制。
 *
 * @example
 * ```ts
 * const widthDef: CommonPropDef = {
 *     prop: 'width',
 *     target: 'style',
 *     targetProp: 'width',
 *     valueType: 'number',
 *     resolver: 'resolvePx'
 * };
 *
 * const bgDef: CommonPropDef = {
 *     prop: 'bg',
 *     target: 'bg',
 *     targetProp: 'background',
 *     valueType: 'string',
 *     resolver: 'resolveBackground'
 * };
 * ```
 */
export interface CommonPropDef {
    /** 属性名（在模板中使用的简称） */
    prop: string;
    /** 操作目标：el/style/bg */
    target: PropTarget;
    /** 目标属性名（如 style.width），省略则使用 prop */
    targetProp?: string;
    /** 值类型（number/string/boolean 等） */
    valueType: string;
    /** 值转换器函数名（如 resolvePx、resolveMarginPadding） */
    resolver: string;
}
