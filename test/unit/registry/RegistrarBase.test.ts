import { RegistrarBase } from '@/registry/registrars';

// 创建一个测试用的具体实现类
class ConcreteRegistrar extends RegistrarBase<Record<string, any>> {
  public readonly name = 'test-registrar';
  protected storage: Record<string, any> = {};

  register(...args: any[]): void {
    // 实现注册逻辑
  }

  unregister(id: string): void {
    // 实现注销逻辑
  }

  get(...args: any[]): any {
    // 实现获取逻辑
    return this.storage;
  }

  protected doInspect(): void {
    // 实现输出逻辑
    console.log('Test inspect output');
  }
}

describe('RegistrarBase', () => {
  let registrar: ConcreteRegistrar;

  beforeEach(() => {
    registrar = new ConcreteRegistrar();
  });

  describe('getInstance', () => {
    it('应该为同一注册器类返回同一个实例', () => {
      const instance1 = ConcreteRegistrar.getInstance();
      const instance2 = ConcreteRegistrar.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('lock', () => {
    it('应该锁定注册器', () => {
      registrar.lock();
      expect((registrar as any).isLocked).toBe(true);
    });
  });

  describe('checkLock', () => {
    it('当注册器被锁定时应该抛出错误', () => {
      registrar.lock();
      
      expect(() => {
        registrar['checkLock']();
      }).toThrow('[Registrar: test-registrar] modification denied: Locked.');
    });

    it('当注册器未锁定时不应当抛出错误', () => {
      expect(() => {
        registrar['checkLock']();
      }).not.toThrow();
    });
  });

  describe('clear', () => {
    it('应该清空对象类型的存储', () => {
      const testRegistrar = new (class extends RegistrarBase<Record<string, any>> {
        public readonly name = 'test-clear-object';
        protected storage: Record<string, any> = { key1: 'value1', key2: 'value2' };

        register(...args: any[]): void {}
        unregister(id: string): void {}
        get(...args: any[]): any { return this.storage; }
        protected doInspect(): void {}
      })();

      expect(testRegistrar.get()).toEqual({ key1: 'value1', key2: 'value2' });
      
      testRegistrar.clear();
      expect(testRegistrar.get()).toEqual({});
    });

    it('应该清空数组类型的存储', () => {
      const testRegistrar = new (class extends RegistrarBase<any[]> {
        public readonly name = 'test-clear-array';
        protected storage: any[] = ['item1', 'item2'];

        register(...args: any[]): void {}
        unregister(id: string): void {}
        get(...args: any[]): any { return this.storage; }
        protected doInspect(): void {}
      })();

      testRegistrar.clear();
      expect(testRegistrar['storage'].length).toBe(0);
    });

    it('应该调用Map的clear方法', () => {
      const map = new Map([['key', 'value']]);
      const clearSpy = jest.spyOn(map, 'clear');

      const testRegistrar = new (class extends RegistrarBase<Map<string, any>> {
        public readonly name = 'test-clear-map';
        protected storage: Map<string, any> = map;

        register(...args: any[]): void {}
        unregister(id: string): void {}
        get(...args: any[]): any { return this.storage; }
        protected doInspect(): void {}
      })();

      testRegistrar.clear();
      expect(clearSpy).toHaveBeenCalled();
    });

    it('在锁定状态下应该抛出错误', () => {
      const testRegistrar = new (class extends RegistrarBase<any> {
        public readonly name = 'test-clear-locked';
        protected storage: any = { key: 'value' };

        register(...args: any[]): void {}
        unregister(id: string): void {}
        get(...args: any[]): any { return this.storage; }
        protected doInspect(): void {}
      })();
      
      testRegistrar.lock();
      
      expect(() => {
        testRegistrar.clear();
      }).toThrow('[Registrar: test-clear-locked] modification denied: Locked.');
    });
  });

  describe('inspect', () => {
    it('应该调用doInspect方法', () => {
      const consoleSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
      const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});

      const doInspectSpy = jest.spyOn(registrar as any, 'doInspect');

      registrar.inspect();

      expect(doInspectSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('🔍 Registrar: test-registrar [🔓]');
      expect(consoleGroupEndSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });
  });
});