/**
 * 安全获取坐标值，如果为null或undefined则返回默认值
 */
export function getCoordinateValue(value: number | null | undefined, defaultValue: number = 0): number {
  return value ?? defaultValue;
}