/**
 * 验证双击参数
 */
export function validateDoubleTap(
  now: number, 
  lastTapTime: number, 
  currentX: number, 
  currentY: number, 
  lastTapX: number, 
  lastTapY: number, 
  maxInterval: number, 
  maxDistance: number
): boolean {
  if (now - lastTapTime >= maxInterval) {
    return false;
  }
  
  return isWithinDistance(currentX, currentY, lastTapX, lastTapY, maxDistance);
}

/**
 * 验证长按参数
 */
export function validateLongPress(
  startX: number, 
  startY: number, 
  currentX: number, 
  currentY: number, 
  maxDistance: number
): boolean {
  return isWithinDistance(startX, startY, currentX, currentY, maxDistance);
}

/**
 * 验证滑动参数
 */
export function validateSwipe(
  distance: number, 
  duration: number, 
  minDistance: number, 
  maxDuration: number, 
  minVelocity: number
): boolean {
  if (duration >= maxDuration || distance < minDistance) {
    return false;
  }
  
  const velocity = calculateVelocity(distance, duration);
  return velocity >= minVelocity;
}

/**
 * 验证轻敲参数
 */
export function validateTap(
  duration: number, 
  distance: number, 
  maxDuration: number, 
  maxDistance: number
): boolean {
  return duration <= maxDuration && distance <= maxDistance;
}

// 导入其他工具函数
import { isWithinDistance } from './distance';
import { calculateVelocity } from './velocity';