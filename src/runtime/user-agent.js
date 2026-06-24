"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAgent = getUserAgent;
/**
 * 获取当前浏览器的用户代理字符串
 *
 * 如果在浏览器环境中，返回 navigator.userAgent 的值
 * 如果不在浏览器环境中（如 Node.js），则返回空字符串
 *
 * @returns {string} 用户代理字符串，如果不在浏览器环境中则返回空字符串
 */
function getUserAgent() {
    return typeof navigator !== "undefined"
        ? navigator.userAgent
        : "";
}
//# sourceMappingURL=user-agent.js.map