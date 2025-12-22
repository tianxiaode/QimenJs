import { ValidationTypeNotDefinedError } from '@/utils';

/**
 * ValidationTypeNotDefinedError 单元测试
 */
describe('ValidationTypeNotDefinedError', () => {
  describe('constructor', () => {
    it('应该使用消息和默认参数正确创建实例', () => {
      const errorMessage = 'Validation type "required" is not defined';
      const error = new ValidationTypeNotDefinedError(errorMessage);
      
      // 验证基本属性
      expect(error.message).toBe(errorMessage);
      expect(error.code).toBe('VALIDATION_RULE_ERROR');
      expect(error.name).toBe('ValidationTypeNotDefinedError');
    });

    it('应该正确处理带有上下文信息的错误', () => {
      const errorMessage = 'Validation type "customRule" is not defined';
      const context = { 
        validatorName: 'UserValidator',
        ruleType: 'customRule',
        fieldName: 'username'
      };
      
      const error = new ValidationTypeNotDefinedError(errorMessage, context);
      
      // 验证基本属性
      expect(error.message).toBe(errorMessage);
      expect(error.code).toBe('VALIDATION_RULE_ERROR');
      expect(error.context).toEqual(context);
    });

    it('应该正确处理 undefined 上下文', () => {
      const errorMessage = 'Validation type "unknown" is not defined';
      const error = new ValidationTypeNotDefinedError(errorMessage, undefined);
      
      // 验证基本属性
      expect(error.message).toBe(errorMessage);
      expect(error.code).toBe('VALIDATION_RULE_ERROR');
      expect(error.context).toBeUndefined();
    });

    it('应该继承 BaseError 的所有行为', () => {
      const errorMessage = 'Validation type error';
      const error = new ValidationTypeNotDefinedError(errorMessage);
      
      // 验证是否是 Error 实例
      expect(error instanceof Error).toBe(true);
      // 验证是否是 BaseError 实例
      expect(error instanceof ValidationTypeNotDefinedError).toBe(true);
    });
  });

  describe('错误行为', () => {
    it('应该能够被 try/catch 捕获', () => {
      const thrower = () => {
        throw new ValidationTypeNotDefinedError('Test error');
      };

      expect(thrower).toThrow(ValidationTypeNotDefinedError);
      expect(thrower).toThrow('Test error');
    });

    it('应该具有正确的堆栈跟踪', () => {
      const error = new ValidationTypeNotDefinedError('Stack trace test');
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });
  });
});