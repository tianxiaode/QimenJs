"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.has = has;
/**
 * 检查指定名称的 Cookie 是否存在
 * @param {string} name - 要检查的 Cookie 名称
 * @returns {boolean} - 如果 Cookie 存在返回 true，否则返回 false
 */
function has(name) {
    if (!name) {
        return false;
    }
    // 使用正则表达式检查 Cookie 是否存在
    return new RegExp("(?:^|;\\s*)" +
        encodeURIComponent(name).replace(/[-.+*]/g, "\\$&") +
        "\\s*\\=").test(document.cookie);
}
//# sourceMappingURL=has.js.map