/** 指示器类型：圆点/数字/短划线/按钮/标签页 */
export type IndicatorType = 'dot' | 'number' | 'dash' | 'button' | 'tab';

export interface IndicatorDecl {
    /** 指示器类型 */
    type: IndicatorType;
    /** 弹出方向，默认 'bottom' */
    placement?: 'top' | 'bottom' | 'left' | 'right';
    /** 触发方式，默认 'always'（始终显示） */
    trigger?: 'always' | 'click' | 'hover';
    /** 是否显示 prev/next 箭头 */
    arrows?: boolean;
    /** 初始选中索引 */
    activeIndex?: number;
    /** 指示器子项类型（默认由 type 推导） */
    defaultItemType?: string;
    /** 浮层事件转发 */
    emits?: Record<string, string>;
}
