/**
 * 将毫秒转换为秒
 * @param ms 毫秒值
 * @returns 对应的秒值
 */
export function msToSec(ms: number): number {
    return ms / 1000;
}

/**
 * 将秒转换为毫秒
 * @param sec 秒值
 * @returns 对应的毫秒值
 */
export function secToMs(sec: number): number {
    return sec * 1000;
}
