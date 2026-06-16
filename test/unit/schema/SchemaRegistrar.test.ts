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
        it('should register a schema', () => {
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
    });

    describe('unregister', () => {
        it('should unregister a schema', () => {
            const schema: RegistrSchema = {
                name: 'User',
                isTree: true,
                isLazy: false,
                root: null,
                fields: []
            };
            
            registrar.register(schema);
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
});
