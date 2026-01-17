import { MimeTypeRegistrar } from '@/registry/registrars';

describe('MimeTypeRegistrar', () => {
  let mimeTypeRegistrar: MimeTypeRegistrar;

  beforeEach(() => {
    mimeTypeRegistrar = new MimeTypeRegistrar();
  });

  describe('register', () => {
    it('应该能够注册单个扩展名和MIME类型的映射', () => {
      mimeTypeRegistrar.register('jpg', 'image/jpeg');

      const result = mimeTypeRegistrar.get('jpg');
      expect(result).toEqual(['image/jpeg']);
    });

    it('应该能够注册单个扩展名和多个MIME类型的映射', () => {
      mimeTypeRegistrar.register('js', ['text/javascript', 'application/javascript']);

      const result = mimeTypeRegistrar.get('js');
      expect(result).toEqual(['text/javascript', 'application/javascript']);
    });

    it('应该能够处理带点号的扩展名', () => {
      mimeTypeRegistrar.register('.png', 'image/png');

      const result = mimeTypeRegistrar.get('png');
      expect(result).toEqual(['image/png']);
    });

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

    it('当缺少MIME类型参数时应该抛出错误', () => {
      expect(() => {
        (mimeTypeRegistrar as any).register('jpg');
      }).toThrow();
    });
  });

  describe('unregister', () => {
    it('应该能够注销扩展名和MIME类型的映射', () => {
      mimeTypeRegistrar.register('jpg', 'image/jpeg');
      expect(mimeTypeRegistrar.get('jpg')).toEqual(['image/jpeg']);

      mimeTypeRegistrar.unregister('jpg');
      expect(mimeTypeRegistrar.get('jpg')).toEqual([]);
    });

    it('应该能够处理带点号的扩展名', () => {
      mimeTypeRegistrar.register('.png', 'image/png');
      expect(mimeTypeRegistrar.get('png')).toEqual(['image/png']);

      mimeTypeRegistrar.unregister('.png');
      expect(mimeTypeRegistrar.get('png')).toEqual([]);
    });

    it('在锁定状态下应该抛出错误', () => {
      mimeTypeRegistrar.lock();
      
      expect(() => {
        mimeTypeRegistrar.unregister('jpg');
      }).toThrow('[Registrar: mimeType] modification denied: Locked.');
    });
  });

  describe('get', () => {
    it('应该能够获取单个扩展名对应的MIME类型', () => {
      mimeTypeRegistrar.register('jpg', 'image/jpeg');
      mimeTypeRegistrar.register('js', ['text/javascript', 'application/javascript']);

      expect(mimeTypeRegistrar.get('jpg')).toEqual(['image/jpeg']);
      expect(mimeTypeRegistrar.get('js')).toEqual(['text/javascript', 'application/javascript']);
    });

    it('应该能够获取多个扩展名对应的MIME类型', () => {
      mimeTypeRegistrar.register('jpg', 'image/jpeg');
      mimeTypeRegistrar.register('png', 'image/png');

      const result = mimeTypeRegistrar.get(['jpg', 'png']);
      expect(result).toEqual(new Set(['image/jpeg', 'image/png']));
    });

    it('应该能够处理带点号的扩展名', () => {
      mimeTypeRegistrar.register('.jpg', 'image/jpeg');

      expect(mimeTypeRegistrar.get('.jpg')).toEqual(['image/jpeg']);
    });
  });

  describe('getByMime', () => {
    it('应该能够根据MIME类型获取扩展名', () => {
      mimeTypeRegistrar.register('jpg', 'image/jpeg');

      const ext = mimeTypeRegistrar.getByMime('image/jpeg');
      expect(ext).toBe('jpg');
    });

    it('当MIME类型不存在时应该返回空字符串', () => {
      const ext = mimeTypeRegistrar.getByMime('unknown/type');
      expect(ext).toBe('');
    });
  });

  describe('clear', () => {
    it('应该清空所有注册的映射', () => {
      mimeTypeRegistrar.register('jpg', 'image/jpeg');
      expect(mimeTypeRegistrar.get('jpg')).toEqual(['image/jpeg']);

      mimeTypeRegistrar.clear();
      expect(mimeTypeRegistrar.get('jpg')).toEqual([]);
    });

    it('在锁定状态下应该抛出错误', () => {
      mimeTypeRegistrar.lock();
      
      expect(() => {
        mimeTypeRegistrar.clear();
      }).toThrow('[Registrar: mimeType] modification denied: Locked.');
    });
  });

  describe('lock', () => {
    it('应该锁定注册器', () => {
      mimeTypeRegistrar.lock();
      expect((mimeTypeRegistrar as any).isLocked).toBe(true);
    });
  });

  describe('inspect', () => {
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