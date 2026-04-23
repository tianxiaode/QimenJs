/**
 * 获取当前浏览器的语言环境
 * 
 * 优先使用标准的 navigator.language 属性，如果不可用，则尝试使用非标准的
 * (navigator as any).userLanguage 属性，最后返回默认的 "zh-CN" 作为备选
 * 
 * @returns {string} 浏览器语言环境字符串，例如 "zh-CN"、"en-US" 等
 */
export function getLocale(): string {
    return (
        navigator.language ||
        (navigator as any).userLanguage ||
        "zh-CN"
    );
}