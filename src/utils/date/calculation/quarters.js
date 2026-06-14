"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuarter = getQuarter;
/**
 * 获取指定日期的季度
 * @param date 指定日期
 * @returns 季度（1-4）
 */
function getQuarter(date) {
    const d = new Date(date);
    return Math.floor((d.getMonth() + 3) / 3);
}
//# sourceMappingURL=quarters.js.map