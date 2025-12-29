import type { Point, Rect,Matrix } from '../types';

/**
 * 将变换矩阵应用到点上
 * @param p 要变换的点
 * @param m 变换矩阵
 * @returns 变换后的新点
 */
export function applyToPoint(p: Point, m: Matrix): Point {
    return {
        x: m[0] * p.x + m[2] * p.y + m[4],
        y: m[1] * p.x + m[3] * p.y + m[5],
    };
}

/**
 * 将变换矩阵应用到矩形上
 * @param rect 要变换的矩形
 * @param m 变换矩阵
 * @returns 变换后的新矩形（包围原始矩形变换后的四个顶点）
 */
export function applyToRect(rect: Rect, m: Matrix): Rect {
    const p1 = applyToPoint(rect, m);
    const p2 = applyToPoint({ x: rect.x + rect.width, y: rect.y }, m);
    const p3 = applyToPoint({ x: rect.x, y: rect.y + rect.height }, m);
    const p4 = applyToPoint(
        {
            x: rect.x + rect.width,
            y: rect.y + rect.height,
        },
        m
    );

    const xs = [p1.x, p2.x, p3.x, p4.x];
    const ys = [p1.y, p2.y, p3.y, p4.y];

    return {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
    };
}