import { Point, Rect } from './types';
/**
 * 将点限制在指定的边界矩形内
 * @param p 要限制的点
 * @param bounds 边界矩形
 * @returns 限制在边界内的新点
 */
export declare function clampPoint(p: Point, bounds: Rect): Point;
/**
 * 将矩形保持在容器矩形内部
 * @param rect 要限制的矩形
 * @param container 容器矩形
 * @returns 保持在容器内部的新矩形
 */
export declare function keepInside(rect: Rect, container: Rect): Rect;
//# sourceMappingURL=clamp.d.ts.map