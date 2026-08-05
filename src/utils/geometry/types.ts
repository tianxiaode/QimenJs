/** 二维点坐标 */
export interface Point {
    x: number;
    y: number;
}

/** 尺寸信息 */
export interface Size {
    width: number;
    height: number;
}

/** 矩形区域，包含位置和尺寸 */
export interface Rect extends Point, Size {}

/** 2D 仿射变换矩阵 [a, b, c, d, e, f] */
export type Matrix = [number, number, number, number, number, number];
