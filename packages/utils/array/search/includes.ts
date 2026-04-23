/**
 * 检查数组是否包含指定的值，支持按字段匹配对象
 * @template T 数组元素类型
 * @param {T[]} arr 要搜索的数组
 * @param {T} value 要查找的值
 * @param {keyof T} [field] 可选的字段名，当value是对象时，用于按该字段值进行匹配
 * @returns {boolean} 如果数组包含指定值则返回true，否则返回false
 */
export function includes<T>(arr: T[], value: T, field?: keyof T): boolean {
    if (arr.length === 0) {
        return false;
    }

    // 如果指定了字段且 value 是对象
    if (field && typeof value === 'object' && value !== null) {
        const fieldValue = (value as any)[field];
        return arr.some(item => item[field] === fieldValue);
    }

    // 简单值比较
    return arr.includes(value);
}