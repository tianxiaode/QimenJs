"use strict";
/**
 * 文本替换和格式化工具函数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.replace = replace;
exports.replaceAll = replaceAll;
exports.highlightText = highlightText;
exports.textToHtml = textToHtml;
exports.splitWithEscaping = splitWithEscaping;
/**
 * 使用提供的选项对象替换字符串中的占位符
 * @param str 包含占位符的字符串
 * @param options 替换选项对象，键为占位符名称，值为替换内容
 * @returns 替换后的字符串
 */
function replace(str, options) {
    for (const key in options) {
        if (options.hasOwnProperty(key)) {
            const value = options[key];
            str = replaceAll(str, `{${key}}`, value);
        }
    }
    return str;
}
/**
 * 替换字符串中所有匹配项
 * @param str 源字符串
 * @param search 要查找的字符串
 * @param replace 用于替换的字符串
 * @returns 替换后的字符串
 */
function replaceAll(str, search, replace) {
    // 转义特殊正则字符，然后创建大小写不敏感的正则表达式
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return str.replace(new RegExp(escapedSearch, "gi"), replace);
}
/**
 * 高亮文本中匹配的搜索词
 * @param text 原始文本
 * @param search 要高亮的搜索词
 * @param additionalClass 额外添加的CSS类名（可选），默认类名始终存在
 * @returns 包含高亮HTML标签的文本
 */
function highlightText(text, search, additionalClass = "") {
    // 如果text为空，则直接返回原文本
    if (!text)
        return text;
    // 转义特殊正则字符，然后创建大小写不敏感的正则表达式
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // 创建正则表达式，忽略大小写
    const regex = new RegExp(`(${escapedSearch})`, "gi");
    // 合并默认类名和额外类名
    const defaultClass = "text-danger font-bold";
    const combinedClass = additionalClass ? `${defaultClass} ${additionalClass}` : defaultClass;
    // 替换匹配的文本，并添加高亮 HTML
    return text.replace(regex, (match) => `<span class="${combinedClass}">${match}</span>`);
}
/**
 * 将文本转换为HTML格式，每个换行使用P标签包裹
 * @param text 要转换的文本或文本数组
 * @param className 应用于段落的CSS类名
 * @returns 转换后的HTML字符串
 */
function textToHtml(text, className = "") {
    if (Array.isArray(text)) {
        return text.map((t) => textToHtml(t, className)).join("");
    }
    return (`<p class="${className}">` +
        text.replace(/\n/g, `</p><p class="${className}">`) +
        "</p>");
}
/**
 * 将字符串按指定分隔符分割，并支持分隔符的转义
 * 例如：splitWithEscaping("a,b,,c,d", ",") => ["a", "b,c", "d"]
 * @param str 要分割的字符串
 * @param separator 分隔符
 * @returns 分割后的字符串数组
 */
function splitWithEscaping(str, separator) {
    // 此函数用于将字符串按指定分隔符分割，并支持分隔符的转义
    if (separator === "")
        return [str];
    // 首先替换所有转义分隔符（两个连续的分隔符）为临时标记
    const escapedSeparator = separator + separator;
    const tempMarker = '\u0001'; // 使用一个不太可能出现在普通文本中的字符作为临时标记
    let processedStr = str;
    let index = 0;
    // 替换所有转义分隔符为临时标记
    while ((index = processedStr.indexOf(escapedSeparator, index)) !== -1) {
        processedStr = processedStr.substring(0, index) +
            tempMarker +
            processedStr.substring(index + escapedSeparator.length);
        // 移动索引到替换后的位置之后，避免重复匹配
        index++;
    }
    // 按正常分隔符分割字符串
    const parts = processedStr.split(separator);
    // 将临时标记替换回实际的分隔符字符
    return parts.map(part => part.replace(new RegExp(tempMarker, 'g'), separator));
}
//# sourceMappingURL=format.js.map