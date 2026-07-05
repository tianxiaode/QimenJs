/**
 * 获取指定名称的 Cookie 值，并转换为布尔类型
 * @param {string} name - Cookie 名称
 * @param {boolean} [defaultValue=false] - 默认值，当 Cookie 不存在时返回
 * @returns {boolean} - Cookie 的布尔值，'true' 字符串（不区分大小写）转换为 true，其他值转换为 false
 */
export function getBoolean(name: string, defaultValue: boolean = false): boolean {
    const value = get(name);

    if (value === null) {
        return defaultValue;
    }

    // 将字符串值转换为布尔值，'true'（不区分大小写）为 true，其他为 false
    return value.toLowerCase() === 'true';
}

// 导入 get 函数，用于获取 Cookie 值
import { get } from './get';
