import { Point, Rect } from './types';

/**
 * 检查点是否在矩形内部（包含边界）
 * @param rect 矩形
 * @param p 要检查的点
 * @returns 如果点在矩形内部则返回 true
 */
export function contains(rect: Rect, p: Point): boolean {
    return (
        p.x >= rect.x && p.x <= rect.x + rect.width && p.y >= rect.y && p.y <= rect.y + rect.height
    );
}

/**
 * 获取矩形的中心点
 * @param rect 矩形
 * @returns 矩形的中心点
 */
export function center(rect: Rect): Point {
    return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
    };
}
