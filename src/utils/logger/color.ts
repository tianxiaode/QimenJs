// 重置颜色的ANSI转义序列
const RESET = '\x1b[0m';

// 定义不同日志级别的颜色映射
const COLORS: Record<string, string> = {
    DEBUG: '\x1b[90m',  // 灰色
    WARN: '\x1b[33m',   // 黄色
    ERROR: '\x1b[31m',  // 红色
};

/**
 * 为日志级别添加颜色
 * @param level - 日志级别字符串 (如 'DEBUG', 'WARN', 'ERROR')
 * @param enable - 是否启用颜色显示
 * @returns 如果启用了颜色，则返回带颜色的日志级别字符串；否则返回原始字符串
 */
export function colorLevel(level: string, enable: boolean) {
    if (!enable) return level;
    const color = COLORS[level];
    return color ? `${color}${level}${RESET}` : level;
}