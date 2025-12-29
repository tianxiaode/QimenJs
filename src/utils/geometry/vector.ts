import { Point } from './types';

export function subtract(a: Point, b: Point): Point {
    return { x: a.x - b.x, y: a.y - b.y };
}

export function add(a: Point, b: Point): Point {
    return { x: a.x + b.x, y: a.y + b.y };
}

export function scale(v: Point, k: number): Point {
    return { x: v.x * k, y: v.y * k };
}
