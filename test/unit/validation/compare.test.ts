/**
 * smartCompare 智能比较函数测试
 *
 * 覆盖：
 * 1. 同类型比较（number/string/boolean/date）
 * 2. 跨类型比较（string↔number, date↔string/number）
 * 3. 严格模式 vs 宽松模式
 * 4. 不可比较类型返回 NaN
 */

import { smartCompare } from '@/validation/utils/compare';

describe('smartCompare', () => {
    describe('数字比较', () => {
        it('相等返回 0', () => {
            expect(smartCompare(1, 1, false)).toBe(0);
        });

        it('a < b 返回 -1', () => {
            expect(smartCompare(1, 2, false)).toBe(-1);
        });

        it('a > b 返回 1', () => {
            expect(smartCompare(2, 1, false)).toBe(1);
        });

        it('负数比较', () => {
            expect(smartCompare(-1, 1, false)).toBe(-1);
            expect(smartCompare(-1, -2, false)).toBe(1);
        });
    });

    describe('字符串比较', () => {
        it('相等返回 0', () => {
            expect(smartCompare('abc', 'abc', false)).toBe(0);
        });

        it('a < b 返回 -1', () => {
            expect(smartCompare('a', 'b', false)).toBe(-1);
        });

        it('a > b 返回 1', () => {
            expect(smartCompare('b', 'a', false)).toBe(1);
        });
    });

    describe('布尔值比较', () => {
        it('相等返回 0', () => {
            expect(smartCompare(true, true, false)).toBe(0);
            expect(smartCompare(false, false, false)).toBe(0);
        });

        it('true > false 返回 1', () => {
            expect(smartCompare(true, false, false)).toBe(1);
        });

        it('false < true 返回 -1', () => {
            expect(smartCompare(false, true, false)).toBe(-1);
        });
    });

    describe('日期比较', () => {
        it('相等返回 0', () => {
            const d = new Date('2024-01-01');
            expect(smartCompare(d, new Date('2024-01-01'), false)).toBe(0);
        });

        it('a < b 返回 -1', () => {
            expect(smartCompare(new Date('2024-01-01'), new Date('2024-12-31'), false)).toBe(-1);
        });

        it('a > b 返回 1', () => {
            expect(smartCompare(new Date('2024-12-31'), new Date('2024-01-01'), false)).toBe(1);
        });
    });

    describe('跨类型比较（宽松模式）', () => {
        it('string → number：可转换时比较数字', () => {
            expect(smartCompare('5', 3, false)).toBe(1);
            expect(smartCompare('3', 5, false)).toBe(-1);
            expect(smartCompare('5', 5, false)).toBe(0);
        });

        it('string → number：不可转换时返回 NaN', () => {
            expect(smartCompare('abc', 5, false)).toBeNaN();
        });

        it('number → string：可转换时比较数字', () => {
            expect(smartCompare(5, '3', false)).toBe(1);
            expect(smartCompare(3, '5', false)).toBe(-1);
        });

        it('number → string：不可转换时返回 NaN', () => {
            expect(smartCompare(5, 'abc', false)).toBeNaN();
        });

        it('date ↔ string：可解析时比较日期', () => {
            const d = new Date('2024-06-01');
            expect(smartCompare(d, '2024-01-01', false)).toBe(1);
            expect(smartCompare('2024-01-01', d, false)).toBe(-1);
        });

        it('date ↔ string：不可解析时返回 NaN', () => {
            const d = new Date('2024-06-01');
            expect(smartCompare(d, 'not-a-date', false)).toBeNaN();
            expect(smartCompare('not-a-date', d, false)).toBeNaN();
        });

        it('date ↔ number：数字作为时间戳比较', () => {
            const d = new Date('2024-06-01');
            const ts = d.getTime();
            expect(smartCompare(d, ts, false)).toBe(0);
            expect(smartCompare(ts, d, false)).toBe(0);
        });
    });

    describe('严格模式', () => {
        it('同类型正常比较', () => {
            expect(smartCompare(1, 2, true)).toBe(-1);
            expect(smartCompare('a', 'b', true)).toBe(-1);
        });

        it('跨类型返回 NaN', () => {
            expect(smartCompare('5', 3, true)).toBeNaN();
            expect(smartCompare(5, '3', true)).toBeNaN();
        });
    });

    describe('不可比较类型', () => {
        it('null 返回 NaN', () => {
            expect(smartCompare(null, 1, false)).toBeNaN();
            expect(smartCompare(1, null, false)).toBeNaN();
        });

        it('undefined 返回 NaN', () => {
            expect(smartCompare(undefined, 1, false)).toBeNaN();
        });

        it('NaN 返回 NaN', () => {
            expect(smartCompare(NaN, 1, false)).toBeNaN();
        });

        it('对象返回 NaN', () => {
            expect(smartCompare({}, 1, false)).toBeNaN();
        });

        it('无效日期返回 NaN', () => {
            expect(smartCompare(new Date('invalid'), 1, false)).toBeNaN();
        });

        it('数组返回 NaN', () => {
            expect(smartCompare([1], [2], false)).toBeNaN();
        });
    });
});
