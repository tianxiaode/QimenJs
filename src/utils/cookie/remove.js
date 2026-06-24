"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = remove;
const has_1 = require("./has");
/**
 * 删除指定名称的 Cookie
 * @param {string} name - 要删除的 Cookie 名称
 * @param {string} [path] - Cookie 的路径（可选）
 * @param {string} [domain] - Cookie 的域名（可选）
 * @param {boolean} [secure] - 是否仅通过 HTTPS 传输（可选）
 * @returns {boolean} - 如果成功删除返回 true，否则返回 false
 */
function remove(name, path, domain, secure) {
    if (!name || !(0, has_1.has)(name)) {
        return false;
    }
    // 设置过期时间为过去，以删除 Cookie
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT` +
        (path ? `; path=${path}` : '') +
        (domain ? `; domain=${domain}` : '') +
        (secure ? '; secure' : '');
    return !(0, has_1.has)(name);
}
//# sourceMappingURL=remove.js.map