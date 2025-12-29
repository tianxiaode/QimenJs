import { GestureInput } from './types';

export interface TimerRef {
  id: any;
  clear: () => void;
}

/**
 * 创建一个定时器引用，便于统一管理定时器
 */
export function createTimer(timeoutCallback: () => void, delay: number): TimerRef {
  const id = setTimeout(timeoutCallback, delay);
  return {
    id,
    clear: () => {
      if (id) {
        clearTimeout(id);
      }
    }
  };
}

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

/**
 * 计算速度
 */
export function calculateVelocity(distance: number, duration: number): number {
  return duration > 0 ? distance / duration : 0;
}

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

/**
 * 安全获取坐标值，如果为null或undefined则返回默认值
 */
export function getCoordinateValue(value: number | null | undefined, defaultValue: number = 0): number {
  return value ?? defaultValue;
}