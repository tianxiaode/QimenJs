/**
 * 验证距离是否在指定范围内
 */
export function isWithinDistance(x1: number, y1: number, x2: number, y2: number, maxDistance: number): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= maxDistance;
}

/**
 * 计算两点之间的距离
 */
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}