"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTouchDevice = isTouchDevice;
exports.detectInputCapabilities = detectInputCapabilities;
/**
 * 检测当前设备是否为触摸设备
 * @returns 如果设备支持触摸则返回 true，否则返回 false
 */
function isTouchDevice() {
    if (typeof window === 'undefined')
        return false;
    return ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0);
}
/**
 * 检测设备的输入能力
 * @returns 包含 touch、mouse、pointer 三个布尔值的对象，表示设备支持的输入类型
 */
function detectInputCapabilities() {
    if (typeof window === 'undefined') {
        return { touch: false, mouse: false, pointer: false };
    }
    const touch = 'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;
    const pointer = typeof window.PointerEvent !== 'undefined';
    const mouse = true; // 几乎所有非纯触摸环境都有
    return { touch, mouse, pointer };
}
//# sourceMappingURL=input.js.map