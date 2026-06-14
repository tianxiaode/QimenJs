/**
 * Base64编码解码工具函数
 * 提供字符串的Base64编码和解码功能
 */
/**
 * 将字符串编码为Base64格式
 * @param str - 需要编码的字符串
 * @returns Base64编码的字符串
 */
export declare function encode(str: string): string;
/**
 * 将Base64字符串解码为原始字符串
 * @param str - 需要解码的Base64字符串
 * @returns 解码后的原始字符串
 */
export declare function decode(str: string): string;
declare const _default: {
    encode: typeof encode;
    decode: typeof decode;
};
export default _default;
//# sourceMappingURL=base64.d.ts.map