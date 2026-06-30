import { SchemaRegistrar } from '@/schema/SchemaRegistrar';
import type { RegistrSchema, FieldDefinition } from '@/schema/types';

describe('SchemaRegistrar', () => {
    let registrar: SchemaRegistrar;

    beforeEach(() => {
        registrar = SchemaRegistrar.getInstance();
        registrar.clear();
    });

    afterEach(() => {
        registrar.clear();
    });

    describe('singleton pattern', () => {
        it('should return the same instance', () => {
            const instance1 = SchemaRegistrar.getInstance();
            const instance2 = SchemaRegistrar.getInstance();
            
            expect(instance1).toBe(instance2);
        });

        it('should have correct name', () => {
            expect(registrar.name).toBe('schema');
        });
    });

    describe('register schema', () => {
        it('should register a schema using schema.name as key', () => {
            const schema: RegistrSchema = {
                name: 'User',
                isTree: true,
                isLazy: false,
                root: null,
                fields: [
                    { name: 'id', type: 'string', required: true },
                    { name: 'name', type: 'string', minLength: 2 }
                ]
            };
            
            registrar.register(schema);
            
            expect(registrar.has('User')).toBe(true);
        });

        it('should store schema correctly', () => {
            const schema: RegistrSchema = {
                name: 'User',
                isTree: true,
                isLazy: false,
                root: null,
                fields: [
                    { name: 'id', type: 'string', required: true }
                ]
            };
            
            registrar.register(schema);
            
            const retrieved = registrar.get('User');
            expect(retrieved.name).toBe('User');
            expect(retrieved.fields).toHaveLength(1);
        });

        it('should warn when registering duplicate schema name', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            registrar.register({
                name: 'User',
                isTree: true,
                isLazy: false,
                root: null,
                fields: []
            });
            registrar.register({
                name: 'User',
                isTree: true,
                isLazy: false,
                root: null,
                fields: [{ name: 'email', type: 'string' }]
            });
            
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('[SchemaRegistrar] Schema "User" is already registered')
            );
            warnSpy.mockRestore();
        });

        it('should throw error when schema has no name', () => {
            expect(() => registrar.register({ name: '', fields: [] } as any)).toThrow(
                '[SchemaRegistrar] Schema must have a name property'
            );
        });
    });

    describe('register field group', () => {
        it('should register a field group', () => {
            const fields: FieldDefinition[] = [
                { name: 'street', type: 'string' },
                { name: 'city', type: 'string' }
            ];
            
            registrar.register('addressFields', fields);
            
            expect(registrar.has('addressFields', 'field')).toBe(true);
        });

        it('should store field group correctly', () => {
            const fields: FieldDefinition[] = [
                { name: 'street', type: 'string' },
                { name: 'city', type: 'string' }
            ];
            
            registrar.register('addressFields', fields);
            
            const retrieved = registrar.getField('addressFields');
            expect(retrieved).toHaveLength(2);
            expect(retrieved[0].name).toBe('street');
        });

        it('should throw error when field group has no fields array', () => {
            expect(() => registrar.register('emptyGroup' as any, undefined as any)).toThrow(
                '[SchemaRegistrar] Field group requires a name and fields array'
            );
        });
    });

    describe('unregister', () => {
        it('should unregister a schema', () => {
            registrar.register({
                name: 'User',
                isTree: true,
                isLazy: false,
                root: null,
                fields: []
            });
            expect(registrar.has('User')).toBe(true);
            
            registrar.unregister('User');
            expect(registrar.has('User')).toBe(false);
        });

        it('should unregister a field group', () => {
            registrar.register('testFields', []);
            expect(registrar.has('testFields', 'field')).toBe(true);
            
            registrar.unregister('testFields');
            expect(registrar.has('testFields', 'field')).toBe(false);
        });
    });

    describe('get', () => {
        it('should throw error for non-existent schema', () => {
            expect(() => registrar.get('NonExistent')).toThrow(
                '[SchemaRegistrar] Schema "NonExistent" not found'
            );
        });

        it('should throw error for non-existent field group', () => {
            expect(() => registrar.getField('NonExistent')).toThrow(
                '[SchemaRegistrar] Field group "NonExistent" not found'
            );
        });
    });

    describe('has', () => {
        it('should return false for non-existent schema', () => {
            expect(registrar.has('NonExistent')).toBe(false);
        });

        it('should return true for registered schema', () => {
            registrar.register({ 
                name: 'User', 
                isTree: true,
                isLazy: false,
                root: null,
                fields: [] 
            });
            expect(registrar.has('User')).toBe(true);
        });
    });

    describe('getAllSchemaNames', () => {
        it('should return empty array when no schemas', () => {
            expect(registrar.getAllSchemaNames()).toEqual([]);
        });

        it('should return all schema names', () => {
            registrar.register({ 
                name: 'User', 
                isTree: true,
                isLazy: false,
                root: null,
                fields: [] 
            });
            registrar.register({ 
                name: 'Product', 
                isTree: true,
                isLazy: false,
                root: null,
                fields: [] 
            });
            
            const names = registrar.getAllSchemaNames();
            expect(names).toHaveLength(2);
            expect(names).toContain('User');
            expect(names).toContain('Product');
        });
    });

    describe('getAllFieldNames', () => {
        it('should return empty array when no field groups', () => {
            expect(registrar.getAllFieldNames()).toEqual([]);
        });

        it('should return all field group names', () => {
            registrar.register('fields1', []);
            registrar.register('fields2', []);
            
            const names = registrar.getAllFieldNames();
            expect(names).toHaveLength(2);
            expect(names).toContain('fields1');
            expect(names).toContain('fields2');
        });
    });

    describe('clear', () => {
        it('should clear all schemas and field groups', () => {
            registrar.register({ 
                name: 'User', 
                isTree: true,
                isLazy: false,
                root: null,
                fields: [] 
            });
            registrar.register('fields', []);
            
            registrar.clear();
            
            expect(registrar.getAllSchemaNames()).toEqual([]);
            expect(registrar.getAllFieldNames()).toEqual([]);
        });
    });

    describe('inspect', () => {
        it('should output registrar state', () => {
            registrar.register({ 
                name: 'User', 
                isTree: true,
                isLazy: false,
                root: null,
                fields: [] 
            });
            
            expect(() => registrar.inspect()).not.toThrow();
        });
    });

    describe('getCompiled', () => {
        it('should compile schema on first access', () => {
            registrar.register({
                name: 'User',
                isTree: false as const,
                fields: [
                    { name: 'id', type: 'string' },
                    { name: 'name', type: 'string' },
                ]
            });

            const compiled = registrar.getCompiled('User');
            expect(compiled.schema).toBeDefined();
            expect(compiled.schema.fields).toHaveLength(2);
            expect(compiled.rules).toBeDefined();
        });

        it('should cache compiled result', () => {
            registrar.register({
                name: 'User',
                isTree: false as const,
                fields: [
                    { name: 'id', type: 'string' },
                ]
            });

            const first = registrar.getCompiled('User');
            const second = registrar.getCompiled('User');
            expect(first).toBe(second); // 同一个引用
        });

        it('should merge extends fields', () => {
            registrar.register({
                name: 'base',
                isTree: false as const,
                fields: [
                    { name: 'id', type: 'string' },
                    { name: 'createdAt', type: 'date' },
                ]
            });

            registrar.register({
                name: 'User',
                extends: 'base',
                isTree: false as const,
                fields: [
                    { name: 'username', type: 'string' },
                ]
            });

            const compiled = registrar.getCompiled('User');
            expect(compiled.schema.fields).toHaveLength(3);
        });

        it('should merge mixin fields', () => {
            registrar.register('auditFields', [
                { name: 'createdAt', type: 'date' },
                { name: 'updatedAt', type: 'date' },
            ]);

            registrar.register({
                name: 'User',
                mixins: ['auditFields'],
                isTree: false as const,
                fields: [
                    { name: 'id', type: 'string' },
                ]
            });

            const compiled = registrar.getCompiled('User');
            expect(compiled.schema.fields).toHaveLength(3);
        });

        it('should throw error for non-existent schema', () => {
            expect(() => registrar.getCompiled('NonExistent')).toThrow(
                '[SchemaRegistrar] Schema "NonExistent" not found'
            );
        });

        it('should apply tree defaults', () => {
            registrar.register({
                name: 'Tree',
                isTree: true,
                isLazy: false,
                root: null,
                fields: []
            });

            const compiled = registrar.getCompiled('Tree');
            expect(compiled.schema.parentIdField).toBe('parentId');
            expect(compiled.schema.childrenField).toBe('children');
        });

        it('should extract searchable fields', () => {
            registrar.register({
                name: 'User',
                isTree: false as const,
                fields: [
                    { name: 'id', type: 'string', searchable: true },
                    { name: 'name', type: 'string', searchable: false },
                    { name: 'email', type: 'string' },
                ]
            });

            const compiled = registrar.getCompiled('User');
            expect(compiled.schema.searchFields).toContain('id');
            expect(compiled.schema.searchFields).not.toContain('name');
        });

        it('should update searchSet when field searchable changes', () => {
            registrar.register({
                name: 'User',
                isTree: false as const,
                fields: [
                    { name: 'id', type: 'string', searchable: true },
                ]
            });

            const compiled1 = registrar.getCompiled('User');
            expect(compiled1.schema.searchFields).toContain('id');

            // Re-register with searchable=false
            registrar.register({
                name: 'User',
                isTree: false as const,
                fields: [
                    { name: 'id', type: 'string', searchable: false },
                ]
            });

            // Clear compiled cache to force recompile
            (registrar as any).storage.compiled.delete('User');
            const compiled2 = registrar.getCompiled('User');
            expect(compiled2.schema.searchFields).not.toContain('id');
        });

        it('should extract split rule for string field with separator', () => {
            registrar.register({
                name: 'Tags',
                isTree: false as const,
                fields: [
                    { name: 'tags', type: 'string', separator: ',' },
                ]
            });

            const compiled = registrar.getCompiled('Tags');
            const tagRule = compiled.rules['tags'];
            expect(tagRule).toBeDefined();
            expect(tagRule[0].type).toBe('split');
        });

        it('should extract format rule for string field with pattern', () => {
            registrar.register({
                name: 'User',
                isTree: false as const,
                fields: [
                    { name: 'email', type: 'string', pattern: 'email' },
                ]
            });

            const compiled = registrar.getCompiled('User');
            const emailRule = compiled.rules['email'];
            expect(emailRule).toBeDefined();
            expect(emailRule[0].type).toBe('format');
        });

        it('should extract format rule for string field with format', () => {
            registrar.register({
                name: 'User',
                isTree: false as const,
                fields: [
                    { name: 'phone', type: 'string', format: 'phone' },
                ]
            });

            const compiled = registrar.getCompiled('User');
            const phoneRule = compiled.rules['phone'];
            expect(phoneRule).toBeDefined();
            expect(phoneRule[0].type).toBe('format');
        });

        it('should extract validation rules for various types', () => {
            registrar.register({
                name: 'AllTypes',
                isTree: false as const,
                fields: [
                    { name: 'pwd', type: 'password', minLength: 6 },
                    { name: 'age', type: 'number', min: 0 },
                    { name: 'birthday', type: 'date' },
                    { name: 'active', type: 'boolean' },
                ]
            });

            const compiled = registrar.getCompiled('AllTypes');
            expect(compiled.rules['pwd'][0].type).toBe('password');
            expect(compiled.rules['age'][0].type).toBe('number');
            expect(compiled.rules['birthday'][0].type).toBe('date');
            expect(compiled.rules['active'][0].type).toBe('boolean');
        });

        it('should handle custom rules', () => {
            const customRule = { type: 'custom', validator: () => true } as any;
            registrar.register({
                name: 'Custom',
                isTree: false as const,
                fields: [
                    { name: 'field1', type: 'string', rules: customRule },
                ]
            });

            const compiled = registrar.getCompiled('Custom');
            expect(compiled.rules['field1']).toBeDefined();
            expect(compiled.rules['field1'].length).toBe(2); // built-in string + custom
        });

        it('should handle custom rules as array', () => {
            const customRules = [
                { type: 'custom', validator: () => true },
                { type: 'custom2', validator: () => false },
            ] as any;
            registrar.register({
                name: 'CustomArray',
                isTree: false as const,
                fields: [
                    { name: 'field1', type: 'string', rules: customRules },
                ]
            });

            const compiled = registrar.getCompiled('CustomArray');
            expect(compiled.rules['field1'].length).toBe(3); // built-in string + 2 custom
        });

        it('should delete ruleMap entry when field has no rules', () => {
            registrar.register({
                name: 'NoRules',
                isTree: false as const,
                fields: [
                    { name: 'simple', type: 'object' }, // object type has no built-in rule
                ]
            });

            const compiled = registrar.getCompiled('NoRules');
            expect(compiled.rules['simple']).toBeUndefined();
        });
    });

    describe('inspect', () => {
        it('should output registrar state', () => {
            registrar.register({ 
                name: 'User', 
                isTree: true,
                isLazy: false,
                root: null,
                fields: [] 
            });
            
            expect(() => registrar.inspect()).not.toThrow();
        });

        it('should output field groups in inspect', () => {
            registrar.register('testFields', [
                { name: 'field1', type: 'string' },
            ]);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            registrar.inspect();
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Field Groups'));
            consoleSpy.mockRestore();
        });
    });
});
