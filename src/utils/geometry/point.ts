import type { Point } from './types';

export function distance(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function isWithinRadius(a: Point, b: Point, max: number): boolean {
    return distance(a, b) <= max;
}

export function isWithinSquare(
    a: { x: number; y: number },
    b: { x: number; y: number },
    maxDistance: number
): boolean {
    return Math.abs(a.x - b.x) < maxDistance && Math.abs(a.y - b.y) < maxDistance;
}

export function calculateVelocity(distance: number, duration: number): number {
  return duration > 0 ? distance / duration : 0;
}

export function getCoordinateValue(value: number | null | undefined, defaultValue: number = 0): number {
  return value ?? defaultValue;
}