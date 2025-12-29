import { Point, Rect } from './types';

export function contains(rect: Rect, p: Point): boolean {
    return (
        p.x >= rect.x && p.x <= rect.x + rect.width && p.y >= rect.y && p.y <= rect.y + rect.height
    );
}

export function center(rect: Rect): Point {
    return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
    };
}
