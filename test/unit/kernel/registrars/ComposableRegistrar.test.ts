import { ComposableRegistrar } from '@/kernel/registrars';
import { ComposableRegistrarError } from '@/kernel/errors';

// 模拟可组合能力的类，需要实现IComposable接口
class MockComposable {
  domain?: string;
  
  // 实现IComposable接口必需的attach方法
  attach(host: any): void {
    // 空实现，仅用于测试
  }
}

describe('ComposableRegistrar', () => {
  let registrar: ComposableRegistrar;

  beforeEach(() => {
    registrar = new ComposableRegistrar();
  });

  afterEach(() => {
    // 在实际的RegistrarBase中没有unlock方法，所以不需要在这里调用
    // 注释掉这一行，因为测试中需要多次创建实例来避免锁定问题
  });

  describe('register', () => {
    it('should register a composable ability', () => {
      const entry = {
        name: 'testAbility',
        description: 'Test ability description',
        ctor: MockComposable,
      };

      registrar.register(entry);
      // 我们不能直接访问受保护的storage属性，所以通过get方法验证
      expect(() => registrar.get('testAbility')).not.toThrow();
    });

    it('should overwrite existing ability with warning', () => {
      const entry1 = {
        name: 'testAbility',
        description: 'First description',
        ctor: MockComposable,
      };
      const entry2 = {
        name: 'testAbility',
        description: 'Second description',
        ctor: MockComposable,
      };

      // 模拟console.warn
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      registrar.register(entry1);
      registrar.register(entry2);

      expect(warnSpy).toHaveBeenCalledWith('[ComposableRegistrar] Overwriting existing ability: testAbility');

      const storedEntry = registrar.get('testAbility');
      expect(storedEntry.description).toBe('Second description');

      warnSpy.mockRestore();
    });
  });

  describe('unregister', () => {
    it('should remove a registered ability', () => {
      const entry = {
        name: 'testAbility',
        description: 'Test ability description',
        ctor: MockComposable,
      };

      registrar.register(entry);
      expect(() => registrar.get('testAbility')).not.toThrow();

      registrar.unregister('testAbility');
      expect(() => registrar.get('testAbility')).toThrow(ComposableRegistrarError);
    });
  });

  describe('get', () => {
    it('should return a single registered ability', () => {
      const entry = {
        name: 'testAbility',
        description: 'Test ability description',
        ctor: MockComposable,
      };

      registrar.register(entry);
      const result = registrar.get('testAbility');

      expect(result).toEqual(entry);
    });

    it('should return multiple registered abilities', () => {
      const entry1 = {
        name: 'testAbility1',
        description: 'Test ability 1 description',
        ctor: MockComposable,
      };
      const entry2 = {
        name: 'testAbility2',
        description: 'Test ability 2 description',
        ctor: MockComposable,
      };

      registrar.register(entry1);
      registrar.register(entry2);
      const result = registrar.get(['testAbility1', 'testAbility2']);

      expect(result).toEqual([entry1, entry2]);
    });

    it('should throw an error when ability is not found', () => {
      expect(() => registrar.get('nonExistentAbility'))
        .toThrow(ComposableRegistrarError);
    });

    it('should throw an error when multiple abilities include non-existent ones', () => {
      const entry1 = {
        name: 'testAbility1',
        description: 'Test ability 1 description',
        ctor: MockComposable,
      };

      registrar.register(entry1);
      expect(() => registrar.get(['testAbility1', 'nonExistent']))
        .toThrow(ComposableRegistrarError);
    });
  });

  describe('getRecursive', () => {
    it('should return abilities with their dependencies', () => {
      const entryA = {
        name: 'abilityA',
        description: 'Ability A',
        ctor: MockComposable,
      };
      const entryB = {
        name: 'abilityB',
        description: 'Ability B',
        deps: ['abilityA'], // B depends on A
        ctor: MockComposable,
      };

      registrar.register(entryA);
      registrar.register(entryB);

      const result = registrar.getRecursive(['abilityB']);
      expect(result).toContainEqual(entryA);
      expect(result).toContainEqual(entryB);
      // Ensure the order is correct (dependencies first)
      expect(result[0].name).toBe('abilityA');
      expect(result[1].name).toBe('abilityB');
    });

    it('should handle multiple dependencies correctly', () => {
      const entryA = {
        name: 'abilityA',
        description: 'Ability A',
        ctor: MockComposable,
      };
      const entryB = {
        name: 'abilityB',
        description: 'Ability B',
        ctor: MockComposable,
      };
      const entryC = {
        name: 'abilityC',
        description: 'Ability C',
        deps: ['abilityA', 'abilityB'], // C depends on both A and B
        ctor: MockComposable,
      };

      registrar.register(entryA);
      registrar.register(entryB);
      registrar.register(entryC);

      const result = registrar.getRecursive(['abilityC']);
      expect(result).toContainEqual(entryA);
      expect(result).toContainEqual(entryB);
      expect(result).toContainEqual(entryC);
      // A and B should come before C
      expect(result[2]).toEqual(entryC);
    });

    it('should detect circular dependencies', () => {
      const entryA = {
        name: 'abilityA',
        description: 'Ability A',
        deps: ['abilityB'], // A depends on B
        ctor: MockComposable,
      };
      const entryB = {
        name: 'abilityB',
        description: 'Ability B',
        deps: ['abilityA'], // B depends on A - circular dependency
        ctor: MockComposable,
      };

      registrar.register(entryA);
      registrar.register(entryB);

      expect(() => registrar.getRecursive(['abilityA']))
        .toThrow(ComposableRegistrarError);
    });
  });

  describe('name property', () => {
    it('should have the correct name constant', () => {
      expect(registrar.name).toBe('composable');
    });
  });

  describe('dependency resolution', () => {
    it('should properly resolve deep dependencies', () => {
      // Create a chain: A -> B -> C (A depends on B, B depends on C)
      const entryA = {
        name: 'abilityA',
        description: 'Ability A',
        deps: ['abilityB'],
        ctor: MockComposable,
      };
      const entryB = {
        name: 'abilityB',
        description: 'Ability B',
        deps: ['abilityC'],
        ctor: MockComposable,
      };
      const entryC = {
        name: 'abilityC',
        description: 'Ability C',
        ctor: MockComposable,
      };

      registrar.register(entryA);
      registrar.register(entryB);
      registrar.register(entryC);

      const result = registrar.getRecursive(['abilityA']);
      expect(result).toContainEqual(entryA);
      expect(result).toContainEqual(entryB);
      expect(result).toContainEqual(entryC);
      // Verify order: deepest dependency first
      expect(result[0].name).toBe('abilityC');
      expect(result[1].name).toBe('abilityB');
      expect(result[2].name).toBe('abilityA');
    });
  });
});