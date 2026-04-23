import { Rect } from "./types";

/**
 * 将矩形的边缘吸附到目标矩形的边缘，如果距离在阈值范围内
 * @param rect 要吸附的矩形
 * @param target 目标矩形
 * @param threshold 吸附阈值
 * @returns 吸附后的新矩形
 */
export function snapToEdges(rect: Rect, target: Rect, threshold: number): Rect {
    let { x, y } = rect;

    // 左
    if (Math.abs(rect.x - target.x) <= threshold) {
        x = target.x;
    }

    // 右
    if (Math.abs(rect.x + rect.width - (target.x + target.width)) <= threshold) {
        x = target.x + target.width - rect.width;
    }

    // 上
    if (Math.abs(rect.y - target.y) <= threshold) {
        y = target.y;
    }

    // 下
    if (Math.abs(rect.y + rect.height - (target.y + target.height)) <= threshold) {
        y = target.y + target.height - rect.height;
    }

    return { ...rect, x, y };
}