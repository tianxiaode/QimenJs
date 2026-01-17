import { RegistryHub, RegistryHubLockedError, RegistryHubConflictError } from '@/registry';
import { MimeTypeRegistrar } from '@/registry/registrars';

describe('RegistryHub', () => {
  beforeEach(() => {
    // 清理注册中心，确保测试独立性
    (RegistryHub as any).registars.clear();
    (RegistryHub as any).isLocked = false;
  });

  describe('use', () => {
    it('应该能够注册一个新的注册器', () => {
      const registrar = MimeTypeRegistrar.getInstance();
      
      expect(() => {
        RegistryHub.use(registrar);
      }).not.toThrow();
      
      expect(RegistryHub.get<MimeTypeRegistrar>('mimeType')).toBe(registrar);
    });

    it('不应该允许重复注册相同的注册器', () => {
      const registrar1 = MimeTypeRegistrar.getInstance();
      const registrar2 = MimeTypeRegistrar.getInstance();
      
      RegistryHub.use(registrar1);
      
      expect(() => {
        RegistryHub.use(registrar2);
      }).toThrow(RegistryHubConflictError);
    });

    it('应该允许使用force参数覆盖已注册的注册器', () => {
      const registrar1 = MimeTypeRegistrar.getInstance();
      const registrar2 = MimeTypeRegistrar.getInstance();
      
      RegistryHub.use(registrar1);
      RegistryHub.use(registrar2, true);
      
      expect(RegistryHub.get<MimeTypeRegistrar>('mimeType')).toBe(registrar2);
    });

    it('不应该允许在锁定状态下注册新注册器', () => {
      RegistryHub.lock();
      
      const registrar = MimeTypeRegistrar.getInstance();
      
      expect(() => {
        RegistryHub.use(registrar);
      }).toThrow(RegistryHubLockedError);
    });
  });

  describe('lock', () => {
    it('应该锁定注册中心', () => {
      RegistryHub.lock();
      
      expect((RegistryHub as any).isLocked).toBe(true);
    });

    it('锁定后不应允许注册新注册器', () => {
      RegistryHub.lock();
      
      const registrar = MimeTypeRegistrar.getInstance();
      
      expect(() => {
        RegistryHub.use(registrar);
      }).toThrow(RegistryHubLockedError);
    });
  });

  describe('get', () => {
    it('应该能够获取已注册的注册器', () => {
      const registrar = MimeTypeRegistrar.getInstance();
      RegistryHub.use(registrar);
      
      const retrieved = RegistryHub.get<MimeTypeRegistrar>('mimeType');
      expect(retrieved).toBe(registrar);
    });

    it('对于未注册的名称应该返回undefined', () => {
      const retrieved = RegistryHub.get('nonexistent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('debug', () => {
    it('应该能够输出所有注册器的信息', () => {
      const registrar = MimeTypeRegistrar.getInstance();
      RegistryHub.use(registrar);
      
      // Mock console.group 和 console.groupEnd
      const consoleSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
      const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
      
      RegistryHub.debug();
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleGroupEndSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });

    it('应该能够输出指定注册器的信息', () => {
      const registrar = MimeTypeRegistrar.getInstance();
      RegistryHub.use(registrar);
      
      const inspectSpy = jest.spyOn(registrar, 'inspect').mockImplementation(() => {});
      
      RegistryHub.debug('mimeType');
      
      expect(inspectSpy).toHaveBeenCalled();
      
      inspectSpy.mockRestore();
    });
  });

  describe('root proxy', () => {
    it('应该能够通过代理访问注册器', () => {
      const registrar = MimeTypeRegistrar.getInstance();
      RegistryHub.use(registrar);
      
      const proxyResult = (RegistryHub.root as any).mimeType;
      expect(proxyResult).toBe(registrar);
    });
  });
});