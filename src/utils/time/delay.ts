/**
 * 返回一个Promise，在指定的毫秒数后解析
 *
 * @param ms - 延迟的毫秒数
 * @returns Promise<void> 在指定时间后解析的Promise
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, Math.max(0, ms));
    });
}
