/**
 * 浮层缓存状态 key
 */
export const FLOAT_CACHE_KEY = 'FloatAbility:cache';

/**
 * 需要在初始化阶段自动注册的浮层类型列表
 *
 * 这些类型的浮层会在 _commitFloats 中通过 `_get{Key}FloatDecl()`
 * 约定方法收集并提前注册，不依赖懒加载。
 */
export const FLOAT_AUTO_KEYS = ['indicator', 'tooltip'] as const;

/** Dialog 状态 key */
export const DIALOG_STATE_KEY = 'DialogAbility:state';
/** Indicator 状态 key */
export const INDICATOR_STATE_KEY = 'IndicatorAbility:state';
/** Loading 状态 key */
export const LOADING_STATE_KEY = 'LoadingAbility:state';
/** Popover 状态 key */
export const POPOVER_STATE_KEY = 'PopoverAbility:state';
/** Tooltip 状态 key */
export const TOOLTIP_STATE_KEY = 'TooltipAbility:state';
