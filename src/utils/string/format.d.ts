/**
 * 文本替换和格式化工具函数
 */
/**
 * 使用提供的选项对象替换字符串中的占位符
 * @param str 包含占位符的字符串
 * @param options 替换选项对象，键为占位符名称，值为替换内容
 * @returns 替换后的字符串
 */
export declare function replace(str: string, options: {
    [key: string]: string;
}): string;
/**
 * 替换字符串中所有匹配项
 * @param str 源字符串
 * @param search 要查找的字符串
 * @param replace 用于替换的字符串
 * @returns 替换后的字符串
 */
export declare function replaceAll(str: string, search: string, replace: string): string;
/**
 * 高亮文本中匹配的搜索词
 * @param text 原始文本
 * @param search 要高亮的搜索词
 * @param additionalClass 额外添加的CSS类名（可选），默认类名始终存在
 * @returns 包含高亮HTML标签的文本
 */
export declare function highlightText(text: string, search: string, additionalClass?: string): string;
/**
 * 将文本转换为HTML格式，每个换行使用P标签包裹
 * @param text 要转换的文本或文本数组
 * @param className 应用于段落的CSS类名
 * @returns 转换后的HTML字符串
 */
export declare function textToHtml(text: string | string[], className?: string): string;
/**
 * 将字符串按指定分隔符分割，并支持分隔符的转义
 * 例如：splitWithEscaping("a,b,,c,d", ",") => ["a", "b,c", "d"]
 * @param str 要分割的字符串
 * @param separator 分隔符
 * @returns 分割后的字符串数组
 */
export declare function splitWithEscaping(str: string, separator: string): string[];
//# sourceMappingURL=format.d.ts.map