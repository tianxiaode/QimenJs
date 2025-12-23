import { validateUniqueBy, ValidationErrorContext } from '@/utils';

describe('validateUniqueBy函数测试', () => {
    it('当数组按属性唯一时验证通过', () => {
        const users = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 3, name: 'Charlie' },
        ];

        const result = validateUniqueBy(users, { uniqueBy: 'id' }, {});

        expect(result).toBeNull();
    });

    it('当数组按属性不唯一时验证失败', () => {
        const users = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 1, name: 'Charlie' }, // 重复的 id
        ];

        const result = validateUniqueBy(users, { uniqueBy: 'id' }, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_DUPLICATE');
            expect(result[0].params?.field).toBe('array'); // 第一个参数是field
            expect(result[0].params?.value).toBe(1); // 重复的值
        }
    });

    it('当使用函数提取键值且唯一时验证通过', () => {
        const users = [
            { email: 'alice@example.com' },
            { email: 'bob@example.com' },
            { email: 'charlie@example.com' },
        ];

        const result = validateUniqueBy(
            users,
            {
                uniqueBy: (user: any) => user.email.toLowerCase(),
            },
            {}
        );

        expect(result).toBeNull();
    });

    it('当使用函数提取键值且不唯一时验证失败', () => {
        const users = [
            { email: 'alice@example.com' },
            { email: 'bob@example.com' },
            { email: 'ALICE@example.com' }, // 重复的邮箱（忽略大小写）
        ];

        const result = validateUniqueBy(
            users,
            {
                uniqueBy: (user: any) => user.email.toLowerCase(),
            },
            {}
        );

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_DUPLICATE');
            expect(result[0].params?.field).toBe('array'); // 第一个参数是field
            expect(result[0].params?.value).toBe('alice@example.com'); // 重复的值
        }
    });

    it('当数组为空时验证通过', () => {
        const result = validateUniqueBy([], { uniqueBy: 'id' }, {});

        expect(result).toBeNull();
    });

    it('当数组只有一个元素时验证通过', () => {
        const users = [{ id: 1, name: 'Alice' }];

        const result = validateUniqueBy(users, { uniqueBy: 'id' }, {});

        expect(result).toBeNull();
    });

    it('当数组包含相同对象但唯一属性不同时验证通过', () => {
        const users = [
            { id: 1, name: 'Alice' },
            { id: 1, name: 'Alice Updated' }, // 相同 id，但其他属性不同
        ];

        const result = validateUniqueBy(users, { uniqueBy: 'name' }, {});

        expect(result).toBeNull();
    });

    it('当值不是数组时验证失败', () => {
        const result = validateUniqueBy('not-an-array', { uniqueBy: 'id' }, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
            expect(result[0].params?.expectedType).toBe('array');
        }
    });

    it('当值为null时验证失败', () => {
        const result = validateUniqueBy(null, { uniqueBy: 'id' }, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        }
    });

    it('当值为undefined时验证失败', () => {
        const result = validateUniqueBy(undefined, { uniqueBy: 'id' }, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_REQUIRED');
        }
    });

    it('当数组元素缺少指定属性时验证通过（因为值不同）', () => {
        const items = [
            { name: 'Alice' },
            { name: 'Bob' },
            { other: 'value' }, // 没有 name 属性
        ];

        const result = validateUniqueBy(items, { uniqueBy: 'name' }, {});

        // 只有一个元素没有 name 属性，所以不会造成重复
        expect(result).toBeNull();
    });

    it('当数组元素中指定属性值相同（包括undefined）时验证失败', () => {
        const items = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 3 }, // 没有 name 属性
            { id: 4 }, // 没有 name 属性
        ];

        const result = validateUniqueBy(items, { uniqueBy: 'name' }, {});

        // 两个对象都没有 name 属性，所以 getter 都返回 undefined，导致重复
        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_DUPLICATE');
            expect(result[0].params?.value).toBeUndefined();
        }
    });

    it('应该正确传递上下文信息', () => {
        const users = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
        ];
        const context: ValidationErrorContext = { field: 'testField', value: users };

        const result = validateUniqueBy(users, { uniqueBy: 'id' }, context);

        expect(result).toBeNull();
    });

    it('当验证失败时应该正确传递错误上下文', () => {
        const users = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 1, name: 'Charlie' }, // 重复的 id
        ];
        const context: ValidationErrorContext = { field: 'testField', value: users };

        const result = validateUniqueBy(users, { uniqueBy: 'id' }, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testField');
        }
    });

    it('当uniqueBy为null时验证通过', () => {
        const users = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 3, name: 'Charlie' }  // 重复的 id
        ];

        // 当uniqueBy为null时，跳过唯一性检查，直接返回null
        const result = validateUniqueBy(users, { uniqueBy: null } as any, {});

        expect(result).toBeNull();
    });

    it('当getter函数执行出错时验证失败', () => {
        const items = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 3, name: 'Charlie' }
        ];

        // 创建一个会抛出错误的getter函数
        const failingGetter = (item: any) => {
            if (item.id === 2) {
                throw new Error('Test error');
            }
            return item.id;
        };

        const result = validateUniqueBy(items, { uniqueBy: failingGetter }, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
            expect(result[0].context?.message).toContain('Failed to extract unique key: Test error');
        }
    });

    it('当uniqueBy为非字符串非函数类型时，使用默认getter函数', () => {
        const items = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 3, name: 'Charlie' }
        ];

        // 使用数字作为 uniqueBy，这会触发 typeof uniqueBy === 'function' 的 false 分支
        const result = validateUniqueBy(items, { uniqueBy: 123 as any }, {});

        // 由于 uniqueBy 是数字123，访问 items[0][123] 会返回 undefined
        // 所有元素都会返回 undefined，导致重复
        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_DUPLICATE');
            expect(result[0].params?.value).toBeUndefined();
        }
    });
  
    it('当uniqueBy为false时验证通过', () => {
      const users = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Charlie' }  // 重复的 id
      ];

      // 当uniqueBy为false时，跳过唯一性检查
      const result = validateUniqueBy(users, { uniqueBy: false as any }, {});

      expect(result).toBeNull();
    });
  
    it('当uniqueBy为0时验证通过', () => {
      const users = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Charlie' }  // 重复的 id
      ];

      // 当uniqueBy为0时，跳过唯一性检查
      const result = validateUniqueBy(users, { uniqueBy: 0 as any }, {});

      expect(result).toBeNull();
    });
  
    it('当uniqueBy为空字符串时验证通过', () => {
      const users = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Charlie' }  // 重复的 id
      ];

      // 当uniqueBy为空字符串时，跳过唯一性检查
      const result = validateUniqueBy(users, { uniqueBy: "" as any }, {});

      expect(result).toBeNull();
    });
  
    it('当uniqueBy是函数且该函数执行出错时验证失败', () => {
      const items = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' }
      ];

      // 创建一个总是抛出错误的函数作为 uniqueBy
      const alwaysThrowingFunction = (item: any) => {
        throw new Error('Function execution error');
      };

      const result = validateUniqueBy(items, { uniqueBy: alwaysThrowingFunction }, {});

      expect(result).not.toBeNull();
      if (result && result[0]) {
        expect(result[0].code).toBe('VALIDATION_INVALID_VALUE');
        expect(result[0].context?.message).toContain('Failed to extract unique key: Function execution error');
      }
    });
  
    it('当uniqueBy是Symbol类型时使用默认getter函数', () => {
      const items = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ];
      
      const symbolKey = Symbol('test');
      
      // 使用Symbol作为 uniqueBy，这会触发 typeof uniqueBy === 'function' 的 false 分支
      const result = validateUniqueBy(items, { uniqueBy: symbolKey as any }, {});
      
      // 由于 items[0][Symbol('test')] 会返回 undefined
      // 所有元素都会返回 undefined，导致重复
      expect(result).not.toBeNull();
      if (result && result[0]) {
        expect(result[0].code).toBe('VALIDATION_DUPLICATE');
        expect(result[0].params?.value).toBeUndefined();
      }
    });
});
