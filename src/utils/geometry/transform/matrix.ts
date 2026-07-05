// a, b, c, d, e, f
// 对应 CSS matrix(a, b, c, d, e, f)

import { Matrix } from '../types';

/**
 * 创建单位矩阵
 * @returns 单位矩阵 [1, 0, 0, 1, 0, 0]
 */
export const identity = (): Matrix => [1, 0, 0, 1, 0, 0];

/**
 * 将两个变换矩阵相乘
 * @param a 第一个矩阵
 * @param b 第二个矩阵
 * @returns 相乘后的矩阵
 */
export function multiply(a: Matrix, b: Matrix): Matrix {
    return [
        a[0] * b[0] + a[2] * b[1],
        a[1] * b[0] + a[3] * b[1],
        a[0] * b[2] + a[2] * b[3],
        a[1] * b[2] + a[3] * b[3],
        a[0] * b[4] + a[2] * b[5] + a[4],
        a[1] * b[4] + a[3] * b[5] + a[5],
    ];
}
