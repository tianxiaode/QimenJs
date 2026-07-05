/**
 * 表示设备输入能力的接口
 */
export interface InputCapabilities {
    touch: boolean; // 是否支持触摸
    mouse: boolean; // 是否支持鼠标
    pointer: boolean; // 是否支持指针事件
}

/**
 * 检测当前设备是否为触摸设备
 * @returns 如果设备支持触摸则返回 true，否则返回 false
 */
export function isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;

    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * 检测设备的输入能力
 * @returns 包含 touch、mouse、pointer 三个布尔值的对象，表示设备支持的输入类型
 */
export function detectInputCapabilities(): InputCapabilities {
    if (typeof window === 'undefined') {
        return { touch: false, mouse: false, pointer: false };
    }

    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const pointer = typeof window.PointerEvent !== 'undefined';

    const mouse = true; // 几乎所有非纯触摸环境都有

    return { touch, mouse, pointer };
}
