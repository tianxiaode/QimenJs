import type { Matrix } from '../types';

/** 创建平移变换矩阵 */
export function translate(x: number, y: number): Matrix {
    return [1, 0, 0, 1, x, y];
}
