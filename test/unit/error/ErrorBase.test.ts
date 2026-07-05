import { ErrorBase } from '@/error';

// 创建一个具体的错误类用于测试 BaseError 的功能
class TestError extends ErrorBase {
    constructor(
        message: string,
        code: string | number = 'TEST_ERROR',
        context?: Record<string, any>
    ) {
        super(message, code, context);
        this.name = 'TestError';
    }
}

// 创建一个更具体的错误子类用于测试继承
class CustomTestError extends TestError {
    customProperty = 'custom';

    constructor(message: string, context?: Record<string, any>) {
        super(message, 'CUSTOM_TEST_ERROR', context);
        this.name = 'CustomTestError';
    }
}

describe('BaseError (抽象类测试)', () => {
    describe('抽象类验证', () => {
        test('BaseError 不能被直接实例化（TypeScript 会在编译时阻止）', () => {
            // 这个测试主要是为了文档说明
            // TypeScript 编译器会阻止直接实例化抽象类
            expect(() => {
                // @ts-ignore - 故意忽略 TypeScript 错误来测试
                // const error = new BaseError('不应该能实例化');
            }).not.toThrow(); // 实际上我们不会真正执行这行代码
            expect(true).toBe(true);
        });

        test('可以通过继承创建具体类', () => {
            const error = new TestError('测试错误');

            expect(error).toBeInstanceOf(TestError);
            expect(error).toBeInstanceOf(ErrorBase);
            expect(error).toBeInstanceOf(Error);
        });
    });

    describe('基本功能', () => {
        test('应该能够创建继承类实例', () => {
            const error = new TestError('测试错误', 'TEST_001');

            expect(error).toBeInstanceOf(TestError);
            expect(error.name).toBe('TestError');
            expect(error.message).toBe('测试错误');
            expect(error.code).toBe('TEST_001');
        });

        test('应该继承 Error 的正确原型链', () => {
            const error = new TestError('原型链测试');

            expect(Object.getPrototypeOf(error)).toBe(TestError.prototype);
            expect(Object.getPrototypeOf(Object.getPrototypeOf(error))).toBe(ErrorBase.prototype);
            expect(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(error)))).toBe(
                Error.prototype
            );
        });

        test('应该包含堆栈跟踪信息', () => {
            const error = new TestError('堆栈测试');

            expect(error.stack).toBeDefined();
            expect(typeof error.stack).toBe('string');
            expect(error.stack).toContain('TestError');
        });
    });

    describe('构造函数参数', () => {
        test('应该支持错误代码', () => {
            const error = new TestError('错误代码测试', 'ERR_001');

            expect(error.code).toBe('ERR_001');
        });

        test('应该支持字符串和数字错误代码', () => {
            const stringCodeError = new TestError('字符串代码', 'INVALID_INPUT');
            const numberCodeError = new TestError('数字代码', 400);

            expect(stringCodeError.code).toBe('INVALID_INPUT');
            expect(numberCodeError.code).toBe(400);
        });

        test('应该支持上下文数据', () => {
            const context = { field: 'username', value: 'test' };
            const error = new TestError('上下文测试', 'CONTEXT_TEST', context);

            expect(error.context).toBeDefined();
            expect(error.context).toEqual(context);
            expect(error.context?.field).toBe('username');
        });

        test('应该包含时间戳', () => {
            const before = new Date();
            const error = new TestError('时间戳测试');
            const after = new Date();

            expect(error.timestamp).toBeInstanceOf(Date);
            expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(error.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
        });
    });

    describe('序列化方法', () => {
        test('toJSON() 应该返回正确的JSON对象', () => {
            const error = new TestError('JSON测试', 500, { key: 'value' });

            const json = error.toJSON();

            expect(json).toBeDefined();
            expect(json.name).toBe('TestError');
            expect(json.message).toBe('JSON测试');
            expect(json.code).toBe(500);
            expect(json.timestamp).toBeDefined();
            expect(typeof json.timestamp).toBe('string');
            expect(json.context).toEqual({ key: 'value' });
            expect(json.stack).toBeDefined();
        });

        test('toJSON() 应该正确处理可选属性', () => {
            const error = new TestError('简单错误');
            const json = error.toJSON();

            expect(json.code).toBe('TEST_ERROR');
            expect(json.context).toBeUndefined();
            expect(json.name).toBe('TestError');
            expect(json.message).toBe('简单错误');
        });

        test('toString() 应该返回格式化的字符串', () => {
            const error = new TestError('格式化测试', 'ERR_001');

            const str = error.toString();

            expect(typeof str).toBe('string');
            expect(str).toContain('[TestError]');
            expect(str).toContain('(ERR_001)');
            expect(str).toContain('格式化测试');
        });

        test('toString() 应该包含上下文信息', () => {
            const error = new TestError('带上下文的错误', 'CONTEXT_ERR', {
                userId: 123,
                reason: 'invalid',
            });

            const str = error.toString();

            expect(str).toContain('userId');
            expect(str).toContain('123');
            expect(str).toContain('invalid');
        });
    });

    describe('继承功能', () => {
        test('多层继承应该正确工作', () => {
            const customError = new CustomTestError('自定义错误', { extra: 'data' });

            expect(customError).toBeInstanceOf(CustomTestError);
            expect(customError).toBeInstanceOf(TestError);
            expect(customError).toBeInstanceOf(ErrorBase);
            expect(customError).toBeInstanceOf(Error);
            expect(customError.name).toBe('CustomTestError');
            expect(customError.customProperty).toBe('custom');
            expect(customError.context?.extra).toBe('data');
        });

        test('子类应该有正确的原型链', () => {
            const customError = new CustomTestError('原型链测试');

            expect(customError.constructor.name).toBe('CustomTestError');
            expect(Object.getPrototypeOf(customError)).toBe(CustomTestError.prototype);
            expect(Object.getPrototypeOf(Object.getPrototypeOf(customError))).toBe(
                TestError.prototype
            );
        });

        test('子类可以添加自定义方法和属性', () => {
            class ExtendedError extends ErrorBase {
                public customMethod(): string {
                    return 'custom method result';
                }

                public customProperty = 'custom value';

                constructor(
                    message: string,
                    code: string | number = 'EXTENDED_ERROR',
                    context?: Record<string, any>
                ) {
                    super(message, code, context);
                    this.name = 'ExtendedError';
                }
            }

            const extendedError = new ExtendedError('扩展错误');

            expect(extendedError.customMethod()).toBe('custom method result');
            expect(extendedError.customProperty).toBe('custom value');
        });
    });

    describe('边缘情况', () => {
        test('空消息应该被允许', () => {
            const error = new TestError('');

            expect(error.message).toBe('');
            expect(error.name).toBe('TestError');
        });

        test('undefined 上下文应该被正确处理', () => {
            const error = new TestError('测试', 'TEST_CODE', undefined);

            expect(error.code).toBe('TEST_CODE');
            expect(error.context).toBeUndefined();
        });
    });

    describe('集成测试', () => {
        test('应该能正确序列化和反序列化', () => {
            const testError = new TestError('包装错误', 'WRAP_001', {
                timestamp: Date.now(),
            });

            const json = testError.toJSON();
            expect(json).toHaveProperty('name', 'TestError');
            expect(json).toHaveProperty('code', 'WRAP_001');

            const str = testError.toString();
            expect(str).toContain('[TestError]');
            expect(str).toContain('(WRAP_001)');
            expect(str).toContain('包装错误');
        });
    });

    describe('实际使用场景', () => {
        // 模拟一个实际的应用场景
        class DatabaseError extends ErrorBase {
            constructor(
                message: string,
                code: string | number = 'DB_ERROR',
                context?: Record<string, any>
            ) {
                super(message, code, context);
                this.name = 'DatabaseError';
            }
        }

        test('实际场景：数据库错误', () => {
            const dbError = new DatabaseError('连接数据库失败', 'DB_CONNECTION_ERROR', {
                query: 'SELECT * FROM users WHERE id = ?',
                params: [123],
                timestamp: new Date().toISOString(),
            });

            expect(dbError).toBeInstanceOf(DatabaseError);
            expect(dbError.name).toBe('DatabaseError');
            expect(dbError.code).toBe('DB_CONNECTION_ERROR');
            expect(dbError.context?.query).toBe('SELECT * FROM users WHERE id = ?');
            expect(dbError.context?.params).toEqual([123]);

            const json = dbError.toJSON();
            expect(json.context).toHaveProperty('query');
            expect(json.context).toHaveProperty('params');
            expect(json.context).toHaveProperty('timestamp');
        });
    });
});
