/**
 * 指示器状态 key
 */
export const INDICATOR_STATE_KEY = 'IndicatorAbility:state';

/**
 * 指示器位置映射（内嵌于组件 el 内的绝对定位）
 */
export const INDICATOR_PLACEMENT_MAP = {
    top: { top: '0', left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: '0', left: '50%', transform: 'translateX(-50%)' },
    left: { left: '0', top: '50%', transform: 'translateY(-50%)' },
    right: { right: '0', top: '50%', transform: 'translateY(-50%)' },
} as const;

/**
 * 指示器类型 → CSS 模式类名
 */
export const INDICATOR_TYPE_CLS = {
    dot: 'q-indicator--dot',
    number: 'q-indicator--number',
    dash: 'q-indicator--dash',
    button: 'q-indicator--button',
    tab: 'q-indicator--tab',
} as const;
