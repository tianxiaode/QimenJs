import { validateContainsExtension, ValidationErrorContext } from '@/utils';

describe('validateContainsExtension函数测试', () => {
    it('当数组包含目标集合中的元素数量在指定范围内时验证通过', () => {
        const value = [1, 2, 3]; // 数组中有3个元素(1,2,3)在目标集合[0,1,2,3,4,5]中
        const rule = {
            target: [0, 1, 2, 3, 4, 5],
            minContains: 2,
            maxContains: 4,
            contains: false, // 设置为false，这样基础验证会通过（因为数组不会在目标集合中）
        };

        const result = validateContainsExtension(value, rule, {});

        // 基础验证通过，扩展验证也通过，因为数组中有3个元素在目标集合中，符合2-4的范围
        expect(result).toBeNull();
    });

    it('当数组包含目标集合中的元素数量少于最小值时返回错误', () => {
        const value = [5, 6, 7]; // 数组中只有1个元素(5)在目标集合[5,8,9]中
        const rule = {
            target: [5, 8, 9],
            minContains: 2,
            maxContains: 4,
            contains: false, // 设置为false，基础验证通过
        };

        const result = validateContainsExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('contains at least 2 items from target');
            expect(result[0].context?.actual).toBe(1);
        }
    });

    it('当数组包含目标集合中的元素数量超过最大值时返回错误', () => {
        const value = [1, 2, 3, 4, 5]; // 数组中有5个元素在目标集合[1,2,3,4,5,6]中
        const rule = {
            target: [1, 2, 3, 4, 5, 6],
            minContains: 1,
            maxContains: 3,
            contains: false, // 设置为false，基础验证通过
        };

        const result = validateContainsExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('contains at most 3 items from target');
            expect(result[0].context?.actual).toBe(5);
        }
    });

    it('当目标集合不是数组时返回错误', () => {
        const value = [1, 2, 3];
        const rule = { 
          target: [1, 2, 3], // 目标必须是数组或函数，不能是字符串
          contains: false
        };

        // 测试一个非数组的目标（通过函数返回非数组）
        const ruleWithFunctionReturningNonArray = { 
          target: () => 'not-an-array' as any, 
          minContains: 1, 
          maxContains: 3,
          contains: false
        };

        const result = validateContainsExtension(value, ruleWithFunctionReturningNonArray, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
          expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
          expect(result[0].context?.expectedType).toBe('array');
        }
    });

    it('当目标集合函数返回非数组时返回错误', () => {
      // 为了确保基础验证通过，我们需要一个函数，在第一次调用时返回一个使基础验证通过的值
      // 但validateContains中target是直接用于比较数组元素的，如果target是函数，
      // 它会在基础验证和扩展验证中都被调用
      let callCount = 0;
      const mockTargetFunction = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // 第一次调用时返回一个使基础验证通过的值
          return [1, 2, 3]; // 为了让基础验证通过
        } else {
          // 后续调用返回非数组值
          return 'not-an-array';
        }
      });

      const value = [1, 2, 3];
      const rule = { 
        target: mockTargetFunction,
        minContains: 1,
        maxContains: 3,
        contains: false  // 设置为false，这样基础验证会通过
      };

      const result = validateContainsExtension(value, rule, {});

      expect(result).not.toBeNull();
      if (result && result[0]) {
        expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        expect(result[0].context?.expectedType).toBe('array');
      }
    });

    it('当基础验证失败时返回基础验证的错误', () => {
        // 当contains为true时，如果数组不在目标集合中，则基础验证失败
        const value = [1, 2, 3]; // 整个数组不在目标集合[1,2,3,4,5]中
        const rule = {
            target: [1, 2, 3, 4, 5],
            minContains: 1,
            maxContains: 3,
            contains: true, // 设置为true，数组不在目标集合中，所以基础验证失败
        };

        const result = validateContainsExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_NOT_ALLOWED');
        }
    });

    it('当minContains和maxContains都未设置时验证通过', () => {
        const value = [1, 2, 3];
        const rule = {
            target: [1, 2, 3, 4, 5],
            contains: false, // 基础验证通过
        };

        const result = validateContainsExtension(value, rule, {});

        // 没有设置minContains和maxContains，所以扩展验证通过
        expect(result).toBeNull();
    });

    it('当只设置minContains时验证正确', () => {
        const value = [1, 2, 3];
        const rule = {
            target: [1, 2, 3, 4],
            minContains: 3, // 数组中有3个元素在目标集合中
            contains: false,
        };

        const result = validateContainsExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('当只设置maxContains时验证正确', () => {
        const value = [1, 5]; // 1个元素在目标集合[1,2,3,4]中
        const rule = {
            target: [1, 2, 3, 4],
            maxContains: 3,
            contains: false,
        };

        const result = validateContainsExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('当只设置minContains且数量不足时返回错误', () => {
        const value = [5, 6]; // 0个元素在目标集合[1,2,3,4]中
        const rule = {
            target: [1, 2, 3, 4],
            minContains: 2,
            contains: false,
        };

        const result = validateContainsExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('contains at least 2 items from target');
            expect(result[0].context?.actual).toBe(0);
        }
    });

    it('当只设置maxContains且数量超过时返回错误', () => {
        const value = [1, 2, 3, 4]; // 4个元素在目标集合[1,2,3,4]中
        const rule = {
            target: [1, 2, 3, 4],
            maxContains: 2,
            contains: false,
        };

        const result = validateContainsExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expected).toBe('contains at most 2 items from target');
            expect(result[0].context?.actual).toBe(4);
        }
    });

    it('当目标集合是函数时正确执行', () => {
        const value = [1, 2, 3];
        const rule = {
            target: () => [1, 2, 3, 4],
            minContains: 2,
            maxContains: 4,
            contains: false,
        };

        const result = validateContainsExtension(value, rule, {});

        expect(result).toBeNull();
    });

    it('当目标集合是函数且返回非数组时返回错误', () => {
        const value = [1, 2, 3];
        const rule = {
            target: (() => 'not-an-array') as any, // 强制转换类型以测试错误情况
            minContains: 2,
            maxContains: 4,
            contains: false,
        };

        const result = validateContainsExtension(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.expectedType).toBe('array');
        }
    });

    it('应该正确传递上下文信息', () => {
        const value = [5, 6, 7];
        const rule = {
            target: [1, 2, 3, 4],
            minContains: 2,
            maxContains: 4,
            contains: false,
        };
        const context: ValidationErrorContext = {
            field: 'testField',
            value,
        };

        const result = validateContainsExtension(value, rule, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
            expect(result[0].context.value).toBe(value);
        }
    });
});
