/**
 * 获取指定日期的季度
 * @param date 指定日期
 * @returns 季度（1-4）
 */
export function getQuarter(date: Date | string): number {
    const d = new Date(date);
    return Math.floor((d.getMonth() + 3) / 3);
}
