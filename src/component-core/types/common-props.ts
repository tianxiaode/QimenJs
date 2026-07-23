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
}; /**
 * common-props 类型定义
 */

export interface MarginPadding {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
    horizontal?: number | string;
    vertical?: number | string;
}

export interface BorderSide {
    width?: number | string;
    style?: string;
    color?: string;
}

export interface Border {
    width?: number | string;
    style?: string;
    color?: string;
    top?: BorderSide;
    right?: BorderSide;
    bottom?: BorderSide;
    left?: BorderSide;
}

export type PropTarget = 'el' | 'style' | 'bg';

export interface CommonPropDef {
    prop: string;
    target: PropTarget;
    targetProp?: string;
    valueType: string;
    resolver: string;
}
