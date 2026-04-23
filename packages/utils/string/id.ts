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
    idSeed += 1;
    return `${prefix}-${Date.now()}-${idSeed}`;
}

/**
 * 生成分布式追踪ID (traceId)
 * @returns 生成的唯一追踪ID字符串，格式为16位十六进制字符串
 */
export function generateTraceId(): string {
    // 生成16位十六进制字符串作为traceId
    return Array.from({ length: 16 }, () => 
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
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