"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureNumber = ensureNumber;
/**
 * 确保返回一个数字
 * @param {any} value - 需要确保是数字的值
 * @param {number} [defaultValue=NaN] - 如果值不能转换为数字时的默认值
 * @returns {number} - 确保为数字的返回值
 */
function ensureNumber(value, defaultValue = NaN) {
    // 如果值是数字，直接返回
    if (typeof value === 'number') {
        return value;
    }
    // 如果值是字符串，尝试将其转换为数字
    if (typeof value === 'string') {
        // 使用更严格的数字检查，确保字符串是完全有效的数字
        // 这种方式会拒绝 "42abc" 这类部分有效的字符串
        if (/^[+-]?\d*\.?\d+(?:[eE][+-]?\d+)?$/.test(value.trim())) {
            const num = parseFloat(value);
            return isNaN(num) ? defaultValue : num;
        }
        return defaultValue;
    }
    // 对其他类型的值，如果不能转换，返回默认值
    return defaultValue;
}
//# sourceMappingURL=base.js.map