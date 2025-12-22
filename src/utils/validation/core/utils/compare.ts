// 定义比较结果类型：-1表示小于，0表示等于，1表示大于，NaN表示无法比较
export type CompareResult = -1 | 0 | 1 | number;

// 可比较的数据类型定义
type Comparable = number | string | boolean | Date;

// 比较规则接口定义
export interface CompareRule {
    // 判断条件函数：确定两个值是否适用此规则
    when(a: unknown, b: unknown): boolean;
    // 比较函数：执行具体的比较操作
    compare(a: any, b: any): CompareResult;
}

/**
 * 验证是否为有效的日期对象
 * @param v 待验证的值
 * @returns 如果是有效日期返回true，否则返回false
 */
function isValidDate(v: unknown): v is Date {
    return v instanceof Date && !Number.isNaN(v.getTime());
}

/**
 * 判断值是否可比较
 * @param v 待判断的值
 * @returns 如果值属于可比较类型返回true，否则返回false
 */
function isComparable(v: unknown): v is Comparable {
    return (
        (typeof v === 'number' && !Number.isNaN(v)) ||
        typeof v === 'string' ||
        typeof v === 'boolean' ||
        isValidDate(v)
    );
}

/**
 * 数字比较函数
 * @param a 第一个数字
 * @param b 第二个数字
 * @returns 比较结果 (-1, 0, 1)
 */
const compareNumber = (a: number, b: number): CompareResult => (a === b ? 0 : a < b ? -1 : 1);

/**
 * 字符串比较函数
 * @param a 第一个字符串
 * @param b 第二个字符串
 * @returns 比较结果 (-1, 0, 1)
 */
const compareString = (a: string, b: string): CompareResult => (a === b ? 0 : a < b ? -1 : 1);

/**
 * 布尔值比较函数
 * @param a 第一个布尔值
 * @param b 第二个布尔值
 * @returns 比较结果 (-1, 0, 1)
 */
const compareBoolean = (a: boolean, b: boolean): CompareResult => (a === b ? 0 : a ? 1 : -1);

/**
 * 日期比较函数
 * @param a 第一个日期
 * @param b 第二个日期
 * @returns 比较结果 (-1, 0, 1)
 */
const compareDate = (a: Date, b: Date): CompareResult => {
    const diff = a.getTime() - b.getTime();
    return diff === 0 ? 0 : diff < 0 ? -1 : 1;
};

// 定义比较规则数组，按照优先级排序
const rules: CompareRule[] = [
    // 同类型比较规则
    // number ↔ number
    {
        when: (a, b) => typeof a === 'number' && typeof b === 'number',
        compare: compareNumber,
    },

    // string ↔ string
    {
        when: (a, b) => typeof a === 'string' && typeof b === 'string',
        compare: compareString,
    },

    // boolean ↔ boolean
    {
        when: (a, b) => typeof a === 'boolean' && typeof b === 'boolean',
        compare: compareBoolean,
    },

    // date ↔ date
    {
        when: (a, b) => a instanceof Date && b instanceof Date,
        compare: compareDate,
    },

    // 跨类型比较规则
    // string → number (字符串转数字比较)
    {
        when: (a, b) => typeof a === 'string' && typeof b === 'number',
        compare: (a: string, b: number) => {
            const n = Number(a);
            return Number.isNaN(n) ? NaN : compareNumber(n, b);
        },
    },

    // number → string (数字转字符串比较)
    {
        when: (a, b) => typeof a === 'number' && typeof b === 'string',
        compare: (a: number, b: string) => {
            const n = Number(b);
            return Number.isNaN(n) ? NaN : compareNumber(a, n);
        },
    },

    // date ↔ string | number (日期与字符串或数字比较)
    {
        when: (a, b) => a instanceof Date && (typeof b === 'string' || typeof b === 'number'),
        compare: (a: Date, b: string | number) => {
            const d = new Date(b);
            return Number.isNaN(d.getTime()) ? NaN : compareDate(a, d);
        },
    },

    {
        when: (a, b) => (typeof a === 'string' || typeof a === 'number') && b instanceof Date,
        compare: (a: string | number, b: Date) => {
            const d = new Date(a);
            return Number.isNaN(d.getTime()) ? NaN : compareDate(d, b);
        },
    },
];

/**
 * 应用比较规则
 * @param rules 规则数组
 * @param a 第一个比较值
 * @param b 第二个比较值
 * @returns 比较结果
 */
function applyRules(rules: CompareRule[], a: unknown, b: unknown): CompareResult {
    for (const rule of rules) {
        if (rule.when(a, b)) {
            return rule.compare(a, b);
        }
    }
    return NaN;
}

/**
 * 智能比较函数
 * @param a 第一个比较值
 * @param b 第二个比较值
 * @param strict 是否启用严格模式(默认true)
 * @returns 比较结果
 * 
 * 在严格模式下，只允许相同类型的值进行比较
 * 在宽松模式下，允许不同类型但可转换的值进行比较
 */
export function smartCompare(a: unknown, b: unknown, strict: boolean = true): CompareResult {
    // 入口封闭值域：检查输入值是否为可比较类型
    if (!isComparable(a) || !isComparable(b)) {
        return NaN;
    }

    // 严格模式：只允许同类型规则
    if (strict) {
        return applyRules(
            rules.filter(r => r.when(a, b) && typeof a === typeof b),
            a,
            b
        );
    }

    // 宽松模式：应用所有规则
    return applyRules(rules, a, b);
}