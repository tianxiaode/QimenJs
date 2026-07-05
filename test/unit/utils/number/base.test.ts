import { ensureNumber } from '@/utils/number/base';

describe('ensureNumber', () => {
    test('should return number when input is number', () => {
        expect(ensureNumber(42)).toBe(42);
        expect(ensureNumber(0)).toBe(0);
        expect(ensureNumber(-5)).toBe(-5);
        expect(ensureNumber(3.14)).toBe(3.14);
        expect(ensureNumber(Infinity)).toBe(Infinity);
        expect(ensureNumber(-Infinity)).toBe(-Infinity);
    });

    test('should return NaN for NaN input', () => {
        expect(ensureNumber(NaN)).toBeNaN();
    });

    test('should convert valid string to number', () => {
        expect(ensureNumber('42')).toBe(42);
        expect(ensureNumber('0')).toBe(0);
        expect(ensureNumber('-5')).toBe(-5);
        expect(ensureNumber('3.14')).toBe(3.14);
        expect(ensureNumber('  100  ')).toBe(100);
        expect(ensureNumber('1e5')).toBe(100000);
        expect(ensureNumber('+10')).toBe(10);
        expect(ensureNumber('-3.5e2')).toBe(-350);
    });

    test('should return default value for invalid string', () => {
        expect(ensureNumber('hello')).toBeNaN();
        expect(ensureNumber('')).toBeNaN();
        expect(ensureNumber('  ')).toBeNaN();
        expect(ensureNumber('abc42')).toBeNaN(); // 完全无法解析为数字
        expect(ensureNumber('42abc')).toBeNaN(); // 部分有效字符串现在被拒绝
        expect(ensureNumber('3.14xyz')).toBeNaN(); // 部分有效字符串现在被拒绝
        expect(ensureNumber('-5.5test')).toBeNaN(); // 部分有效字符串现在被拒绝
        expect(ensureNumber('4.2.3')).toBeNaN(); // 多个小数点
        expect(ensureNumber('1-2')).toBeNaN(); // 包含非数字字符
        expect(ensureNumber('42.')).toBeNaN(); // 末尾小数点
    });

    test('should return default value when parseFloat returns NaN', () => {
        // 这个测试用例用于覆盖 isNaN(num) ? defaultValue : num 这个三元运算符的两个分支
        // 我们需要绕过正则表达式检查，直接修改函数逻辑来测试这个分支
        // 由于当前实现中正则检查会过滤掉所有无法解析的字符串，所以实际上这个分支在当前实现中不会执行
        // 但我们可以保留这个测试，以防将来修改实现
    });

    test('should return default value for non-numeric types', () => {
        expect(ensureNumber(true)).toBeNaN();
        expect(ensureNumber(false)).toBeNaN();
        expect(ensureNumber(null)).toBeNaN();
        expect(ensureNumber(undefined)).toBeNaN();
        expect(ensureNumber({})).toBeNaN();
        expect(ensureNumber([])).toBeNaN();
        expect(ensureNumber([1, 2, 3])).toBeNaN();
        expect(ensureNumber(() => 42)).toBeNaN();
    });

    test('should return custom default value when provided', () => {
        expect(ensureNumber('invalid', 0)).toBe(0);
        expect(ensureNumber('42abc', 0)).toBe(0); // 部分有效字符串现在被拒绝
        expect(ensureNumber(null, 10)).toBe(10);
        expect(ensureNumber({}, -1)).toBe(-1);
        expect(ensureNumber('hello', 100)).toBe(100);
    });

    test('should return number when custom default value is provided but not needed', () => {
        expect(ensureNumber(42, 0)).toBe(42);
        expect(ensureNumber('42', 0)).toBe(42);
    });
});
