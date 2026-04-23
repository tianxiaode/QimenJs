import type { Matrix } from '../types';

export function translate(x: number, y: number): Matrix {
    return [1, 0, 0, 1, x, y];
}
