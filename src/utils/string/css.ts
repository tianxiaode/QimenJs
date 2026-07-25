/**
 * CSS单位处理工具函数
 */

export type CssUnitType = string | number | null | undefined;

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

export function normalizeCssUnit(value: CssUnitType): string {
    if (value === 0) return '0';
    if (typeof value === 'number') return value + 'px';
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    return value as string;
}

export function cssUnitTypeToNumber(value: CssUnitType): number {
    if (typeof value === 'number') return value;
    const match = value!.match(/^(\d+(\.\d+)?)(px|em|rem|%|pt|pc|ex|ch|vw|vh|vmin|vmax)?$/);
    if (match) {
        const num = parseFloat(match[1]);
        return num;
    }
    return 0;
}

export function resolvePx(v: number | string): string {
    return typeof v === 'number' ? v + 'px' : v;
}

export function resolveMarginPadding(v: number | string | MarginPadding): string {
    if (typeof v === 'number') return v + 'px';
    if (typeof v === 'string') return v;
    const { top, right, bottom, left, horizontal, vertical } = v;
    const t = top ?? vertical ?? 0;
    const r = right ?? horizontal ?? 0;
    const b = bottom ?? vertical ?? 0;
    const l = left ?? horizontal ?? 0;
    return [t, r, b, l].map(v => (typeof v === 'number' ? v + 'px' : v)).join(' ');
}

export function resolveBorder(v: number | string | Border): string {
    if (typeof v === 'number') return v + 'px solid';
    if (typeof v === 'string') return v;
    const w = typeof v.width === 'number' ? v.width + 'px' : (v.width ?? '1px');
    const s = v.style ?? 'solid';
    const c = v.color ?? '';
    return c ? `${w} ${s} ${c}` : `${w} ${s}`;
}

export interface IndentStyleOptions {
    depth: number;
    prefix?: string;
    property?: string;
    offset?: number | string;
}

export function indentStyle(options: IndentStyleOptions): string {
    const { depth, prefix, property = 'padding-left', offset } = options;
    if (depth <= 0 && !offset) return '';

    const stepVar = prefix
        ? `var(--q-indent-step-${prefix}, var(--q-indent-step, 16px))`
        : `var(--q-indent-step, 16px)`;

    const parts: string[] = [];
    if (depth > 0) parts.push(`${depth} * ${stepVar}`);
    if (offset !== undefined) {
        const offsetVal = typeof offset === 'number' ? offset + 'px' : offset;
        parts.push(offsetVal);
    }

    const value = parts.length === 1 ? parts[0] : `calc(${parts.join(' + ')})`;

    return `${property}: ${value};`;
}
