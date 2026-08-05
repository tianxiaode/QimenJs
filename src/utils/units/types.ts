/** CSS 长度单位类型 */
export type LengthUnit = 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh';

/** 长度计算上下文，提供各单位的基准参考值 */
export interface LengthContext {
    rootFontSize: number; // rem
    fontSize: number; // em
    viewportWidth: number; // vw
    viewportHeight: number; // vh
    percentBase?: number; // %
}
