import { LengthValue } from "./parse";
import { LengthContext } from "./types";
/**
 * 将像素值转换为rem值
 * @param px 像素值
 * @param root 根字体大小
 * @returns 对应的rem值
 */
export declare function pxToRem(px: number, root: number): number;
/**
 * 将rem值转换为像素值
 * @param rem rem值
 * @param root 根字体大小
 * @returns 对应的像素值
 */
export declare function remToPx(rem: number, root: number): number;
/**
 * 将像素值转换为视窗宽度单位值
 * @param px 像素值
 * @param vw 视窗宽度
 * @returns 对应的vw值
 */
export declare function pxToVw(px: number, vw: number): number;
/**
 * 将长度值转换为像素值
 * @param length 长度值对象，包含值和单位
 * @param ctx 长度转换上下文，包含各种参考尺寸
 * @returns 转换后的像素值
 */
export declare function toPx(length: LengthValue, ctx: LengthContext): number;
//# sourceMappingURL=length.d.ts.map