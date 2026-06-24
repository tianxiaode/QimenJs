import { Point } from './types';
/**
 * 计算两个点之间的差值向量 (a - b)
 * @param a 被减数点
 * @param b 减数点
 * @returns 差值向量
 */
export declare function subtract(a: Point, b: Point): Point;
/**
 * 计算两个点的和 (a + b)
 * @param a 第一个点
 * @param b 第二个点
 * @returns 和向量
 */
export declare function add(a: Point, b: Point): Point;
/**
 * 将向量按比例缩放
 * @param v 要缩放的向量
 * @param k 缩放因子
 * @returns 缩放后的向量
 */
export declare function scale(v: Point, k: number): Point;
//# sourceMappingURL=vector.d.ts.map