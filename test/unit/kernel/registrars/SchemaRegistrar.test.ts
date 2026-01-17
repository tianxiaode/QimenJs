import { SchemaRegistrar } from '@/kernel/registrars/SchemaRegistrar';
import { SchemaRegistrarError } from '@/kernel/errors/SchemaRegistrarError';
import { KernelErrorCode } from '@/kernel/errors/codes';
import { RegistrSchema, FieldDefinition } from '@/kernel/types';

// 模拟字段定义
const mockFields: FieldDefinition[] = [
  {
    name: 'field1',
    type: 'string',
    label: 'Field 1',
  },
  {
    name: 'field2',
    type: 'number',
    label: 'Field 2',
  }
];

// 模拟实体模式
const mockEntitySchema: RegistrSchema = {
  name: 'TestEntity',
  fields: [
    {
      name: 'id',
      type: 'string',
      label: 'ID',
    },
    {
      name: 'name',
      type: 'string',
      label: 'Name',
    }
  ]
};

describe('SchemaRegistrar', () => {
  let registrar: SchemaRegistrar;

  beforeEach(() => {
    registrar = new SchemaRegistrar();
  });

  afterEach(() => {
    // 在实际的RegistrarBase中没有unlock方法，所以不需要在这里调用
  });

  describe('register (field group)', () => {
    it('should register a field group', () => {
      registrar.register('testGroup', mockFields);

      // 我们不能直接访问私有字段，所以我们通过获取来测试是否注册成功
      expect(() => registrar.get('testGroup', 'field')).not.toThrow();

      const fieldGroup = registrar.get('testGroup', 'field');
      expect(fieldGroup).toEqual(mockFields);
    });
  });

  describe('register (entity schema)', () => {
    it('should register an entity schema', () => {
      registrar.register(mockEntitySchema);

      // 我们不能直接访问私有字段，所以我们通过获取来测试是否注册成功
      expect(() => registrar.get('TestEntity')).not.toThrow();

      const schema = registrar.get('TestEntity');
      expect(schema).toEqual(mockEntitySchema);
    });
  });

  describe('get (schema)', () => {
    it('should return a registered schema', () => {
      registrar.register(mockEntitySchema);

      const result = registrar.get('TestEntity');
      expect(result).toEqual(mockEntitySchema);
    });

    it('should throw an error when schema does not exist', () => {
      expect(() => registrar.get('nonexistent')).toThrow(SchemaRegistrarError);
      try {
        registrar.get('nonexistent');
      } catch (error: any) {
        expect(error.code).toBe(KernelErrorCode.SCHEMA_NOT_FOUND);
      }
    });
  });

  describe('get (field)', () => {
    it('should return a registered field group', () => {
      registrar.register('testGroup', mockFields);

      const result = registrar.get('testGroup', 'field');
      expect(result).toEqual(mockFields);
    });

    it('should throw an error when field group does not exist', () => {
      expect(() => registrar.get('nonexistent', 'field')).toThrow(SchemaRegistrarError);
      try {
        registrar.get('nonexistent', 'field');
      } catch (error: any) {
        expect(error.code).toBe(KernelErrorCode.SCHEMA_NOT_FOUND);
      }
    });
  });

  describe('getField', () => {
    it('should return a registered field group using shortcut method', () => {
      registrar.register('testGroup', mockFields);

      const result = registrar.getField('testGroup');
      expect(result).toEqual(mockFields);
    });

    it('should throw an error when field group does not exist', () => {
      expect(() => registrar.getField('nonexistent')).toThrow(SchemaRegistrarError);
      try {
        registrar.getField('nonexistent');
      } catch (error: any) {
        expect(error.code).toBe(KernelErrorCode.SCHEMA_NOT_FOUND);
      }
    });
  });

  describe('unregister', () => {
    it('should remove both schema and field entries', () => {
      // Register both a schema and a field group with the same name
      registrar.register(mockEntitySchema);
      registrar.register('TestEntity', mockFields);

      // Check that they were registered successfully
      expect(() => registrar.get('TestEntity')).not.toThrow();
      expect(() => registrar.get('TestEntity', 'field')).not.toThrow();

      registrar.unregister('TestEntity');

      // Now they should not exist
      expect(() => registrar.get('TestEntity')).toThrow();
      expect(() => registrar.get('TestEntity', 'field')).toThrow();
    });
  });

  describe('clear', () => {
    it('should clear both schema and field storages', () => {
      registrar.register(mockEntitySchema);
      registrar.register('testGroup', mockFields);

      // Verify they were added
      expect(() => registrar.get('TestEntity')).not.toThrow();
      expect(() => registrar.get('testGroup', 'field')).not.toThrow();

      registrar.clear();

      // Now they should not exist
      expect(() => registrar.get('TestEntity')).toThrow();
      expect(() => registrar.get('testGroup', 'field')).toThrow();
    });
  });

  describe('name property', () => {
    it('should have the correct name constant', () => {
      expect(registrar.name).toBe('schema');
    });
  });

  describe('mixed registration', () => {
    it('should handle both schemas and field groups independently', () => {
      // Register a schema
      registrar.register(mockEntitySchema);
      // Register a field group
      registrar.register('userFields', mockFields);

      // Retrieve both
      const schema = registrar.get('TestEntity');
      const fieldGroup = registrar.get('userFields', 'field');

      expect(schema).toEqual(mockEntitySchema);
      expect(fieldGroup).toEqual(mockFields);
    });
  });
});