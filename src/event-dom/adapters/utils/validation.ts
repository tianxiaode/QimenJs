import { geometry } from '@/utils';

/**
 * 验证双击（double tap）手势
 * 检查两次点击的时间间隔是否在允许范围内，且两次点击的位置是否接近
 *
 * @param now 当前时间戳
 * @param lastTapTime 上一次点击的时间戳
 * @param currentX 当前点击位置的X坐标
 * @param currentY 当前点击位置的Y坐标
 * @param lastTapX 上一次点击位置的X坐标
 * @param lastTapY 上一次点击位置的Y坐标
 * @param maxInterval 最大时间间隔（毫秒），超过此时间则不是双击
 * @param maxDistance 最大距离（像素），两次点击位置的距离不能超过此值
 * @returns 如果满足双击条件返回true，否则返回false
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

    return geometry.isWithinRadius(
        { x: currentX, y: currentY },
        { x: lastTapX, y: lastTapY },
        maxDistance
    );
}

/**
 * 验证长按（long press）手势
 * 检查手指当前位置与起始位置的距离是否在允许范围内
 *
 * @param startX 按下开始时的X坐标
 * @param startY 按下开始时的Y坐标
 * @param currentX 当前位置的X坐标
 * @param currentY 当前位置的Y坐标
 * @param maxDistance 最大移动距离（像素），超过此距离则不是长按
 * @returns 如果满足长按条件返回true，否则返回false
 */
export function validateLongPress(
    startX: number,
    startY: number,
    currentX: number,
    currentY: number,
    maxDistance: number
): boolean {
    return geometry.isWithinRadius(
        { x: currentX, y: currentY },
        { x: startX, y: startY },
        maxDistance
    );
}

/**
 * 验证滑动（swipe）手势
 * 检查滑动的距离、持续时间和速度是否满足滑动条件
 *
 * @param distance 滑动距离（像素）
 * @param duration 滑动持续时间（毫秒）
 * @param minDistance 最小滑动距离（像素），低于此距离则不是滑动
 * @param maxDuration 最大持续时间（毫秒），超过此时间则不是滑动
 * @param minVelocity 最小速度（像素/毫秒），低于此速度则不是滑动
 * @returns 如果满足滑动条件返回true，否则返回false
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

    const velocity = geometry.calculateVelocity(distance, duration);
    return velocity >= minVelocity;
}

/**
 * 验证轻敲（tap）手势
 * 检查触摸持续时间和移动距离是否满足轻敲条件
 *
 * @param duration 触摸持续时间（毫秒）
 * @param distance 手指移动距离（像素）
 * @param maxDuration 最大持续时间（毫秒），超过此时间则不是轻敲
 * @param maxDistance 最大移动距离（像素），超过此距离则不是轻敲
 * @returns 如果满足轻敲条件返回true，否则返回false
 */
export function validateTap(
    duration: number,
    distance: number,
    maxDuration: number,
    maxDistance: number
): boolean {
    return duration <= maxDuration && distance <= maxDistance;
}
