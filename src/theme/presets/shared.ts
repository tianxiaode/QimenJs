/**
 * 中国风主题共享配置
 */

import type { ThemeDefinition } from '../types';

// ============ 中国风字体族 ============
export const CHINESE_FONT_FAMILY =
    '"Noto Serif SC", "Source Han Serif SC", "思源宋体", "华文宋体", "宋体", serif';

// ============ 通用间距 ============
export const CHINESE_SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
} as const;

// ============ 通用圆角 ============
export const CHINESE_RADIUS = {
    none: 0,
    sm: 2,
    md: 4,
    lg: 8,
    round: '9999px',
} as const;

// ============ 通用字号 ============
export const CHINESE_FONT_SIZE = {
    xs: 12,
    sm: 13,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
} as const;

// ============ 通用字重 ============
export const CHINESE_FONT_WEIGHT = {
    normal: 400,
    medium: 500,
    bold: 700,
} as const;

// ============ 通用行高 ============
export const CHINESE_LINE_HEIGHT = {
    tight: 1.25,
    normal: 1.5,
    loose: 2,
} as const;

// ============ 通用过渡 ============
export const CHINESE_TRANSITION = {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '350ms ease',
} as const;

// ============ 通用断点 ============
export const CHINESE_BREAKPOINT = {
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
} as const;

// ============ 通用边框 ============
export const CHINESE_BORDER = {
    none: 'none',
    thin: '1px solid var(--q-colors-border)',
    normal: '1px solid var(--q-colors-border)',
    thick: '2px solid var(--q-colors-border)',
} as const;

// ============ 通用层级 ============
export const CHINESE_Z_INDEX = {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
} as const;

// ============ 通用透明度 ============
export const CHINESE_OPACITY = {
    disabled: 0.38,
    hover: 0.04,
    focus: 0.12,
    selected: 0.08,
    activated: 0.12,
    pressed: 0.12,
    drag: 0.4,
} as const;

// ============ 通用动画 ============
export const CHINESE_ANIMATION = {
    fast: '150ms ease-out',
    normal: '250ms ease-out',
    slow: '350ms ease-out',
} as const;

// ============ 通用光标 ============
export const CHINESE_CURSOR = {
    default: 'default',
    pointer: 'pointer',
    move: 'move',
    text: 'text',
    notAllowed: 'not-allowed',
    grab: 'grab',
    grabbing: 'grabbing',
} as const;

// ============ 通用溢出 ============
export const CHINESE_OVERFLOW = {
    visible: 'visible',
    hidden: 'hidden',
    scroll: 'scroll',
    auto: 'auto',
} as const;

// ============ 构建主题的辅助函数 ============
import type { ThemeTokens } from '../types';

export function buildChineseTheme(
    name: string,
    displayName: string,
    description: string,
    colors: ThemeTokens['colors']
): ThemeDefinition {
    return {
        name,
        displayName,
        description,
        tokens: {
            colors,
            spacing: CHINESE_SPACING,
            radius: CHINESE_RADIUS,
            font: {
                family: CHINESE_FONT_FAMILY,
                size: CHINESE_FONT_SIZE,
                weight: CHINESE_FONT_WEIGHT,
                lineHeight: CHINESE_LINE_HEIGHT,
            },
            shadow: {
                none: 'none',
                sm: '0 1px 2px rgba(0, 0, 0, 0.06)',
                md: '0 4px 12px rgba(0, 0, 0, 0.08)',
                lg: '0 8px 30px rgba(0, 0, 0, 0.12)',
            },
            transition: CHINESE_TRANSITION,
            breakpoint: CHINESE_BREAKPOINT,
            border: CHINESE_BORDER,
            zIndex: CHINESE_Z_INDEX,
            opacity: CHINESE_OPACITY,
            animation: CHINESE_ANIMATION,
            cursor: CHINESE_CURSOR,
            overflow: CHINESE_OVERFLOW,
        },
    };
}
