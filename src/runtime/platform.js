"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatform = getPlatform;
/**
 * 检测当前代码运行的平台环境
 *
 * 通过检查全局对象来判断运行时环境：
 * - 如果 window 对象存在，则为浏览器环境
 * - 如果 process 对象存在，则为 Node.js 环境
 * - 否则返回 "unknown" 表示未知环境
 *
 * @returns {Platform} 返回检测到的平台类型
 */
function getPlatform() {
    if (typeof window !== "undefined")
        return "browser";
    if (typeof process !== "undefined")
        return "node";
    return "unknown";
}
//# sourceMappingURL=platform.js.map