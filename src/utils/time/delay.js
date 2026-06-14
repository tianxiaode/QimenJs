"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = delay;
/**
 * 返回一个Promise，在指定的毫秒数后解析
 *
 * @param ms - 延迟的毫秒数
 * @returns Promise<void> 在指定时间后解析的Promise
 */
function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, Math.max(0, ms));
    });
}
//# sourceMappingURL=delay.js.map