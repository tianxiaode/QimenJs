"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNumber = getNumber;
/**
 * 获取指定名称的 Cookie 值，并转换为数字类型
 * @param {string} name - Cookie 名称
 * @param {number} [defaultValue] - 默认值，当 Cookie 不存在或无法转换为数字时返回
 * @returns {number} - Cookie 的数字值，如果转换失败则返回默认值或 NaN
 */
function getNumber(name, defaultValue) {
    const value = (0, get_1.get)(name);
    if (value === null) {
        return defaultValue !== undefined ? defaultValue : NaN;
    }
    const num = Number(value);
    return isNaN(num) ? (defaultValue !== undefined ? defaultValue : NaN) : num;
}
// 导入 get 函数，用于获取 Cookie 值
const get_1 = require("./get");
//# sourceMappingURL=getNumber.js.map