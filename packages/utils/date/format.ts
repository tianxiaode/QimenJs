/**
 * 格式化日期为指定格式的字符串
 * @param date 日期对象或日期字符串
 * @param format 日期格式字符串，支持以下占位符：
 * - yyyy: 四位年份
 * - yy: 两位年份
 * - MM: 两位月份
 * - M: 月份
 * - dd: 两位日期
 * - d: 日期
 * - HH: 两位小时（24小时制）
 * - H: 小时（24小时制）
 * - hh: 两位小时（12小时制）
 * - h: 小时（12小时制）
 * - mm: 两位分钟
 * - m: 分钟
 * - ss: 两位秒
 * - s: 秒
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, format: string): string {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    const isTwelveHourFormat = format.includes('hh');

    let formattedDate = format
        .replace('yyyy', year.toString())
        .replace('yy', year.toString().slice(2))
        .replace('MM', month)
        .replace('M', month.replace(/^0+/, ''))
        .replace('dd', day)
        .replace('d', day.replace(/^0+/, ''))
        .replace('HH', hours.toString().padStart(2, '0'))
        .replace('H', hours.toString())
        .replace('hh', (hours % 12 || 12).toString().padStart(2, '0'))
        .replace('h', (hours % 12 || 12).toString())
        .replace('mm', minutes)
        .replace('m', minutes.replace(/^0+/, ''))
        .replace('ss', seconds)
        .replace('s', seconds.replace(/^0+/, ''));

    if (isTwelveHourFormat) {
        formattedDate += hours >= 12 ? ' PM' : ' AM';
    }

    return formattedDate;
}

/**
 * 解析上下文接口，用于存储解析过程中的日期时间组件
 */
interface ParseContext {
    year: number;      // 年份
    month: number;     // 月份 (0-based)
    day: number;       // 日期
    hours: number;     // 小时
    minutes: number;   // 分钟
    seconds: number;   // 秒
    isPm: boolean;     // 是否为下午 (用于12小时制)
}

/**
 * 标记配置接口，定义每个日期时间标记的正则表达式和处理函数
 */
interface TokenConfig {
    regex: string;                                // 用于匹配该标记的正则表达式
    apply: (value: string, ctx: ParseContext) => void;  // 解析匹配值并更新解析上下文的函数
}

/**
 * 标记配置映射表，定义了所有支持的日期时间格式标记
 * 每个标记包含匹配的正则表达式和对应的处理函数
 */
const TOKEN_CONFIG: Record<string, TokenConfig> = {
    yyyy: {
        regex: '(\\d{4})',  // 4位数字年份
        apply: (v, ctx) => (ctx.year = +v),  // 将字符串转换为数字并赋值给年份
    },
    yy: {
        regex: '(\\d{2})',  // 2位数字年份
        apply: (v, ctx) => {
            const n = +v;
            // 2位年份转换规则：小于50的年份视为20xx，否则视为19xx
            ctx.year = n < 50 ? 2000 + n : 1900 + n;
        },
    },

    MM: {
        regex: '(\\d{2})',  // 2位数字月份
        apply: (v, ctx) => (ctx.month = +v - 1),  // 转换为数字并减1（因为月份是0索引）
    },
    M: {
        regex: '(\\d{1,2})',  // 1-2位数字月份
        apply: (v, ctx) => (ctx.month = +v - 1),  // 转换为数字并减1（因为月份是0索引）
    },

    dd: {
        regex: '(\\d{2})',  // 2位数字日期
        apply: (v, ctx) => (ctx.day = +v),  // 转换为数字并赋值给日期
    },
    d: {
        regex: '(\\d{1,2})',  // 1-2位数字日期
        apply: (v, ctx) => (ctx.day = +v),  // 转换为数字并赋值给日期
    },

    HH: {
        regex: '(\\d{2})',  // 2位数字小时（24小时制）
        apply: (v, ctx) => (ctx.hours = +v),  // 转换为数字并赋值给小时
    },
    H: {
        regex: '(\\d{1,2})',  // 1-2位数字小时（24小时制）
        apply: (v, ctx) => (ctx.hours = +v),  // 转换为数字并赋值给小时
    },

    hh: {
        regex: '(\\d{2})',  // 2位数字小时（12小时制）
        apply: (v, ctx) => (ctx.hours = +v),  // 转换为数字并赋值给小时
    },
    h: {
        regex: '(\\d{1,2})',  // 1-2位数字小时（12小时制）
        apply: (v, ctx) => (ctx.hours = +v),  // 转换为数字并赋值给小时
    },

    mm: {
        regex: '(\\d{2})',  // 2位数字分钟
        apply: (v, ctx) => (ctx.minutes = +v),  // 转换为数字并赋值给分钟
    },
    m: {
        regex: '(\\d{1,2})',  // 1-2位数字分钟
        apply: (v, ctx) => (ctx.minutes = +v),  // 转换为数字并赋值给分钟
    },

    ss: {
        regex: '(\\d{2})',  // 2位数字秒
        apply: (v, ctx) => (ctx.seconds = +v),  // 转换为数字并赋值给秒
    },
    s: {
        regex: '(\\d{1,2})',  // 1-2位数字秒
        apply: (v, ctx) => (ctx.seconds = +v),  // 转换为数字并赋值给秒
    },

    a: {
        regex: '(AM|PM|am|pm)',  // AM/PM指示符
        apply: (v, ctx) => (ctx.isPm = v.toLowerCase() === 'pm'),  // 判断是否为PM并更新上下文
    },
};

/**
 * 根据指定格式解析日期字符串为Date对象
 * @param date 日期字符串
 * @param format 日期格式字符串
 * @returns 解析后的Date对象，如果解析失败则返回null
 */
export function parse(date: string, format: string): Date | null {
    // 提取 format 中的 token
    const tokens = format.match(/(yyyy|yy|MM?|dd?|HH?|hh?|mm?|ss?|a)/g);
    if (!tokens) return null;

    // 用占位符避免正则冲突
    let regexStr = format;
    const placeholders: string[] = [];

    tokens.forEach((token, i) => {
        const ph = `__T${i}__`;
        placeholders.push(token);
        regexStr = regexStr.replace(token, ph);
    });

    // 转义非 token 的正则字符
    regexStr = regexStr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    // 替换回 token 对应的正则
    placeholders.forEach((token, i) => {
        regexStr = regexStr.replace(`__T${i}__`, TOKEN_CONFIG[token].regex);
    });

    const match = date.match(new RegExp(`^${regexStr}$`));
    if (!match) return null;

    // 初始化解析上下文
    const ctx: ParseContext = {
        year: new Date().getFullYear(),
        month: 0,
        day: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isPm: false,
    };

    // 应用 token 处理器
    tokens.forEach((token, i) => {
        TOKEN_CONFIG[token].apply(match[i + 1], ctx);
    });

    // 12 小时制修正
    if (tokens.includes('h') || tokens.includes('hh')) {
        if (ctx.isPm && ctx.hours < 12) ctx.hours += 12;
        if (!ctx.isPm && ctx.hours === 12) ctx.hours = 0;
    }

    return new Date(ctx.year, ctx.month, ctx.day, ctx.hours, ctx.minutes, ctx.seconds);
}