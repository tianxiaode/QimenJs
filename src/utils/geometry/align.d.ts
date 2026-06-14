import { Point, Rect } from './types';
/**
 * 将矩形的左边缘与目标矩形的左边缘对齐
 * @param rect 要对齐的矩形
 * @param target 目标矩形
 * @returns 对齐后的新矩形
 */
export declare function alignLeft(rect: Rect, target: Rect): Rect;
/**
 * 将矩形的右边缘与目标矩形的右边缘对齐
 * @param rect 要对齐的矩形
 * @param target 目标矩形
 * @returns 对齐后的新矩形
 */
export declare function alignRight(rect: Rect, target: Rect): Rect;
/**
 * 将矩形的顶边缘与目标矩形的顶边缘对齐
 * @param rect 要对齐的矩形
 * @param target 目标矩形
 * @returns 对齐后的新矩形
 */
export declare function alignTop(rect: Rect, target: Rect): Rect;
/**
 * 将矩形的底边缘与目标矩形的底边缘对齐
 * @param rect 要对齐的矩形
 * @param target 目标矩形
 * @returns 对齐后的新矩形
 */
export declare function alignBottom(rect: Rect, target: Rect): Rect;
/**
 * 将矩形水平居中对齐到目标矩形
 * @param rect 要对齐的矩形
 * @param target 目标矩形
 * @returns 水平居中对齐后的新矩形
 */
export declare function alignCenterX(rect: Rect, target: Rect): Rect;
/**
 * 将矩形垂直居中对齐到目标矩形
 * @param rect 要对齐的矩形
 * @param target 目标矩形
 * @returns 垂直居中对齐后的新矩形
 */
export declare function alignCenterY(rect: Rect, target: Rect): Rect;
/**
 * 将矩形完全居中对齐到目标矩形（水平和垂直方向都居中）
 * @param rect 要对齐的矩形
 * @param target 目标矩形
 * @returns 完全居中对齐后的新矩形
 */
export declare function alignCenter(rect: Rect, target: Rect): Rect;
/**
 * 将矩形居中对齐到指定点
 * @param rect 要对齐的矩形
 * @param point 目标点
 * @returns 以点为中心对齐后的新矩形
 */
export declare function alignToPointCenter(rect: Rect, point: Point): Rect;
//# sourceMappingURL=align.d.ts.map