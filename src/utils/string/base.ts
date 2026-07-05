/**
 * 字符串基础操作工具函数
 */

/**
 * 去除字符串首尾空格
 * @param str 输入字符串
 * @returns 去除首尾空格后的字符串
 */
export function trim(str: string): string {
    return str.trim();
}

/**
 * 将字符串首字母大写
 * @param str 输入字符串
 * @returns 首字母大写的字符串
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 将字符串首字母小写
 * @param str 输入字符串
 * @returns 首字母小写的字符串
 */
export function uncapitalize(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * 将字符串转换为驼峰命名法
 * @param str 输入字符串
 * @returns 驼峰命名的字符串
 */
export function camelCase(str: string): string {
    // 将字符串转换为小写并按空格、连字符、下划线分割
    if (!str.includes('-') && !str.includes('_') && !str.includes(' ')) return uncapitalize(str);
    const words = str.toLowerCase().split(/[-_\s]+/);
    let result = '';

    for (let i = 0; i < words.length; i++) {
        const word = words[i].toLocaleLowerCase();
        if (i === 0) {
            result += word; // 第一个单词保持小写
        } else {
            result += capitalize(word);
        }
    }

    return result;
}

/**
 * 将驼峰式命名的字符串转换为连接符命名的全小写字符串
 * @param str 输入的驼峰式字符串
 * @returns 用连接符分隔的全小写字符串
 */
export function camelCaseToDash(str: string): string {
    let result = str.replace(/([A-Z])/g, '-$1').toLowerCase();
    if (result.startsWith('-')) result = result.slice(1);
    return result;
}
