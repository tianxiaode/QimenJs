import type { Point } from './types';
/**
 * 计算两个点之间的欧几里得距离
 * @param a 第一个点
 * @param b 第二个点
 * @returns 两点之间的距离
 */
export declare function distance(a: Point, b: Point): number;
/**
 * 检查两点之间的距离是否在指定半径内（圆形检测区域）
 * @param a 第一个点
 * @param b 第二个点
 * @param max 最大距离阈值
 * @returns 如果两点之间的距离小于等于最大值则返回 true
 */
export declare function isWithinRadius(a: Point, b: Point, max: number): boolean;
/**
 * 检查两点之间的距离是否在指定方形区域内（曼哈顿距离的方形检测区域）
 * @param a 第一个点
 * @param b 第二个点
 * @param maxDistance 最大距离阈值
 * @returns 如果两点之间的 x 和 y 距离都小于最大距离则返回 true
 */
export declare function isWithinSquare(a: {
    x: number;
    y: number;
}, b: {
    x: number;
    y: number;
}, maxDistance: number): boolean;
/**
 * 根据距离和持续时间计算速度
 * @param distance 距离
 * @param duration 持续时间
 * @returns 计算出的速度值
 */
export declare function calculateVelocity(distance: number, duration: number): number;
/**
 * 获取数值，如果值为 null 或 undefined 则返回默认值
 * @param value 要获取的值
 * @param defaultValue 默认值
 * @returns 值或默认值
 */
export declare function getCoordinateValue(value: number | null | undefined, defaultValue?: number): number;
//# sourceMappingURL=point.d.ts.map