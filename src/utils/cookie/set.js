"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.set = set;
/**
 * 设置 Cookie
 * @param {string} name - Cookie 名称
 * @param {any} value - Cookie 值
 * @param {number | Date} [expires] - 过期时间，可以是秒数或 Date 对象
 * @param {string} [path='/'] - Cookie 路径
 * @param {string} [domain] - Cookie 域名
 * @param {boolean} [secure=false] - 是否仅通过 HTTPS 传输
 * @param {'Strict' | 'Lax' | 'None'} [sameSite='Lax'] - SameSite 属性
 * @returns {boolean} - 如果设置成功返回 true，否则返回 false
 */
function set(name, value, expires, path = '/', domain, secure = false, sameSite = 'Lax') {
    // 验证名称是否有效
    if (!name) {
        return false;
    }
    // 构建 Cookie 字符串
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    // 设置过期时间
    if (expires) {
        if (typeof expires === 'number') {
            // 如果是数字，表示秒数
            const date = new Date();
            date.setTime(date.getTime() + expires * 1000);
            cookieString += `; expires=${date.toUTCString()}`;
        }
        else if (expires instanceof Date) {
            // 如果是 Date 对象
            cookieString += `; expires=${expires.toUTCString()}`;
        }
    }
    // 设置路径
    if (path) {
        cookieString += `; path=${path}`;
    }
    // 设置域名
    if (domain) {
        cookieString += `; domain=${domain}`;
    }
    // 设置安全标志
    if (secure) {
        cookieString += '; secure';
    }
    // 设置 SameSite 属性
    cookieString += `; samesite=${sameSite}`;
    // 设置 Cookie
    document.cookie = cookieString;
    // 验证是否设置成功 - 直接使用 document.cookie 检查
    const cookieValue = (decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" +
        encodeURIComponent(name).replace(/[-.+*]/g, "\\$&") +
        "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null);
    return cookieValue === encodeURIComponent(value);
}
//# sourceMappingURL=set.js.map