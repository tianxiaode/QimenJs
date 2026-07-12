/**
 * 主题系统类型定义
 *
 * 定义 Design Tokens、ThemeDefinition 等核心类型
 */

/**
 * 颜色令牌
 *
 * 包含主题所需的所有颜色变量，支持扩展
 */
export interface ColorTokens {
    /** 主色 */
    primary: string;
    /** 次要色 */
    secondary: string;
    /** 成功色 */
    success: string;
    /** 警告色 */
    warning: string;
    /** 错误色 */
    error: string;
    /** 信息色 */
    info: string;
    /** 背景色 */
    bg: string;
    /** 次要背景色 */
    'bg-secondary': string;
    /** 文字色 */
    text: string;
    /** 次要文字色 */
    'text-secondary': string;
    /** 边框色 */
    border: string;
    /** 扩展颜色 */
    [key: string]: string;
}

/**
 * 间距令牌
 */
export interface SpacingTokens {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
}

/**
 * 圆角令牌
 */
export interface RadiusTokens {
    none: number;
    sm: number;
    md: number;
    lg: number;
    /** 完全圆角，如胶囊按钮 */
    round: string;
}

/**
 * 字体令牌
 */
export interface FontTokens {
    /** 字体族 */
    family: string;
    /** 字号映射，如 { xs: 12, sm: 14, md: 16, lg: 18, xl: 20 } */
    size: Record<string, number>;
    /** 字重映射，如 { normal: 400, medium: 500, bold: 700 } */
    weight: Record<string, number>;
    /** 行高映射，如 { tight: 1.25, normal: 1.5, loose: 2 } */
    lineHeight: Record<string, number>;
}

/**
 * 阴影令牌
 */
export interface ShadowTokens {
    none: string;
    sm: string;
    md: string;
    lg: string;
}

/**
 * 过渡令牌
 */
export interface TransitionTokens {
    fast: string;
    normal: string;
    slow: string;
}

/**
 * 断点令牌
 */
export interface BreakpointTokens {
    sm: number;
    md: number;
    lg: number;
    xl: number;
}

/**
 * 设计令牌集合
 *
 * 包含七大类视觉变量，运行时通过 CSS 变量输出
 */
export interface DesignTokens {
    colors: ColorTokens;
    spacing: SpacingTokens;
    radius: RadiusTokens;
    font: FontTokens;
    shadow: ShadowTokens;
    transition: TransitionTokens;
    breakpoint: BreakpointTokens;
}

/**
 * 主题变更事件名称
 */
export const THEME_CHANGE_EVENT = 'theme:change' as const;

/**
 * 主题定义
 *
 * 主题本质是设计令牌的集合，用 JSON 定义
 */
export interface ThemeDefinition {
    /** 主题名称，同一 ThemeRegistrar 内唯一 */
    name: string;
    /** 主题显示名称 */
    displayName?: string;
    /** 主题描述 */
    description?: string;
    /** 设计令牌 */
    tokens: DesignTokens;
}

/**
 * 主题变更事件数据
 */
export interface ThemeChangeEvent {
    /** 之前主题名 */
    previous: string | undefined;
    /** 当前主题名 */
    current: string;
}

/**
 * 主题变更监听器
 */
export type ThemeChangeHandler = (event: ThemeChangeEvent) => void;

// ─── 颜色变体常量 ───

/**
 * 语义颜色变体类型
 *
 * 用于组件的 colorVariant 属性，控制组件的语义颜色方案。
 * 设置后自动应用对应的背景色 + 前景色（on-xxx）CSS 变量。
 */
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

/**
 * 所有可用的颜色变体常量数组
 */
export const COLOR_VARIANTS: readonly ColorVariant[] = [
    'primary', 'secondary', 'success', 'warning', 'error', 'info',
] as const;

/**
 * 颜色变体 → CSS 变量名映射
 *
 * key 为变体名，value 为对应的 CSS 变量名（不含 --q- 前缀）。
 * 背景色用 colors.xxx，前景色用 colors.on-xxx。
 */
export const COLOR_VARIANT_MAP: Record<ColorVariant, { bg: string; fg: string }> = {
    primary:   { bg: '--q-colors-primary',   fg: '--q-colors-on-primary' },
    secondary: { bg: '--q-colors-secondary',  fg: '--q-colors-on-secondary' },
    success:   { bg: '--q-colors-success',    fg: '--q-colors-on-success' },
    warning:   { bg: '--q-colors-warning',    fg: '--q-colors-on-warning' },
    error:     { bg: '--q-colors-error',      fg: '--q-colors-on-error' },
    info:      { bg: '--q-colors-info',       fg: '--q-colors-on-info' },
} as const;
