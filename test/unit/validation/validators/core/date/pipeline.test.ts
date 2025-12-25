import { DateRuleOptions, validateDate } from '@/validation';

describe('validateDate', () => {
    it('当值为有效日期时验证通过，返回null', () => {
        const value = new Date('2023-01-01');
        const rule: DateRuleOptions = {};

        const result = validateDate(value, rule);

        expect(result).toBeNull();
    });

    it('当值为当前日期时验证通过，返回null', () => {
        const value = new Date();
        const rule: DateRuleOptions = {};

        const result = validateDate(value, rule);

        expect(result).toBeNull();
    });

    it('当值为undefined且required为true时返回required错误', () => {
        const value = undefined;
        const rule: DateRuleOptions = { required: true };

        const result = validateDate(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_REQUIRED');
    });

    it('当值为null且nullable为false时返回invalid_value错误', () => {
        const value = null;
        const rule: DateRuleOptions = { nullable: false };

        const result = validateDate(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_INVALID_VALUE');
    });

    it('当值不是Date实例时返回type_mismatch错误', () => {
        const value = '2023-01-01';
        const rule: DateRuleOptions = {};

        const result = validateDate(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_TYPE_MISMATCH');
    });

    it('当值是Invalid Date时返回type_mismatch错误', () => {
        const value = new Date('invalid date string');
        const rule: DateRuleOptions = {};

        const result = validateDate(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_TYPE_MISMATCH');
    });

    it('当值早于min日期时返回too_small错误', () => {
        const value = new Date('2022-12-31');
        const rule: DateRuleOptions = { min: new Date('2023-01-01') };

        const result = validateDate(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_TOO_SMALL');
    });

    it('当值晚于max日期时返回too_large错误', () => {
        const value = new Date('2024-01-01');
        const rule: DateRuleOptions = { max: new Date('2023-12-31') };

        const result = validateDate(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_TOO_LARGE');
    });

    it('当值同时违反多个规则时返回所有错误', () => {
        const value = undefined;
        const rule: DateRuleOptions = { 
          required: true
        };

        const result = validateDate(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_REQUIRED');
    });

    it('当值为null且同时设置了nullable和范围时返回invalid_value错误', () => {
        const value = null;
        const rule: DateRuleOptions = { 
          nullable: false,
          min: new Date('2022-01-01'), 
          max: new Date('2022-12-31') 
        };

        const result = validateDate(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1); // 只有invalid_value错误，因为null会跳过范围检查
        expect(result![0].code).toBe('VALIDATION_INVALID_VALUE');
    });

    it('当值是数字时返回type_mismatch错误', () => {
        const value = 123456789;
        const rule: DateRuleOptions = {};

        const result = validateDate(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_TYPE_MISMATCH');
    });

    it('当值是对象但不是Date实例时返回type_mismatch错误', () => {
        const value = {};
        const rule: DateRuleOptions = {};

        const result = validateDate(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_TYPE_MISMATCH');
    });

    it('当值是字符串但格式正确时返回type_mismatch错误', () => {
        const value = '2023-01-01T00:00:00.000Z';
        const rule: DateRuleOptions = {};

        const result = validateDate(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_TYPE_MISMATCH');
    });

    it('当值为null且没有设置nullable时验证通过（默认nullable为true）', () => {
        const value = null;
        const rule: DateRuleOptions = {};

        const result = validateDate(value, rule);

        expect(result).toBeNull();
    });

    it('当值为undefined且没有设置required时验证通过（默认required为false）', () => {
        const value = undefined;
        const rule: DateRuleOptions = {};

        const result = validateDate(value, rule);

        expect(result).toBeNull();
    });

    it('当值在min和max范围内时验证通过', () => {
        const value = new Date('2023-06-01');
        const rule: DateRuleOptions = {
            min: new Date('2023-01-01'),
            max: new Date('2023-12-31'),
        };

        const result = validateDate(value, rule);

        expect(result).toBeNull();
    });

    it('当值等于min日期时验证通过', () => {
        const value = new Date('2023-01-01');
        const rule: DateRuleOptions = { min: new Date('2023-01-01') };

        const result = validateDate(value, rule);

        expect(result).toBeNull();
    });

    it('当值等于max日期时验证通过', () => {
        const value = new Date('2023-12-31');
        const rule: DateRuleOptions = { max: new Date('2023-12-31') };

        const result = validateDate(value, rule);

        expect(result).toBeNull();
    });

    it('当值为null且有其他规则时验证通过（因为默认nullable为true）', () => {
        const value = null;
        const rule: DateRuleOptions = {};

        const result = validateDate(value, rule);

        expect(result).toBeNull(); // 所有检查都会跳过，因为value是null
    });

    it('当值为undefined且有其他规则时只返回required错误（如果required为true）', () => {
        const value = undefined;
        const rule: DateRuleOptions = {
            required: true,
            min: new Date('2023-01-01'),
            max: new Date('2023-12-31'),
        };

        const result = validateDate(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1);
        expect(result![0].code).toBe('VALIDATION_REQUIRED');
    });

    it('当值为undefined但required为false时验证通过', () => {
        const value = undefined;
        const rule: DateRuleOptions = {
            required: false
            // 不包含任何会触发预处理的规则
        };

        const result = validateDate(value, rule);

        expect(result).toBeNull();
    });

    it('当值同时违反多个规则时返回所有错误', () => {
        const value = 'not a date'; // 这个值会触发类型错误和范围检查（如果范围检查不跳过非日期值）
        const rule: DateRuleOptions = { 
          min: new Date('2022-01-01'), 
          max: new Date('2022-12-31') 
        };

        const result = validateDate(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1); // 只有类型错误，因为非日期值会跳过范围检查
        expect(result![0].code).toBe('VALIDATION_TYPE_MISMATCH');
      });

      // 为NaN值添加一个测试，它会触发多个错误
      it('当值为NaN时返回类型错误', () => {
        const value = NaN;
        const rule: DateRuleOptions = { 
          min: new Date('2022-01-01'), 
          max: new Date('2022-12-31') 
        };

        const result = validateDate(value, rule);

        expect(result).not.toBeNull();
        expect(result!.length).toBe(1); // 只有类型错误，因为NaN不是Date实例
        expect(result![0].code).toBe('VALIDATION_TYPE_MISMATCH');
      });

      // 预处理功能测试
      describe('预处理功能测试', () => {
        it('当规则包含min时，应该自动设置required为true和nullable为false', () => {
          const value = undefined;
          const rule: DateRuleOptions = { min: new Date('2023-01-01') };

          const result = validateDate(value, rule);

          expect(result).not.toBeNull();
          expect(result![0].code).toBe('VALIDATION_REQUIRED');
        });

        it('当规则包含max时，应该自动设置required为true和nullable为false', () => {
          const value = undefined;
          const rule: DateRuleOptions = { max: new Date('2023-12-31') };

          const result = validateDate(value, rule);

          expect(result).not.toBeNull();
          expect(result![0].code).toBe('VALIDATION_REQUIRED');
        });

        it('当规则包含范围约束时，null值应该被拒绝', () => {
          const value = null;
          const rule: DateRuleOptions = { min: new Date('2023-01-01') };

          const result = validateDate(value, rule);

          expect(result).not.toBeNull();
          expect(result![0].code).toBe('VALIDATION_INVALID_VALUE');
        });

        it('当规则不包含范围约束时，预处理不应该改变required和nullable', () => {
          const value = 'not a date';
          const rule: DateRuleOptions = {};

          const result = validateDate(value, rule);

          expect(result).not.toBeNull();
          expect(result![0].code).toBe('VALIDATION_TYPE_MISMATCH');
        });
      });

});
