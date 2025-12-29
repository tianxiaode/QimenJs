import { Rect } from "./types";

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
