/**
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
