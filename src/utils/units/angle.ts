/**
 * 将角度值转换为弧度值
 * @param deg 角度值
 * @returns 对应的弧度值
 */
export function degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

/**
 * 将弧度值转换为角度值
 * @param rad 弧度值
 * @returns 对应的角度值
 */
export function radToDeg(rad: number): number {
    return (rad * 180) / Math.PI;
}