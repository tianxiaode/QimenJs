"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.msToSec = msToSec;
exports.secToMs = secToMs;
/**
 * 将毫秒转换为秒
 * @param ms 毫秒值
 * @returns 对应的秒值
 */
function msToSec(ms) {
    return ms / 1000;
}
/**
 * 将秒转换为毫秒
 * @param sec 秒值
 * @returns 对应的毫秒值
 */
function secToMs(sec) {
    return sec * 1000;
}
//# sourceMappingURL=time.js.map