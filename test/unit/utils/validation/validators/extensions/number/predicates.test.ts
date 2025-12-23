import { numberPredicates } from '@/utils/validation/validators/extensions/number/predicates';

describe('numberPredicates谓词函数测试', () => {
    describe('positive谓词测试', () => {
        it('当输入为正数时返回true', () => {
            const result = numberPredicates.positive(5);
            expect(result).toBe(true);
        });

        it('当输入为负数时返回false', () => {
            const result = numberPredicates.positive(-5);
            expect(result).toBe(false);
        });

        it('当输入为零时返回false', () => {
            const result = numberPredicates.positive(0);
            expect(result).toBe(false);
        });
    });

    describe('negative谓词测试', () => {
        it('当输入为负数时返回true', () => {
            const result = numberPredicates.negative(-5);
            expect(result).toBe(true);
        });

        it('当输入为正数时返回false', () => {
            const result = numberPredicates.negative(5);
            expect(result).toBe(false);
        });

        it('当输入为零时返回false', () => {
            const result = numberPredicates.negative(0);
            expect(result).toBe(false);
        });
    });

    describe('odd谓词测试', () => {
        it('当输入为奇数时返回true', () => {
            const result = numberPredicates.odd(7);
            expect(result).toBe(true);
        });

        it('当输入为偶数时返回false', () => {
            const result = numberPredicates.odd(8);
            expect(result).toBe(false);
        });

        it('当输入为小数时返回false', () => {
            const result = numberPredicates.odd(7.5);
            expect(result).toBe(false);
        });

        it('当输入为负奇数时返回true', () => {
            const result = numberPredicates.odd(-7);
            expect(result).toBe(true);
        });

        it('当输入为负偶数时返回false', () => {
            const result = numberPredicates.odd(-8);
            expect(result).toBe(false);
        });
    });

    describe('even谓词测试', () => {
        it('当输入为偶数时返回true', () => {
            const result = numberPredicates.even(8);
            expect(result).toBe(true);
        });

        it('当输入为奇数时返回false', () => {
            const result = numberPredicates.even(7);
            expect(result).toBe(false);
        });

        it('当输入为小数时返回false', () => {
            const result = numberPredicates.even(8.5);
            expect(result).toBe(false);
        });

        it('当输入为负偶数时返回true', () => {
            const result = numberPredicates.even(-8);
            expect(result).toBe(true);
        });

        it('当输入为负奇数时返回false', () => {
            const result = numberPredicates.even(-7);
            expect(result).toBe(false);
        });
    });

    describe('finite谓词测试', () => {
        it('当输入为有限数时返回true', () => {
            const result = numberPredicates.finite(100);
            expect(result).toBe(true);
        });

        it('当输入为正无穷时返回false', () => {
            const result = numberPredicates.finite(Infinity);
            expect(result).toBe(false);
        });

        it('当输入为负无穷时返回false', () => {
            const result = numberPredicates.finite(-Infinity);
            expect(result).toBe(false);
        });

        it('当输入为NaN时返回false', () => {
            const result = numberPredicates.finite(NaN);
            expect(result).toBe(false);
        });
    });

    describe('infinite谓词测试', () => {
        it('当输入为正无穷时返回true', () => {
            const result = numberPredicates.infinite(Infinity);
            expect(result).toBe(true);
        });

        it('当输入为负无穷时返回true', () => {
            const result = numberPredicates.infinite(-Infinity);
            expect(result).toBe(true);
        });

        it('当输入为有限数时返回false', () => {
            const result = numberPredicates.infinite(100);
            expect(result).toBe(false);
        });

        it('当输入为NaN时返回true（因为Number.isFinite(NaN)为false）', () => {
            const result = numberPredicates.infinite(NaN);
            expect(result).toBe(true);
        });
    });
});
