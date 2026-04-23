/**
 * 获取当前时间
 * @returns 当前时间的Date对象
 */
export function now(): Date {
    return new Date();
}

/**
 * 获取今天日期（时间部分归零）
 * @returns 今天日期的Date对象，时间部分为00:00:00.000
 */
export function today(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * 获取昨天日期（时间部分归零）
 * @returns 昨天日期的Date对象，时间部分为00:00:00.000
 */
export function yesterday(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * 获取明天日期（时间部分归零）
 * @returns 明天日期的Date对象，时间部分为00:00:00.000
 */
export function tomorrow(): Date {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * 获取本周开始日期（时间部分归零）
 * @returns 本周开始日期的Date对象，时间部分为00:00:00.000
 */
export function thisWeek(): Date {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * 获取本月开始日期（时间部分归零）
 * @returns 本月开始日期的Date对象，时间部分为00:00:00.000
 */
export function thisMonth(): Date {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * 获取本年开始日期（时间部分归零）
 * @returns 本年开始日期的Date对象，时间部分为00:00:00.000
 */
export function thisYear(): Date {
    const d = new Date();
    d.setMonth(0);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * 计算年龄
 * @param dateOfBirth 出生日期
 * @returns 年龄
 */
export const calculateAge = (dateOfBirth: string | Date) => {
    const birthDate = new Date(dateOfBirth);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDateResult = new Date(ageDifMs);
    return Math.abs(ageDateResult.getUTCFullYear() - 1970);
};

/**
 * 将时间跨度字符串解析为秒数
 * @param timeSpan 时间跨度字符串，格式为 d.hh:mm:ss 或 hh:mm:ss
 * @returns 对应的总秒数
 */
export function parseTimeSpanToSeconds(timeSpan: string): number {
    // 匹配 d.hh:mm:ss 或 hh:mm:ss 格式
    const timeSpanPattern = /^(?:(\d+)\.)?(\d{1,2}):(\d{2}):(\d{2})$/;
    const match = timeSpan.match(timeSpanPattern);

    if (!match) {
        throw new Error('Invalid TimeSpan format');
    }

    // 提取天、小时、分钟和秒的值
    const days = parseInt(match[1] || '0', 10);
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);
    const seconds = parseInt(match[4], 10);

    // 计算总秒数
    return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

/**
 * 将秒数转换为时间跨度字符串
 * @param seconds 总秒数
 * @returns 时间跨度字符串，格式为 d.hh:mm:ss
 */
export function convertSecondsToTimeSpan(seconds: number) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds %= 24 * 60 * 60;
    const hours = Math.floor(seconds / (60 * 60));
    seconds %= 60 * 60;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    return `${days}.${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
