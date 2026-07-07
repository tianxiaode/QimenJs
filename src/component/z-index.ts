/**
 * z-index 层级管理
 *
 * 使用预定义层级常量 + CSS 变量 + 同层递增
 */

/** 预定义层级常量 */
export const ZIndexLevel = {
    dropdown: 1050,
    modal: 1060,
    notification: 1070,
    tooltip: 1080,
} as const;

/** 层级计数器 */
const counters = new Map<number, number>();

/**
 * 获取下一个 z-index 值
 *
 * @param level - 层级常量
 * @returns z-index 值
 */
export function nextZIndex(level: number): number {
    const current = counters.get(level) ?? level;
    const next = current + 10;
    counters.set(level, next);
    return next;
}

/**
 * 释放 z-index 值
 *
 * @param level - 层级常量
 */
export function releaseZIndex(level: number): void {
    const current = counters.get(level) ?? level;
    if (current > level) {
        counters.set(level, current - 10);
    }
}
