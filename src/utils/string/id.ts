/**
 * ID生成和唯一性处理工具函数
 */

let idSeed = 0;

/**
 * 生成唯一ID
 * @param prefix ID前缀，默认为"id"
 * @returns 生成的唯一ID字符串
 */
export function getId(prefix: string = "id"): string {
    if (typeof prefix !== "string") {
        throw new Error("Prefix must be a string");
    }
    return `${prefix}-${idSeed++}`;
}

/**
 * 空字符串的表示（非断开空格字符）
 */
export const emptyString = "\u00A0";

/**
 * 标准化语言代码
 * @param language 语言代码
 * @returns 标准化的语言代码
 */
export function normalizedLanguage(language: string) {
    if (language === "zh-Hans") language = "zh-CN";
    if (language === "zh-Hant") language = "zh-TW";
    return language;
}