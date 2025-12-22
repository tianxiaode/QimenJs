
/**
 * 检查值是否为空
 * @param value 值
 * @returns 是否为空
 */ 
export function isEmptyValue(value: any): boolean {
    if (value === '') return true;
    if (Array.isArray(value)) return value.length === 0;
    if (value instanceof Map || value instanceof Set) return value.size === 0;
    if (typeof value === 'object' && value !== null) {
        const type = Object.prototype.toString.call(value);
        if (type === '[object Object]') return Object.keys(value).length === 0;
    }
    return false;
}
