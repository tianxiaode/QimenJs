import type { Point, Rect, Matrix } from '../types';
/**
 * 将变换矩阵应用到点上
 * @param p 要变换的点
 * @param m 变换矩阵
 * @returns 变换后的新点
 */
export declare function applyToPoint(p: Point, m: Matrix): Point;
/**
 * 将变换矩阵应用到矩形上
 * @param rect 要变换的矩形
 * @param m 变换矩阵
 * @returns 变换后的新矩形（包围原始矩形变换后的四个顶点）
 */
export declare function applyToRect(rect: Rect, m: Matrix): Rect;
//# sourceMappingURL=apply.d.ts.map