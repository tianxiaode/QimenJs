"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contains = contains;
exports.center = center;
/**
 * 检查点是否在矩形内部（包含边界）
 * @param rect 矩形
 * @param p 要检查的点
 * @returns 如果点在矩形内部则返回 true
 */
function contains(rect, p) {
    return (p.x >= rect.x && p.x <= rect.x + rect.width && p.y >= rect.y && p.y <= rect.y + rect.height);
}
/**
 * 获取矩形的中心点
 * @param rect 矩形
 * @returns 矩形的中心点
 */
function center(rect) {
    return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
    };
}
//# sourceMappingURL=rect.js.map