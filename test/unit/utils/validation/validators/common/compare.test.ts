import { ValidationError, ValidationErrorCode } from "@/utils/validation/core";
import { validateCompare } from "@/utils/validation/validators";

describe('validateCompare', () => {
    describe('基本比较操作', () => {
        test('等于操作 (eq) - 数字相等应该通过验证', () => {
            const result = validateCompare(10, { operator: 'eq', target: 10 });
            expect(result).toBeNull();
        });

        test('等于操作 (eq) - 数字不等应该失败', () => {
            const result = validateCompare(5, { operator: 'eq', target: 10 });
            expect(result).not.toBeNull();
            expect(Array.isArray(result)).toBeTruthy();
            expect((result as ValidationError[])[0].code).toBe(ValidationErrorCode.CONDITION_FAILED);
        });

        test('不等于操作 (neq) - 数字不等应该通过验证', () => {
            const result = validateCompare(5, { operator: 'neq', target: 10 });
            expect(result).toBeNull();
        });

        test('不等于操作 (neq) - 数字相等应该失败', () => {
            const result = validateCompare(10, { operator: 'neq', target: 10 });
            expect(result).not.toBeNull();
            expect((result as ValidationError[])[0].code).toBe(ValidationErrorCode.CONDITION_FAILED);
        });

        test('大于操作 (gt) - 大于目标值应该通过验证', () => {
            const result = validateCompare(15, { operator: 'gt', target: 10 });
            expect(result).toBeNull();
        });

        test('大于操作 (gt) - 不大于目标值应该失败', () => {
            const result = validateCompare(5, { operator: 'gt', target: 10 });
            expect(result).not.toBeNull();
            expect((result as ValidationError[])[0].code).toBe(ValidationErrorCode.CONDITION_FAILED);
        });

        test('大于等于操作 (gte) - 等于目标值应该通过验证', () => {
            const result = validateCompare(10, { operator: 'gte', target: 10 });
            expect(result).toBeNull();
        });

        test('大于等于操作 (gte) - 大于目标值应该通过验证', () => {
            const result = validateCompare(15, { operator: 'gte', target: 10 });
            expect(result).toBeNull();
        });

        test('大于等于操作 (gte) - 小于目标值应该失败', () => {
            const result = validateCompare(5, { operator: 'gte', target: 10 });
            expect(result).not.toBeNull();
            expect((result as ValidationError[])[0].code).toBe(ValidationErrorCode.CONDITION_FAILED);
        });

        test('小于操作 (lt) - 小于目标值应该通过验证', () => {
            const result = validateCompare(5, { operator: 'lt', target: 10 });
            expect(result).toBeNull();
        });

        test('小于操作 (lt) - 不小于目标值应该失败', () => {
            const result = validateCompare(15, { operator: 'lt', target: 10 });
            expect(result).not.toBeNull();
            expect((result as ValidationError[])[0].code).toBe(ValidationErrorCode.CONDITION_FAILED);
        });

        test('小于等于操作 (lte) - 等于目标值应该通过验证', () => {
            const result = validateCompare(10, { operator: 'lte', target: 10 });
            expect(result).toBeNull();
        });

        test('小于等于操作 (lte) - 小于目标值应该通过验证', () => {
            const result = validateCompare(5, { operator: 'lte', target: 10 });
            expect(result).toBeNull();
        });

        test('小于等于操作 (lte) - 大于目标值应该失败', () => {
            const result = validateCompare(15, { operator: 'lte', target: 10 });
            expect(result).not.toBeNull();
            expect((result as ValidationError[])[0].code).toBe(ValidationErrorCode.CONDITION_FAILED);
        });
    });

    describe('字符串比较', () => {
        test('字符串等于比较应该正确工作', () => {
            const result = validateCompare('hello', { operator: 'eq', target: 'hello' });
            expect(result).toBeNull();
        });

        test('字符串大于比较应该正确工作', () => {
            const result = validateCompare('z', { operator: 'gt', target: 'a' });
            expect(result).toBeNull();
        });
    });

    describe('动态目标值', () => {
        test('使用函数作为目标值应该正确执行', () => {
            const targetFunction = jest.fn().mockReturnValue(10);
            const context = { field: 'testField' };
            
            const result = validateCompare(10, { operator: 'eq', target: targetFunction }, context);
            
            expect(targetFunction).toHaveBeenCalledWith(context);
            expect(result).toBeNull();
        });
    });

    describe('严格模式', () => {
        test('默认应该是严格模式', () => {
            const result = validateCompare('10', { operator: 'eq', target: 10 });
            expect(result).not.toBeNull();
        });

        test('非严格模式应该允许类型转换', () => {
            const result = validateCompare('10', { operator: 'eq', target: 10, strict: false });
            expect(result).toBeNull();
        });
    });

    describe('错误情况处理', () => {
        test('无法比较的值应该返回invalid_value错误', () => {
            const result = validateCompare({}, { operator: 'eq', target: 10 });
            expect(result).not.toBeNull();
            expect(Array.isArray(result)).toBeTruthy();
            expect((result as ValidationError[])[0].code).toBe(ValidationErrorCode.INVALID_VALUE);
        });

        test('默认规则应该正确应用', () => {
            const result = validateCompare(0, undefined);
            expect(result).toBeNull(); // 0 eq 0 应该通过
        });
    });

    describe('错误信息内容', () => {
        test('失败时应该包含正确的错误信息', () => {
            const result = validateCompare(5, { operator: 'gt', target: 10 }, { field: 'testField' }) as ValidationError[];
            
            expect(result).not.toBeNull();
            expect(result[0]).toHaveProperty('type', 'condition_failed');
            expect(result[0]).toHaveProperty('field', 'testField');
            expect(result[0]).toHaveProperty('details');
            expect(result[0].context).toHaveProperty('value', 5);
            expect(result[0].context).toHaveProperty('target', 10);
            expect(result[0].context).toHaveProperty('operator', 'gt');
        });
    });
});