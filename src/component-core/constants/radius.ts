/** 圆角档位名 → 固定 CSS 值映射（不走变量，不受全局 useRadius 影响） */
export const RADIUS_MAP: Record<string, string> = {
    none: '0',
    xs: '1px',
    sm: '2px',
    md: '4px',
    lg: '8px',
    xl: '12px',
    round: '9999px',
};
