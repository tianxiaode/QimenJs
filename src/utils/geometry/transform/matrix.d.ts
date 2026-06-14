import { Matrix } from '../types';
/**
 * 创建单位矩阵
 * @returns 单位矩阵 [1, 0, 0, 1, 0, 0]
 */
export declare const identity: () => Matrix;
/**
 * 将两个变换矩阵相乘
 * @param a 第一个矩阵
 * @param b 第二个矩阵
 * @returns 相乘后的矩阵
 */
export declare function multiply(a: Matrix, b: Matrix): Matrix;
//# sourceMappingURL=matrix.d.ts.map