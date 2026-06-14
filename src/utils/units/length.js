"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pxToRem = pxToRem;
exports.remToPx = remToPx;
exports.pxToVw = pxToVw;
exports.toPx = toPx;
/**
 * 将像素值转换为rem值
 * @param px 像素值
 * @param root 根字体大小
 * @returns 对应的rem值
 */
function pxToRem(px, root) {
    return px / root;
}
/**
 * 将rem值转换为像素值
 * @param rem rem值
 * @param root 根字体大小
 * @returns 对应的像素值
 */
function remToPx(rem, root) {
    return rem * root;
}
/**
 * 将像素值转换为视窗宽度单位值
 * @param px 像素值
 * @param vw 视窗宽度
 * @returns 对应的vw值
 */
function pxToVw(px, vw) {
    return (px / vw) * 100;
}
/**
 * 将长度值转换为像素值
 * @param length 长度值对象，包含值和单位
 * @param ctx 长度转换上下文，包含各种参考尺寸
 * @returns 转换后的像素值
 */
function toPx(length, ctx) {
    const { value, unit } = length;
    switch (unit) {
        case 'px':
            return value;
        case 'rem':
            return value * ctx.rootFontSize;
        case 'em':
            return value * ctx.fontSize;
        case 'vw':
            return (value / 100) * ctx.viewportWidth;
        case 'vh':
            return (value / 100) * ctx.viewportHeight;
        case '%':
            if (ctx.percentBase == null) {
                throw new Error('percentBase is required for % unit');
            }
            return (value / 100) * ctx.percentBase;
    }
}
//# sourceMappingURL=length.js.map