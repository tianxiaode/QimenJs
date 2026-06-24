"use strict";
/**
 * Base64编码解码工具函数
 * 提供字符串的Base64编码和解码功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = encode;
exports.decode = decode;
/**
 * 将字符串编码为Base64格式
 * @param str - 需要编码的字符串
 * @returns Base64编码的字符串
 */
function encode(str) {
    if (typeof str !== 'string') {
        throw new TypeError('Input must be a string');
    }
    // 如果在浏览器环境中，使用原生btoa函数
    if (typeof window !== 'undefined' && window.btoa) {
        // 对于非ASCII字符，需要先进行UTF-8编码
        const utf8Str = unescape(encodeURIComponent(str));
        return window.btoa(utf8Str);
    }
    // 如果在Node.js环境中，使用Buffer
    else if (typeof Buffer !== 'undefined') {
        const buffer = Buffer.from(str, 'utf8');
        return buffer.toString('base64');
    }
    // 否则使用纯JavaScript实现
    else {
        return encodeJavaScript(str);
    }
}
/**
 * 将Base64字符串解码为原始字符串
 * @param str - 需要解码的Base64字符串
 * @returns 解码后的原始字符串
 */
function decode(str) {
    if (typeof str !== 'string') {
        throw new TypeError('Input must be a string');
    }
    // 如果在浏览器环境中，使用原生atob函数
    if (typeof window !== 'undefined' && window.atob) {
        try {
            // 先解码Base64，然后处理UTF-8解码
            const utf8Str = window.atob(str);
            return decodeURIComponent(escape(utf8Str));
        }
        catch (e) {
            return '';
        }
    }
    // 如果在Node.js环境中，使用Buffer
    else if (typeof Buffer !== 'undefined') {
        try {
            const buffer = Buffer.from(str, 'base64');
            return buffer.toString('utf8');
        }
        catch (e) {
            return '';
        }
    }
    // 否则使用纯JavaScript实现
    else {
        return decodeJavaScript(str);
    }
}
/**
 * 纯JavaScript实现Base64编码
 * @param str - 需要编码的字符串
 * @returns Base64编码的字符串
 */
function encodeJavaScript(str) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let result = '';
    let i = 0;
    let char1, char2, char3;
    let enc1, enc2, enc3, enc4;
    while (i < str.length) {
        char1 = str.charCodeAt(i++);
        char2 = str.charCodeAt(i++);
        char3 = str.charCodeAt(i++);
        enc1 = char1 >> 2;
        enc2 = ((char1 & 3) << 4) | (char2 >> 4);
        enc3 = ((char2 & 15) << 2) | (char3 >> 6);
        enc4 = char3 & 63;
        if (isNaN(char2)) {
            enc3 = enc4 = 64;
        }
        else if (isNaN(char3)) {
            enc4 = 64;
        }
        result +=
            chars.charAt(enc1) +
                chars.charAt(enc2) +
                chars.charAt(enc3) +
                chars.charAt(enc4);
    }
    return result;
}
/**
 * 纯JavaScript实现Base64解码
 * @param str - 需要解码的Base64字符串
 * @returns 解码后的原始字符串
 */
function decodeJavaScript(str) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let result = '';
    let i = 0;
    let enc1, enc2, enc3, enc4;
    let code1, code2, code3, code4;
    // 移除非Base64字符并转换为大写
    str = str.replace(/[^A-Za-z0-9+/=]/g, '');
    while (i < str.length) {
        code1 = chars.indexOf(str.charAt(i++));
        code2 = chars.indexOf(str.charAt(i++));
        code3 = chars.indexOf(str.charAt(i++));
        code4 = chars.indexOf(str.charAt(i++));
        enc1 = (code1 << 2) | (code2 >> 4);
        enc2 = ((code2 & 15) << 4) | (code3 >> 2);
        enc3 = ((code3 & 3) << 6) | code4;
        result += String.fromCharCode(enc1);
        if (code3 !== 64) {
            result += String.fromCharCode(enc2);
        }
        if (code4 !== 64) {
            result += String.fromCharCode(enc3);
        }
    }
    return result;
}
// 默认导出
exports.default = {
    encode,
    decode
};
//# sourceMappingURL=base64.js.map