"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setJson = setJson;
/**
 * 设置 JSON 格式的 Cookie
 * @param {string} name - Cookie 名称
 * @param {any} value - 要存储的 JSON 值
 * @param {number | Date} [expires] - 过期时间，可以是秒数或 Date 对象
 * @param {string} [path='/'] - Cookie 路径
 * @param {string} [domain] - Cookie 域名
 * @param {boolean} [secure=false] - 是否仅通过 HTTPS 传输
 * @param {'Strict' | 'Lax' | 'None'} [sameSite='Lax'] - SameSite 属性
 * @returns {boolean} - 如果设置成功返回 true，否则返回 false
 */
function setJson(name, value, expires, path = '/', domain, secure = false, sameSite = 'Lax') {
    const jsonValue = JSON.stringify(value);
    return (0, set_1.set)(name, jsonValue, expires, path, domain, secure, sameSite);
}
const set_1 = require("./set");
//# sourceMappingURL=setJson.js.map