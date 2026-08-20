/**
 * 角标尺寸配置
 */
export const BADGE_SIZE_CONFIG = {
    small: { fontSize: '10px', padding: '0 4px', minWidth: '16px', height: '16px' },
    medium: { fontSize: '12px', padding: '0 6px', minWidth: '20px', height: '20px' },
    large: { fontSize: '14px', padding: '0 8px', minWidth: '24px', height: '24px' },
} as const;

/**
 * 角标位置映射
 */
export const BADGE_POSITION_MAP = {
    'top-right': { top: '0', right: '0', transform: 'translate(50%, -50%)' },
    'top-left': { top: '0', left: '0', transform: 'translate(-50%, -50%)' },
    'bottom-right': { bottom: '0', right: '0', transform: 'translate(50%, 50%)' },
    'bottom-left': { bottom: '0', left: '0', transform: 'translate(-50%, 50%)' },
} as const;

/**
 * 角标状态 key
 */
export const BADGE_STATE_KEY = 'BadgeAbility:el';
