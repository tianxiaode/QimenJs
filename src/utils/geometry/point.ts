import type { Point } from './types';

export function distance(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function isWithin(a: Point, b: Point, max: number): boolean {
    return distance(a, b) <= max;
}
