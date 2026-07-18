/**
 * Layout Key 常量
 *
 * 类型定义已移至 types/layout.ts，此文件保留运行时常量。
 */

// ── Key 常量 ──

/**
 * AnimationProps 的 key 列表
 */
export const ANIMATION_KEYS = [
    'enterAnimation',
    'enterAnimationOptions',
    'leaveAnimation',
    'leaveAnimationOptions',
    'animationEnabled',
] as const;

/**
 * DragDecl 的 key 列表
 */
export const DRAG_DECL_KEYS = [
    'type',
    'data',
    'axis',
    'handle',
    'bounds',
    'activeClass',
    'grid',
] as const;

/**
 * TooltipProps 的 key 列表
 */
export const TOOLTIP_KEYS = [
    'tooltip',
    'tooltipPlacement',
    'tooltipOffset',
    'tooltipShowDelay',
    'tooltipHideDelay',
    'tooltipMaxWidth',
    'tooltipType',
] as const;

/**
 * ExpandableProps 的 key 列表
 */
export const EXPANDABLE_KEYS = ['expandable'] as const;
