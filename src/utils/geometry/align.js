"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alignLeft = alignLeft;
exports.alignRight = alignRight;
exports.alignTop = alignTop;
exports.alignBottom = alignBottom;
exports.alignCenterX = alignCenterX;
exports.alignCenterY = alignCenterY;
exports.alignCenter = alignCenter;
exports.alignToPointCenter = alignToPointCenter;
/**
 * 将矩形的左边缘与目标矩形的左边缘对齐
 * @param rect 要对齐的矩形
 * @param target 目标矩形
 * @returns 对齐后的新矩形
 */
function alignLeft(rect, target) {
    return {
        ...rect,
        x: target.x,
    };
}
/**
 * 将矩形的右边缘与目标矩形的右边缘对齐
 * @param rect 要对齐的矩形
 * @param target 目标矩形
 * @returns 对齐后的新矩形
 */
function alignRight(rect, target) {
    return {
        ...rect,
        x: target.x + target.width - rect.width,
    };
}
/**
 * 将矩形的顶边缘与目标矩形的顶边缘对齐
 * @param rect 要对齐的矩形
 * @param target 目标矩形
 * @returns 对齐后的新矩形
 */
function alignTop(rect, target) {
    return {
        ...rect,
        y: target.y,
    };
}
/**
 * 将矩形的底边缘与目标矩形的底边缘对齐
 * @param rect 要对齐的矩形
 * @param target 目标矩形
 * @returns 对齐后的新矩形
 */
function alignBottom(rect, target) {
    return {
        ...rect,
        y: target.y + target.height - rect.height,
    };
}
/**
 * 将矩形水平居中对齐到目标矩形
 * @param rect 要对齐的矩形
 * @param target 目标矩形
 * @returns 水平居中对齐后的新矩形
 */
function alignCenterX(rect, target) {
    return {
        ...rect,
        x: target.x + (target.width - rect.width) / 2,
    };
}
/**
 * 将矩形垂直居中对齐到目标矩形
 * @param rect 要对齐的矩形
 * @param target 目标矩形
 * @returns 垂直居中对齐后的新矩形
 */
function alignCenterY(rect, target) {
    return {
        ...rect,
        y: target.y + (target.height - rect.height) / 2,
    };
}
/**
 * 将矩形完全居中对齐到目标矩形（水平和垂直方向都居中）
 * @param rect 要对齐的矩形
 * @param target 目标矩形
 * @returns 完全居中对齐后的新矩形
 */
function alignCenter(rect, target) {
    return alignCenterY(alignCenterX(rect, target), target);
}
/**
 * 将矩形居中对齐到指定点
 * @param rect 要对齐的矩形
 * @param point 目标点
 * @returns 以点为中心对齐后的新矩形
 */
function alignToPointCenter(rect, point) {
    return {
        ...rect,
        x: point.x - rect.width / 2,
        y: point.y - rect.height / 2,
    };
}
//# sourceMappingURL=align.js.map