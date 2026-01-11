import { ValidatorNotFoundError } from '@/validation';

/**
 * ValidatorNotFoundError 单元测试
 */
describe('ValidatorNotFoundError', () => {
  describe('constructor', () => {
    it('应该使用类型参数正确创建实例', () => {
      const error = new ValidatorNotFoundError('required');
      
      // 验证基本属性
      expect(error.message).toBe('Validator for rule type "required" not found');
      expect(error.code).toBe('VALIDATOR_NOT_FOUND');
      expect(error.name).toBe('ValidatorNotFoundError');
      // 验证上下文包含类型信息
      expect(error.context).toEqual({ type: 'required' });
    });

    it('应该正确处理带有上下文信息的错误', () => {
      const context = { 
        fieldName: 'email',
        ruleConfig: { required: true },
        validatorGroup: 'userValidation'
      };
      
      const error = new ValidatorNotFoundError('emailFormat', context);
      
      // 验证基本属性
      expect(error.message).toBe('Validator for rule type "emailFormat" not found');
      expect(error.code).toBe('VALIDATOR_NOT_FOUND');
      // 验证上下文合并了类型和额外信息
      expect(error.context).toEqual({ 
        type: 'emailFormat',
        fieldName: 'email',
        ruleConfig: { required: true },
        validatorGroup: 'userValidation'
      });
    });

    it('应该正确处理空的上下文', () => {
      const error = new ValidatorNotFoundError('customRule', {});
      
      // 验证上下文只包含类型信息
      expect(error.context).toEqual({ type: 'customRule' });
    });

    it('应该正确处理 undefined 上下文', () => {
      const error = new ValidatorNotFoundError('unknownRule', undefined);
      
      // 验证上下文只包含类型信息
      expect(error.context).toEqual({ type: 'unknownRule' });
    });

    it('应该继承 BaseError 的所有行为', () => {
      const error = new ValidatorNotFoundError('testType');
      
      // 验证是否是 Error 实例
      expect(error instanceof Error).toBe(true);
      // 验证是否是 BaseError 实例
      expect(error instanceof ValidatorNotFoundError).toBe(true);
    });
  });

  describe('错误行为', () => {
    it('应该能够被 try/catch 捕获', () => {
      const thrower = () => {
        throw new ValidatorNotFoundError('missingValidator');
      };

      expect(thrower).toThrow(ValidatorNotFoundError);
      expect(thrower).toThrow('Validator for rule type "missingValidator" not found');
    });

    it('应该具有正确的堆栈跟踪', () => {
      const error = new ValidatorNotFoundError('testType');
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });
  });

  describe('不同输入场景', () => {
    it('应该正确处理特殊字符的类型名称', () => {
      const specialType = 'custom-rule_1.0@v';
      const error: any = new ValidatorNotFoundError(specialType);
      
      expect(error.message).toBe(`Validator for rule type "${specialType}" not found`);
      expect(error.context.type).toBe(specialType);
    });

    it('应该正确处理空字符串类型', () => {
      const error: any = new ValidatorNotFoundError('');
      
      expect(error.message).toBe('Validator for rule type "" not found');
      expect(error.context.type).toBe('');
    });
  });
});