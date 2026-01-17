import { RegistryHubError, RegistryHubLockedError, RegistryHubConflictError, RegistryHubErrorCode } from '@/registry/errors';

/**
 * 注册中心错误类单元测试
 * 验证各种错误类是否按预期工作
 */
describe('RegistryHub Errors', () => {
  describe('RegistryHubError', () => {
    /**
     * 测试基础错误类是否能正确创建
     */
    it('应该能够创建基础错误', () => {
      const message = 'Test error message';
      const code = RegistryHubErrorCode.REGISTRATION_LOCKED;
      const context = { test: 'value' };

      const error = new (class extends RegistryHubError {})(
        message,
        code,
        context
      );

      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.context).toEqual(context);
    });
  });

  describe('RegistryHubLockedError', () => {
    /**
     * 测试注册中心锁定错误类是否能正确创建
     */
    it('应该能够创建锁定错误', () => {
      const context = { registrarName: 'test-registrar' };
      const error = new RegistryHubLockedError(context);

      expect(error.message).toContain('Registration failed: The hub is locked');
      expect(error.code).toBe(RegistryHubErrorCode.REGISTRATION_LOCKED);
      expect(error.context).toEqual({
        ...context,
        phase: 'bootstrap',
      });
    });

    /**
     * 测试在没有上下文的情况下注册中心锁定错误类是否能正确创建
     */
    it('应该能够在没有上下文的情况下创建锁定错误', () => {
      const error = new RegistryHubLockedError();

      expect(error.message).toContain('Registration failed: The hub is locked');
      expect(error.code).toBe(RegistryHubErrorCode.REGISTRATION_LOCKED);
      expect(error.context).toEqual({
        phase: 'bootstrap',
      });
    });
  });

  describe('RegistryHubConflictError', () => {
    /**
     * 测试注册中心冲突错误类是否能正确创建
     */
    it('应该能够创建冲突错误', () => {
      const name = 'duplicate-registrar';
      const context = { extra: 'info' };
      const error = new RegistryHubConflictError(name, context);

      expect(error.message).toBe(`[RegistryHub] Conflict: "${name}" already exists.`);
      expect(error.code).toBe(RegistryHubErrorCode.REGISTRATION_CONFLICT);
      expect(error.context).toEqual({
        ...context,
        registrarName: name,
      });
    });

    /**
     * 测试在没有上下文的情况下注册中心冲突错误类是否能正确创建
     */
    it('应该能够在没有上下文的情况下创建冲突错误', () => {
      const name = 'duplicate-registrar';
      const error = new RegistryHubConflictError(name);

      expect(error.message).toBe(`[RegistryHub] Conflict: "${name}" already exists.`);
      expect(error.code).toBe(RegistryHubErrorCode.REGISTRATION_CONFLICT);
      expect(error.context).toEqual({
        registrarName: name,
      });
    });
  });
});