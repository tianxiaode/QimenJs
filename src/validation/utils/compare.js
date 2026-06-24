"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartCompare = smartCompare;
/**
 * 验证是否为有效的日期对象
 * @param v 待验证的值
 * @returns 如果是有效日期返回true，否则返回false
 */
function isValidDate(v) {
    return v instanceof Date && !Number.isNaN(v.getTime());
}
/**
 * 判断值是否可比较
 * @param v 待判断的值
 * @returns 如果值属于可比较类型返回true，否则返回false
 */
function isComparable(v) {
    return ((typeof v === 'number' && !Number.isNaN(v)) ||
        typeof v === 'string' ||
        typeof v === 'boolean' ||
        isValidDate(v));
}
/**
 * 数字比较函数
 * @param a 第一个数字
 * @param b 第二个数字
 * @returns 比较结果 (-1, 0, 1)
 */
const compareNumber = (a, b) => (a === b ? 0 : a < b ? -1 : 1);
/**
 * 字符串比较函数
 * @param a 第一个字符串
 * @param b 第二个字符串
 * @returns 比较结果 (-1, 0, 1)
 */
const compareString = (a, b) => (a === b ? 0 : a < b ? -1 : 1);
/**
 * 布尔值比较函数
 * @param a 第一个布尔值
 * @param b 第二个布尔值
 * @returns 比较结果 (-1, 0, 1)
 */
const compareBoolean = (a, b) => (a === b ? 0 : a ? 1 : -1);
/**
 * 日期比较函数
 * @param a 第一个日期
 * @param b 第二个日期
 * @returns 比较结果 (-1, 0, 1)
 */
const compareDate = (a, b) => {
    const diff = a.getTime() - b.getTime();
    return diff === 0 ? 0 : diff < 0 ? -1 : 1;
};
// 定义比较规则数组，按照优先级排序
const rules = [
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
        compare: (a, b) => {
            const n = Number(a);
            return Number.isNaN(n) ? NaN : compareNumber(n, b);
        },
    },
    // number → string (数字转字符串比较)
    {
        when: (a, b) => typeof a === 'number' && typeof b === 'string',
        compare: (a, b) => {
            const n = Number(b);
            return Number.isNaN(n) ? NaN : compareNumber(a, n);
        },
    },
    // date ↔ string | number (日期与字符串或数字比较)
    {
        when: (a, b) => a instanceof Date && (typeof b === 'string' || typeof b === 'number'),
        compare: (a, b) => {
            const d = new Date(b);
            return Number.isNaN(d.getTime()) ? NaN : compareDate(a, d);
        },
    },
    {
        when: (a, b) => (typeof a === 'string' || typeof a === 'number') && b instanceof Date,
        compare: (a, b) => {
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
function applyRules(rules, a, b) {
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
function smartCompare(a, b, strict = true) {
    // 入口封闭值域：检查输入值是否为可比较类型
    if (!isComparable(a) || !isComparable(b)) {
        return NaN;
    }
    // 严格模式：只允许同类型规则
    if (strict) {
        return applyRules(rules.filter(r => r.when(a, b) && typeof a === typeof b), a, b);
    }
    // 宽松模式：应用所有规则
    return applyRules(rules, a, b);
}
//# sourceMappingURL=compare.js.map