"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampPoint = clampPoint;
exports.keepInside = keepInside;
/**
 * 将点限制在指定的边界矩形内
 * @param p 要限制的点
 * @param bounds 边界矩形
 * @returns 限制在边界内的新点
 */
function clampPoint(p, bounds) {
    return {
        x: Math.min(bounds.x + bounds.width, Math.max(bounds.x, p.x)),
        y: Math.min(bounds.y + bounds.height, Math.max(bounds.y, p.y)),
    };
}
/**
 * 将矩形保持在容器矩形内部
 * @param rect 要限制的矩形
 * @param container 容器矩形
 * @returns 保持在容器内部的新矩形
 */
function keepInside(rect, container) {
    return {
        ...rect,
        x: Math.min(container.x + container.width - rect.width, Math.max(container.x, rect.x)),
        y: Math.min(container.y + container.height - rect.height, Math.max(container.y, rect.y)),
    };
}
//# sourceMappingURL=clamp.js.map