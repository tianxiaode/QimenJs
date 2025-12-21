
/**
 * 检查值是否为空
 * @param value 值
 * @returns 是否为空
 * @example
 * isEmptyValue('') // true
 * isEmptyValue([]) // true
 * isEmptyValue(new Map()) // true
 * isEmptyValue(new Set()) // true
 * isEmptyValue({}) // true
 * isEmptyValue(null) // false
 * isEmptyValue(undefined) // false
 * isEmptyValue(0) // false
 * isEmptyValue('hello') // false
 * isEmptyValue(false) // false
 * isEmptyValue(true) // false
 * isEmptyValue(NaN) // false
 * isEmptyValue(Infinity) // false
 * isEmptyValue(Symbol()) // false
 * isEmptyValue(new Date()) // false
 * isEmptyValue(function() {}) // false
 * isEmptyValue(class A {}) // false
 * isEmptyValue(Promise.resolve()) // false
 * isEmptyValue(new Error()) // false
 * isEmptyValue(new Int8Array()) // false
 * isEmptyValue(new Uint8Array()) // false
 * isEmptyValue(new Uint8ClampedArray()) // false
 * isEmptyValue(new Int16Array()) // false
 * isEmptyValue(new Uint16Array()) // false
 */ 
export function isEmptyValue(value: any): boolean {
    if (value === '') return true;
    if (Array.isArray(value)) return value.length === 0;
    if (value instanceof Map || value instanceof Set) return value.size === 0;
    if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length === 0;
    }
    return false;
}
