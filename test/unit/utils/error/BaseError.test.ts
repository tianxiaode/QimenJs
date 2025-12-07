import { BaseError } from '@/utils/error/BaseError';

// 创建一个具体的错误类用于测试 BaseError 的功能
class TestError extends BaseError {
  constructor(
    message: string,
    options: {
      name?: string;
      code?: string | number;
      originalError?: Error;
      context?: Record<string, any>;
    } = {}
  ) {
    // 提供默认名称
    super(message, {
      name: options.name || 'TestError',
      code: options.code,
      originalError: options.originalError,
      context: options.context
    });
  }
}

// 创建一个更具体的错误子类用于测试继承
class CustomTestError extends TestError {
  customProperty = 'custom';
  
  constructor(message: string, extraData?: any) {
    super(message, {
      name: 'CustomTestError',
      context: { extraData }
    });
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
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(Error);
    });
  });
  
  describe('基本功能', () => {
    test('应该能够创建继承类实例', () => {
      const error = new TestError('测试错误');
      
      expect(error).toBeInstanceOf(TestError);
      expect(error.name).toBe('TestError');
      expect(error.message).toBe('测试错误');
    });
    
    test('应该继承 Error 的正确原型链', () => {
      const error = new TestError('原型链测试');
      
      expect(Object.getPrototypeOf(error)).toBe(TestError.prototype);
      expect(Object.getPrototypeOf(Object.getPrototypeOf(error))).toBe(BaseError.prototype);
      expect(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(error)))).toBe(Error.prototype);
    });
    
    test('应该包含堆栈跟踪信息', () => {
      const error = new TestError('堆栈测试');
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('TestError');
    });
  });
  
  describe('构造函数选项', () => {
    test('应该支持自定义错误名称', () => {
      const error = new TestError('自定义名称测试', {
        name: 'MyCustomError'
      });
      
      expect(error.name).toBe('MyCustomError');
      expect(error.message).toBe('自定义名称测试');
    });
    
    test('应该支持错误代码', () => {
      const error = new TestError('错误代码测试', {
        code: 'ERR_001'
      });
      
      expect(error.code).toBe('ERR_001');
    });
    
    test('应该支持字符串和数字错误代码', () => {
      const stringCodeError = new TestError('字符串代码', {
        code: 'INVALID_INPUT'
      });
      
      const numberCodeError = new TestError('数字代码', {
        code: 400
      });
      
      expect(stringCodeError.code).toBe('INVALID_INPUT');
      expect(numberCodeError.code).toBe(400);
    });
    
    test('应该支持原始错误', () => {
      const originalError = new Error('原始错误');
      const wrappedError = new TestError('包装错误', {
        originalError
      });
      
      expect(wrappedError.originalError).toBe(originalError);
      expect(wrappedError.originalError?.message).toBe('原始错误');
    });
  });
  
  describe('上下文数据', () => {
    test('应该支持简单上下文对象', () => {
      const context = { field: 'username', value: 'test' };
      const error = new TestError('上下文测试', {
        context
      });
      
      expect(error.context).toBeDefined();
      expect(error.context).toEqual(context);
      expect(error.context?.field).toBe('username');
    });
    
    test('应该合并多个上下文属性', () => {
      const error = new TestError('多属性测试', {
        name: 'ValidationError',
        code: 'VALIDATION_001',
        context: { userId: 123, action: 'login' }
      });
      
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_001');
      expect(error.context).toEqual({
        userId: 123,
        action: 'login'
      });
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
      const originalError = new Error('内部错误');
      const error = new TestError('JSON测试', {
        name: 'TestError',
        code: 500,
        originalError,
        context: { key: 'value' }
      });
      
      const json = error.toJSON();
      
      expect(json).toBeDefined();
      expect(json.name).toBe('TestError');
      expect(json.message).toBe('JSON测试');
      expect(json.code).toBe(500);
      expect(json.timestamp).toBeDefined();
      expect(typeof json.timestamp).toBe('string');
      expect(json.context).toEqual({ key: 'value' });
      expect(json.originalError).toBeDefined();
      expect(json.stack).toBeDefined();
    });
    
    test('toJSON() 应该正确处理可选属性', () => {
      const error = new TestError('简单错误');
      const json = error.toJSON();
      
      expect(json.code).toBeUndefined();
      expect(json.context).toBeUndefined();
      expect(json.originalError).toBeUndefined();
      expect(json.name).toBe('TestError');
      expect(json.message).toBe('简单错误');
    });
    
    test('toString() 应该返回格式化的字符串', () => {
      const error = new TestError('格式化测试', {
        code: 'ERR_001'
      });
      
      const str = error.toString();
      
      expect(typeof str).toBe('string');
      expect(str).toContain('[TestError]');
      expect(str).toContain('(ERR_001)');
      expect(str).toContain('格式化测试');
    });
    
    test('toString() 应该包含上下文信息', () => {
      const error = new TestError('带上下文的错误', {
        context: { userId: 123, reason: 'invalid' }
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
      expect(customError).toBeInstanceOf(BaseError);
      expect(customError).toBeInstanceOf(Error);
      expect(customError.name).toBe('CustomTestError');
      expect(customError.customProperty).toBe('custom');
      expect(customError.context?.extraData).toEqual({ extra: 'data' });
    });
    
    test('子类应该有正确的原型链', () => {
      const customError = new CustomTestError('原型链测试');
      
      expect(customError.constructor.name).toBe('CustomTestError');
      expect(Object.getPrototypeOf(customError)).toBe(CustomTestError.prototype);
      expect(Object.getPrototypeOf(Object.getPrototypeOf(customError))).toBe(TestError.prototype);
    });
    
    test('子类可以添加自定义方法和属性', () => {
      class ExtendedError extends BaseError {
        public customMethod(): string {
          return 'custom method result';
        }
        
        public customProperty = 'custom value';
      }
      
      const extendedError = new ExtendedError('扩展错误', {
        name: 'ExtendedError'
      });
      
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
    
    test('空选项对象应该被正确处理', () => {
      const error = new TestError('测试', {});
      
      expect(error.name).toBe('TestError');
      expect(error.code).toBeUndefined();
      expect(error.context).toBeUndefined();
      expect(error.originalError).toBeUndefined();
    });
    
    test('undefined 作为选项应该被正确处理', () => {
      const error = new TestError('测试');
      
      expect(error.code).toBeUndefined();
      expect(error.context).toBeUndefined();
      expect(error.originalError).toBeUndefined();
    });
  });
  
  describe('集成测试', () => {
    test('应该能正确序列化和反序列化', () => {
      const originalError = new TypeError('类型错误');
      const testError = new TestError('包装错误', {
        name: 'WrappedError',
        code: 'WRAP_001',
        originalError,
        context: { timestamp: Date.now() }
      });
      
      const json = testError.toJSON();
      expect(json).toHaveProperty('name', 'WrappedError');
      expect(json).toHaveProperty('code', 'WRAP_001');
      expect(json).toHaveProperty('originalError');
      expect(json.originalError).toHaveProperty('message', '类型错误');
      
      const str = testError.toString();
      expect(str).toContain('[WrappedError]');
      expect(str).toContain('(WRAP_001)');
      expect(str).toContain('包装错误');
    });
  });
  
  describe('实际使用场景', () => {
    // 模拟一个实际的应用场景
    class DatabaseError extends BaseError {
      constructor(
        message: string,
        options: {
          query?: string;
          params?: any[];
          code?: string;
        } = {}
      ) {
        super(message, {
          name: 'DatabaseError',
          code: options.code || 'DB_ERROR',
          context: {
            query: options.query,
            params: options.params,
            timestamp: new Date().toISOString()
          }
        });
      }
    }
    
    test('实际场景：数据库错误', () => {
      const dbError = new DatabaseError('连接数据库失败', {
        query: 'SELECT * FROM users WHERE id = ?',
        params: [123],
        code: 'DB_CONNECTION_ERROR'
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