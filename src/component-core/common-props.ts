/**
 * common-props.ts — 通用属性定义 + 值转换器
 *
 * 统一管理组件自身和 DOM 子节点的通用属性：
 * - 组件自身：className, style, hidden, width, ...
 * - DOM 子节点：labelClassName, labelStyle, labelHidden, labelWidth, ...
 * - 组件子节点：$icon（返回实例）
 *
 * 设计原则：
 * - 数字即 px，字符串即原样
 * - 复杂属性用对象结构（margin/padding/border）
 * - 一套定义驱动三层生成
 */

// ─── 复杂属性类型 ──────────────────────────────────────────

/**
 * margin/padding 对象结构
 *
 * 支持 horizontal/vertical 简写，与 CSS 简写规则对齐。
 */
export interface MarginPadding {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
    /** 水平简写（right + left） */
    horizontal?: number | string;
    /** 垂直简写（top + bottom） */
    vertical?: number | string;
}

/**
 * border 单边定义
 */
export interface BorderSide {
    width?: number | string;
    style?: string;
    color?: string;
}

/**
 * border 对象结构
 */
export interface Border {
    width?: number | string;
    style?: string;
    color?: string;
    top?: BorderSide;
    right?: BorderSide;
    bottom?: BorderSide;
    left?: BorderSide;
}

// ─── 通用属性定义 ──────────────────────────────────────────

/**
 * 通用属性目标类型
 *
 * - 'el': 直接操作 el 属性（className, hidden）
 * - 'style': 操作 el.style 子属性（width, height, margin, ...）
 * - 'bg': 操作 el.style.background（特殊映射）
 */
export type PropTarget = 'el' | 'style' | 'bg';

/**
 * 单个通用属性定义
 */
export interface CommonPropDef {
    /** 属性名（如 className, width, margin） */
    prop: string;
    /** 操作目标类型 */
    target: PropTarget;
    /** 目标属性名（如 el.className, style.width），不传则等于 prop */
    targetProp?: string;
    /** 值类型描述（用于类型生成） */
    valueType: string;
    /** 值转换器名（对应 RESOLVERS 中的 key） */
    resolver: string;
}

/**
 * 通用属性常量数组
 *
 * 组件自身和 DOM 子节点共用此定义，命名规则不同：
 * - 组件自身：prop → className, width, margin
 * - DOM 子节点：name + Prop → labelClassName, labelWidth, labelMargin
 */
export const COMMON_PROPS: readonly CommonPropDef[] = [
    { prop: 'className', target: 'el',    valueType: 'string',                          resolver: 'identity' },
    { prop: 'style',     target: 'el',    valueType: 'string | Record<string, any>',     resolver: 'identity' },
    { prop: 'hidden',    target: 'el',    valueType: 'boolean',                          resolver: 'identity' },
    { prop: 'width',     target: 'style', targetProp: 'width',  valueType: 'number | string',       resolver: 'px' },
    { prop: 'height',    target: 'style', targetProp: 'height', valueType: 'number | string',       resolver: 'px' },
    { prop: 'x',         target: 'style', targetProp: 'left',   valueType: 'number | string',       resolver: 'px' },
    { prop: 'y',         target: 'style', targetProp: 'top',    valueType: 'number | string',       resolver: 'px' },
    { prop: 'margin',    target: 'style', valueType: 'number | string | MarginPadding',  resolver: 'marginPadding' },
    { prop: 'padding',   target: 'style', valueType: 'number | string | MarginPadding',  resolver: 'marginPadding' },
    { prop: 'fontSize',  target: 'style', valueType: 'number | string',                   resolver: 'px' },
    { prop: 'color',     target: 'style', valueType: 'string',                            resolver: 'identity' },
    { prop: 'bg',        target: 'bg',    valueType: 'string',                            resolver: 'identity' },
    { prop: 'cursor',    target: 'style', valueType: 'string',                            resolver: 'identity' },
    { prop: 'border',    target: 'style', valueType: 'number | string | Border',          resolver: 'border' },
] as const;

// ─── 值转换器 ──────────────────────────────────────────────

/**
 * 数字加 px，字符串原样
 */
export function resolvePx(v: number | string): string {
    return typeof v === 'number' ? v + 'px' : v;
}

/**
 * margin/padding 值转换
 *
 * - number → 'Npx'
 * - string → 原样
 * - MarginPadding 对象 → CSS 简写展开
 */
export function resolveMarginPadding(v: number | string | MarginPadding): string {
    if (typeof v === 'number') return v + 'px';
    if (typeof v === 'string') return v;

    const { top, right, bottom, left, horizontal, vertical } = v;
    const t = top ?? vertical ?? 0;
    const r = right ?? horizontal ?? 0;
    const b = bottom ?? vertical ?? 0;
    const l = left ?? horizontal ?? 0;
    return [t, r, b, l].map(v => typeof v === 'number' ? v + 'px' : v).join(' ');
}

/**
 * border 值转换
 *
 * - number → 'Npx solid'
 * - string → 原样
 * - Border 对象 → CSS 简写展开
 */
export function resolveBorder(v: number | string | Border): string {
    if (typeof v === 'number') return v + 'px solid';
    if (typeof v === 'string') return v;

    const w = typeof v.width === 'number' ? v.width + 'px' : v.width ?? '1px';
    const s = v.style ?? 'solid';
    const c = v.color ?? '';
    return c ? `${w} ${s} ${c}` : `${w} ${s}`;
}

/**
 * 值转换器映射
 */
export const RESOLVERS: Record<string, (v: any) => any> = {
    identity: (v: any) => v,
    px: resolvePx,
    marginPadding: resolveMarginPadding,
    border: resolveBorder,
};

// ─── 属性名生成工具 ──────────────────────────────────────────

/**
 * 生成 DOM 子节点的属性名
 *
 * 规则：name + Prop（首字母大写）
 * - ('label', 'className') → 'labelClassName'
 * - ('label', 'width') → 'labelWidth'
 */
export function childPropName(nodeName: string, prop: string): string {
    return nodeName + prop.charAt(0).toUpperCase() + prop.slice(1);
}

/**
 * 生成组件子节点的属性名
 *
 * 规则：$ + name
 * - 'icon' → '$icon'
 */
export function componentChildPropName(nodeName: string): string {
    return '$' + nodeName;
}
