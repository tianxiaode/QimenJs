/**
 * 计算速度
 */
export function calculateVelocity(distance: number, duration: number): number {
  return duration > 0 ? distance / duration : 0;
}