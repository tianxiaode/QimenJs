"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.degToRad = degToRad;
exports.radToDeg = radToDeg;
/**
 * 将角度值转换为弧度值
 * @param deg 角度值
 * @returns 对应的弧度值
 */
function degToRad(deg) {
    return (deg * Math.PI) / 180;
}
/**
 * 将弧度值转换为角度值
 * @param rad 弧度值
 * @returns 对应的角度值
 */
function radToDeg(rad) {
    return (rad * 180) / Math.PI;
}
//# sourceMappingURL=angle.js.map