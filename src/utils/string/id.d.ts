/**
 * ID生成和唯一性处理工具函数
 */
/**
 * 生成唯一ID
 * @param prefix ID前缀，默认为"id"
 * @returns 生成的唯一ID字符串
 */
export declare function getId(prefix?: string): string;
/**
 * 生成分布式追踪ID (traceId)
 * @returns 生成的唯一追踪ID字符串，格式为16位十六进制字符串
 */
export declare function generateTraceId(): string;
/**
 * 空字符串的表示（非断开空格字符）
 */
export declare const emptyString = "\u00A0";
/**
 * 标准化语言代码
 * @param language 语言代码
 * @returns 标准化的语言代码
 */
export declare function normalizedLanguage(language: string): string;
//# sourceMappingURL=id.d.ts.map