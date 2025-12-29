import { Point, Rect } from './types';

// 左对齐
export function alignLeft(rect: Rect, target: Rect): Rect {
    return {
        ...rect,
        x: target.x,
    };
}

// 右对齐
export function alignRight(rect: Rect, target: Rect): Rect {
    return {
        ...rect,
        x: target.x + target.width - rect.width,
    };
}

// 顶部对齐
export function alignTop(rect: Rect, target: Rect): Rect {
    return {
        ...rect,
        y: target.y,
    };
}

// 底部对齐
export function alignBottom(rect: Rect, target: Rect): Rect {
    return {
        ...rect,
        y: target.y + target.height - rect.height,
    };
}

// 水平居中
export function alignCenterX(rect: Rect, target: Rect): Rect {
    return {
        ...rect,
        x: target.x + (target.width - rect.width) / 2,
    };
}

// 垂直居中
export function alignCenterY(rect: Rect, target: Rect): Rect {
    return {
        ...rect,
        y: target.y + (target.height - rect.height) / 2,
    };
}

// 完全居中
export function alignCenter(rect: Rect, target: Rect): Rect {
    return alignCenterY(alignCenterX(rect, target), target);
}

export function alignToPointCenter(rect: Rect, point: Point): Rect {
    return {
        ...rect,
        x: point.x - rect.width / 2,
        y: point.y - rect.height / 2,
    };
}
