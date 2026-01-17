import { MimeTypeRegistrar } from '@/registry/registrars';

/**
 * MIME类型注册器单元测试
 * 验证MimeTypeRegistrar类的各项功能是否正常工作
 */
describe('MimeTypeRegistrar', () => {
  let mimeTypeRegistrar: MimeTypeRegistrar;

  /**
   * 在每个测试用例执行前初始化MimeTypeRegistrar实例
   */
  beforeEach(() => {
    mimeTypeRegistrar = new MimeTypeRegistrar();
  });

  describe('register', () => {
    /**
     * 测试注册单个扩展名和MIME类型的映射
     */
    it('应该能够注册单个扩展名和MIME类型的映射', () => {
      mimeTypeRegistrar.register('jpg', 'image/jpeg');

      const result = mimeTypeRegistrar.get('jpg');
      expect(result).toEqual(['image/jpeg']);
    });

    /**
     * 测试注册单个扩展名和多个MIME类型的映射
     */
    it('应该能够注册单个扩展名和多个MIME类型的映射', () => {
      mimeTypeRegistrar.register('js', ['text/javascript', 'application/javascript']);

      const result = mimeTypeRegistrar.get('js');
      expect(result).toEqual(['text/javascript', 'application/javascript']);
    });

    /**
     * 测试处理带点号的扩展名
     */
    it('应该能够处理带点号的扩展名', () => {
      mimeTypeRegistrar.register('.png', 'image/png');

      const result = mimeTypeRegistrar.get('png');
      expect(result).toEqual(['image/png']);
    });

    /**
     * 测试批量注册功能
     */
    it('应该能够批量注册', () => {
      mimeTypeRegistrar.register({
        jpg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif'
      });

      expect(mimeTypeRegistrar.get('jpg')).toEqual(['image/jpeg']);
      expect(mimeTypeRegistrar.get('png')).toEqual(['image/png']);
      expect(mimeTypeRegistrar.get('gif')).toEqual(['image/gif']);
    });

    /**
     * 测试当缺少MIME类型参数时是否正确抛出错误
     */
    it('当缺少MIME类型参数时应该抛出错误', () => {
      expect(() => {
        (mimeTypeRegistrar as any).register('jpg');
      }).toThrow();
    });
  });

  describe('unregister', () => {
    /**
     * 测试注销扩展名和MIME类型的映射
     */
    it('应该能够注销扩展名和MIME类型的映射', () => {
      mimeTypeRegistrar.register('jpg', 'image/jpeg');
      expect(mimeTypeRegistrar.get('jpg')).toEqual(['image/jpeg']);

      mimeTypeRegistrar.unregister('jpg');
      expect(mimeTypeRegistrar.get('jpg')).toEqual([]);
    });

    /**
     * 测试处理带点号的扩展名的注销
     */
    it('应该能够处理带点号的扩展名', () => {
      mimeTypeRegistrar.register('.png', 'image/png');
      expect(mimeTypeRegistrar.get('png')).toEqual(['image/png']);

      mimeTypeRegistrar.unregister('.png');
      expect(mimeTypeRegistrar.get('png')).toEqual([]);
    });

    /**
     * 测试在锁定状态下是否正确抛出错误
     */
    it('在锁定状态下应该抛出错误', () => {
      mimeTypeRegistrar.lock();
      
      expect(() => {
        mimeTypeRegistrar.unregister('jpg');
      }).toThrow('[Registrar: mimeType] modification denied: Locked.');
    });
  });

  describe('get', () => {
    /**
     * 测试获取单个扩展名对应的MIME类型
     */
    it('应该能够获取单个扩展名对应的MIME类型', () => {
      mimeTypeRegistrar.register('jpg', 'image/jpeg');
      mimeTypeRegistrar.register('js', ['text/javascript', 'application/javascript']);

      expect(mimeTypeRegistrar.get('jpg')).toEqual(['image/jpeg']);
      expect(mimeTypeRegistrar.get('js')).toEqual(['text/javascript', 'application/javascript']);
    });

    /**
     * 测试获取多个扩展名对应的MIME类型
     */
    it('应该能够获取多个扩展名对应的MIME类型', () => {
      mimeTypeRegistrar.register('jpg', 'image/jpeg');
      mimeTypeRegistrar.register('png', 'image/png');

      const result = mimeTypeRegistrar.get(['jpg', 'png']);
      expect(result).toEqual(new Set(['image/jpeg', 'image/png']));
    });

    /**
     * 测试获取多个扩展名（包含带点号扩展名）对应的MIME类型
     */
    it('应该能够处理包含带点号扩展名的数组查询', () => {
      mimeTypeRegistrar.register('.jpg', 'image/jpeg');
      mimeTypeRegistrar.register('png', 'image/png');

      const result = mimeTypeRegistrar.get(['.jpg', 'png']);
      expect(result).toEqual(new Set(['image/jpeg', 'image/png']));
    });

    /**
     * 测试获取多个扩展名（其中某些扩展名不存在）对应的MIME类型
     */
    it('应该能够处理包含不存在扩展名的数组查询', () => {
      mimeTypeRegistrar.register('jpg', 'image/jpeg');

      const result = mimeTypeRegistrar.get(['jpg', 'nonexistent']);
      expect(result).toEqual(new Set(['image/jpeg'])); // 只返回存在的mime类型
    });

    /**
     * 测试获取空数组对应的MIME类型
     */
    it('应该能够处理空数组查询', () => {
      const result = mimeTypeRegistrar.get([]);
      expect(result).toEqual(new Set([])); // 返回空set
    });

    /**
     * 测试处理带点号的扩展名的获取
     */
    it('应该能够处理带点号的扩展名', () => {
      mimeTypeRegistrar.register('.jpg', 'image/jpeg');

      expect(mimeTypeRegistrar.get('.jpg')).toEqual(['image/jpeg']);
    });
    
    /**
     * 测试扩展名不存在的情况
     */
    it('应该能够处理扩展名不存在的情况', () => {
      const result = mimeTypeRegistrar.get('nonexistent');
      expect(result).toEqual([]);
    });
  });

  describe('getByMime', () => {
    /**
     * 测试根据MIME类型获取扩展名
     */
    it('应该能够根据MIME类型获取扩展名', () => {
      mimeTypeRegistrar.register('jpg', 'image/jpeg');

      const ext = mimeTypeRegistrar.getByMime('image/jpeg');
      expect(ext).toBe('jpg');
    });

    /**
     * 测试MIME类型不存在的情况
     */
    it('当MIME类型不存在时应该返回空字符串', () => {
      const ext = mimeTypeRegistrar.getByMime('unknown/type');
      expect(ext).toBe('');
    });
  });

  describe('clear', () => {
    /**
     * 测试清空所有注册的映射
     */
    it('应该清空所有注册的映射', () => {
      mimeTypeRegistrar.register('jpg', 'image/jpeg');
      expect(mimeTypeRegistrar.get('jpg')).toEqual(['image/jpeg']);

      mimeTypeRegistrar.clear();
      expect(mimeTypeRegistrar.get('jpg')).toEqual([]);
    });

    /**
     * 测试在锁定状态下是否正确抛出错误
     */
    it('在锁定状态下应该抛出错误', () => {
      mimeTypeRegistrar.lock();
      
      expect(() => {
        mimeTypeRegistrar.clear();
      }).toThrow('[Registrar: mimeType] modification denied: Locked.');
    });
  });

  describe('lock', () => {
    /**
     * 测试锁定注册器功能
     */
    it('应该锁定注册器', () => {
      mimeTypeRegistrar.lock();
      expect((mimeTypeRegistrar as any).isLocked).toBe(true);
    });
  });

  describe('inspect', () => {
    /**
     * 测试输出注册器状态功能
     */
    it('应该输出注册器状态', () => {
      mimeTypeRegistrar.register('jpg', 'image/jpeg');
      
      const consoleSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
      const consoleTableSpy = jest.spyOn(console, 'table').mockImplementation(() => {});
      const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
      
      mimeTypeRegistrar.inspect();
      
      expect(consoleSpy).toHaveBeenCalledWith('🔍 Registrar: mimeType [🔓]');
      expect(consoleTableSpy).toHaveBeenCalled();
      expect(consoleGroupEndSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      consoleTableSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });
  });
});