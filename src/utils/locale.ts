/**
 * 从浏览器的 navigator 对象中获取当前语言环境
 * 
 * 此函数尝试获取浏览器的首选语言设置，如果无法获取，则返回默认的中文语言环境 'zh-CN'
 * 使用可选链操作符确保在非浏览器环境或 navigator 不可用时不会出错
 * 
 * @returns {string} 浏览器的语言环境字符串，例如 'zh-CN'、'en-US' 等
 *                   如果无法获取浏览器语言环境，则返回默认值 'zh-CN'
 */
export function getLocaleFromNavigator(): string {
    return navigator?.language || 'zh-CN';
}