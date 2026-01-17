import { PatternRegistrar } from '@/registry/registrars';
import { RegistrarInvalidArgumentError, RegistrarNotFoundError } from '@/registry/registrars/errors';

/**
 * 模式注册器单元测试
 * 验证PatternRegistrar类的各项功能是否正常工作
 */
describe('PatternRegistrar', () => {
  let patternRegistrar: PatternRegistrar;

  /**
   * 在每个测试用例执行前初始化PatternRegistrar实例
   */
  beforeEach(() => {
    patternRegistrar = new PatternRegistrar();
  });

  describe('register', () => {
    /**
     * 测试注册单个模式功能
     */
    it('应该能够注册单个模式', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      patternRegistrar.register('email', emailRegex);

      const result = patternRegistrar.get('email');
      expect(result).toBe(emailRegex);
    });

    /**
     * 测试批量注册模式对象功能
     */
    it('应该能够批量注册模式对象', () => {
      const patterns = {
        'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'phone': /^\d{11}$/
      };

      patternRegistrar.register(patterns);

      expect(patternRegistrar.get('email')).toBe(patterns.email);
      expect(patternRegistrar.get('phone')).toBe(patterns.phone);
    });

    /**
     * 测试当缺少正则表达式参数时是否正确抛出错误
     */
    it('当缺少正则表达式参数时应该抛出错误', () => {
      expect(() => {
        (patternRegistrar as any).register('test');
      }).toThrow(RegistrarInvalidArgumentError);
    });

    /**
     * 测试在锁定状态下是否正确抛出错误
     */
    it('在锁定状态下应该抛出错误', () => {
      patternRegistrar.lock();

      expect(() => {
        patternRegistrar.register('test', /\w+/);
      }).toThrow('[Registrar: pattern] modification denied: Locked.');
    });
  });

  describe('unregister', () => {
    /**
     * 测试注销模式功能
     */
    it('应该能够注销模式', () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      patternRegistrar.register('uuid', uuidRegex);

      expect(patternRegistrar.get('uuid')).toBe(uuidRegex);

      patternRegistrar.unregister('uuid');
      expect(() => {
        patternRegistrar.get('uuid');
      }).toThrow(RegistrarNotFoundError);
    });

    /**
     * 测试在锁定状态下是否正确抛出错误
     */
    it('在锁定状态下应该抛出错误', () => {
      patternRegistrar.lock();

      expect(() => {
        patternRegistrar.unregister('uuid');
      }).toThrow('[Registrar: pattern] modification denied: Locked.');
    });
  });

  describe('get', () => {
    /**
     * 测试获取已注册的模式
     */
    it('应该能够获取已注册的模式', () => {
      const zipCodeRegex = /^\d{6}$/;
      patternRegistrar.register('zipcode', zipCodeRegex);

      const result = patternRegistrar.get('zipcode');
      expect(result).toBe(zipCodeRegex);
    });

    /**
     * 测试获取未注册的模式时是否正确抛出错误
     */
    it('对于未注册的模式应该抛出错误', () => {
      expect(() => {
        patternRegistrar.get('nonexistent');
      }).toThrow(RegistrarNotFoundError);
    });
  });

  describe('clear', () => {
    /**
     * 测试清空所有注册的模式
     */
    it('应该清空所有注册的模式', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\d{11}$/;
      
      patternRegistrar.register('email', emailRegex);
      patternRegistrar.register('phone', phoneRegex);

      expect(patternRegistrar.get('email')).toBe(emailRegex);
      expect(patternRegistrar.get('phone')).toBe(phoneRegex);

      patternRegistrar.clear();

      expect(() => {
        patternRegistrar.get('email');
      }).toThrow(RegistrarNotFoundError);
      
      expect(() => {
        patternRegistrar.get('phone');
      }).toThrow(RegistrarNotFoundError);
    });

    /**
     * 测试在锁定状态下是否正确抛出错误
     */
    it('在锁定状态下应该抛出错误', () => {
      patternRegistrar.lock();

      expect(() => {
        patternRegistrar.clear();
      }).toThrow('[Registrar: pattern] modification denied: Locked.');
    });
  });

  describe('lock', () => {
    /**
     * 测试锁定注册器功能
     */
    it('应该锁定注册器', () => {
      patternRegistrar.lock();
      expect((patternRegistrar as any).isLocked).toBe(true);
    });
  });

  describe('inspect', () => {
    /**
     * 测试输出注册器状态功能
     */
    it('应该输出注册器状态', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      patternRegistrar.register('email', emailRegex);

      const consoleSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
      const consoleTableSpy = jest.spyOn(console, 'table').mockImplementation(() => {});
      const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});

      patternRegistrar.inspect();

      expect(consoleSpy).toHaveBeenCalledWith('🔍 Registrar: pattern [🔓]');
      expect(consoleTableSpy).toHaveBeenCalled();
      expect(consoleGroupEndSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      consoleTableSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });
  });
});