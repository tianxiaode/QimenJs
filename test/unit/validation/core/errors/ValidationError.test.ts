import { ValidationError } from '@/validation';

describe('ValidationError', () => {
  describe('constructor', () => {
    it('应该使用默认值正确创建实例', () => {
      const error = new ValidationError('Validation failed');
      
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('VALIDATION_FAILED');
      expect(error.errors).toEqual([]);
      expect(error.name).toBe('ValidationError');
      expect(error.context).toEqual({ errors: [] });
    });

    it('应该接受自定义参数创建实例', () => {
      const errors = [{ field: 'email', message: 'Invalid email format' }];
      const context = { userId: 123 };
      const error = new ValidationError('Validation failed', 'CUSTOM_CODE', errors, context);
      
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.errors).toBe(errors);
      expect(error.context).toEqual({ userId: 123, errors });
    });
  });

  describe('addError', () => {
    it('应该正确添加新的错误并支持链式调用', () => {
      const error = new ValidationError('Validation failed');
      
      const result = error.addError('username', 'Username is required');
      
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0]).toEqual({ field: 'username', message: 'Username is required' });
      expect(result).toBe(error); // 测试链式调用
    });

    it('应该同步更新上下文中的错误信息', () => {
      const error: any = new ValidationError('Validation failed');
      const initialContext = { timestamp: Date.now() };
      (error as any).context = initialContext;
      
      error.addError('password', 'Password is too short');
      
      expect(error.context.errors).toHaveLength(1);
      expect(error.context.timestamp).toBeDefined();
    });
  });

  describe('hasErrors', () => {
    it('当没有错误时应返回 false', () => {
      const error = new ValidationError('Validation failed');
      
      expect(error.hasErrors()).toBe(false);
    });

    it('当有错误时应返回 true', () => {
      const error = new ValidationError('Validation failed');
      error.addError('field', 'error message');
      
      expect(error.hasErrors()).toBe(true);
    });
  });

  describe('toSimpleObject', () => {
    it('应该正确转换空错误列表', () => {
      const error = new ValidationError('Validation failed');
      
      expect(error.toSimpleObject()).toEqual({});
    });

    it('应该正确转换单个字段的多个错误', () => {
      const error = new ValidationError('Validation failed');
      error.addError('email', 'Email is required');
      error.addError('email', 'Email format is invalid');
      
      expect(error.toSimpleObject()).toEqual({
        email: ['Email is required', 'Email format is invalid']
      });
    });

    it('应该正确转换多个字段的错误', () => {
      const error = new ValidationError('Validation failed');
      error.addError('email', 'Email is required');
      error.addError('password', 'Password is required');
      error.addError('email', 'Email format is invalid');
      
      expect(error.toSimpleObject()).toEqual({
        email: ['Email is required', 'Email format is invalid'],
        password: ['Password is required']
      });
    });
  });
});