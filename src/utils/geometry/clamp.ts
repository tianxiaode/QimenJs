import { Point, Rect } from './types';

export function clampPoint(p: Point, bounds: Rect): Point {
    return {
        x: Math.min(bounds.x + bounds.width, Math.max(bounds.x, p.x)),
        y: Math.min(bounds.y + bounds.height, Math.max(bounds.y, p.y)),
    };
}

export function keepInside(rect: Rect, container: Rect): Rect {
    return {
        ...rect,
        x: Math.min(container.x + container.width - rect.width, Math.max(container.x, rect.x)),
        y: Math.min(container.y + container.height - rect.height, Math.max(container.y, rect.y)),
    };
}
