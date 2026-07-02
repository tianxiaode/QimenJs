/**
 * SchemaRegistrar → EntityManager 字段映射集成测试
 *
 * 验证 Schema 编译（extends/mixins/override）→ 字段映射 → EntityManager 使用的完整链路
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            }))
        }
    };
});

import { SchemaRegistrar } from '@/schema';
import { RemoteCrudEntityManager } from '@/entity/manager/managers';
import { FlatRemoteEntityState } from '@/entity/state/FlatRemoteEntityState';
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import { ENTITY_ACTION } from '@/entity/types';
import type { FlatSchema, TreeSchema, RegistrSchema, FieldDefinition } from '@/schema';

// ============================================
// 测试用 Schema 定义
// ============================================

const baseSchema: FlatSchema = {
    name: 'BaseEntity',
    domain: 'schema-test',
    idField: 'id',
    isTree: false,
    fields: [
        { name: 'id', type: 'string' },
        { name: 'createdAt', type: 'date', readonly: true },
        { name: 'updatedAt', type: 'date', readonly: true },
    ],
};

const auditFields: FieldDefinition[] = [
    { name: 'createdBy', type: 'string', readonly: true } as FieldDefinition,
    { name: 'updatedBy', type: 'string', readonly: true } as FieldDefinition,
];

const userSchema: FlatSchema = {
    name: 'SchemaUser',
    domain: 'schema-test',
    idField: 'id',
    isTree: false,
    extends: 'BaseEntity',
    mixins: ['auditFields'],
    fields: [
        { name: 'username', type: 'string', searchable: true, required: true, minLength: 3, maxLength: 20 },
        { name: 'email', type: 'string', searchable: true, required: true, pattern: 'email' },
        { name: 'age', type: 'number', min: 0, max: 150 },
    ],
};

const overrideSchema: FlatSchema = {
    name: 'OverrideUser',
    domain: 'schema-test',
    idField: 'id',
    isTree: false,
    extends: 'BaseEntity',
    override: {
        createdAt: { readonly: false },
        updatedAt: { type: 'string' },
    },
    fields: [
        { name: 'username', type: 'string', searchable: true },
    ],
};

const mappingSchema: FlatSchema = {
    name: 'MappingUser',
    domain: 'schema-test',
    idField: 'id',
    isTree: false,
    fields: [
        { name: 'id', type: 'string' },
        { name: 'userName', type: 'string', mapping: 'user_name' },
        { name: 'displayName', type: 'string', mapping: (data: any) => `${data.firstName} ${data.lastName}` },
        { name: 'firstName', type: 'string' },
        { name: 'lastName', type: 'string' },
    ],
};

const treeSchema: TreeSchema = {
    name: 'SchemaTree',
    domain: 'schema-test',
    idField: 'id',
    isTree: true,
    isLazy: false,
    root: null,
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string', searchable: true },
        { name: 'parentId', type: 'string' },
    ],
};

// ============================================
// 测试用 EntityManager
// ============================================

class TestSchemaUserManager extends RemoteCrudEntityManager {
    domain = 'schema-test';
    entityName = 'SchemaUser';
    url = '/api/schema-users';
    schema: RegistrSchema = userSchema;
}

class TestOverrideUserManager extends RemoteCrudEntityManager {
    domain = 'schema-test';
    entityName = 'OverrideUser';
    url = '/api/override-users';
    schema: RegistrSchema = overrideSchema;
}

class TestMappingUserManager extends RemoteCrudEntityManager {
    domain = 'schema-test';
    entityName = 'MappingUser';
    url = '/api/mapping-users';
    schema: RegistrSchema = mappingSchema;
}

// ============================================
// 辅助函数
// ============================================

function ensureTestDomain(): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    if (domainRegistrar && !domainRegistrar.get('schema-test')) {
        domainRegistrar.register('schema-test', {
            baseUrl: 'http://localhost:9999',
            preset: 'default',
            pageSize: 10,
            pagesizes: [10, 20, 50],
        });
    }
}

function registerTestSchemas(): void {
    const registrar = SchemaRegistrar.getInstance();
    if (!registrar.has('BaseEntity')) {
        registrar.register(baseSchema);
    }
    if (!registrar.has('auditFields', 'field')) {
        registrar.register('auditFields', auditFields);
    }
    if (!registrar.has('SchemaUser')) {
        registrar.register(userSchema);
    }
    if (!registrar.has('OverrideUser')) {
        registrar.register(overrideSchema);
    }
    if (!registrar.has('MappingUser')) {
        registrar.register(mappingSchema);
    }
    if (!registrar.has('SchemaTree')) {
        registrar.register(treeSchema);
    }
}

// ============================================
// 测试
// ============================================

describe('SchemaRegistrar → EntityManager 字段映射集成测试', () => {
    beforeAll(() => {
        ensureTestDomain();
        registerTestSchemas();
    });

    describe('Schema 编译：extends 继承', () => {
        it('应该继承基础 Schema 的字段', () => {
            const registrar = SchemaRegistrar.getInstance();
            const compiled = registrar.getCompiled('SchemaUser');
            const fieldNames = compiled.schema.fields!.map((f: any) => f.name);

            expect(fieldNames).toContain('id');
            expect(fieldNames).toContain('createdAt');
            expect(fieldNames).toContain('updatedAt');
            expect(fieldNames).toContain('username');
            expect(fieldNames).toContain('email');
            expect(fieldNames).toContain('age');
        });

        it('继承的字段应该保留原始属性', () => {
            const registrar = SchemaRegistrar.getInstance();
            const compiled = registrar.getCompiled('SchemaUser');
            const createdAtField = compiled.schema.fields!.find((f: any) => f.name === 'createdAt')!;

            expect(createdAtField.readonly).toBe(true);
            expect(createdAtField.type).toBe('date');
        });
    });

    describe('Schema 编译：mixins 混入', () => {
        it('应该混入字段组的字段', () => {
            const registrar = SchemaRegistrar.getInstance();
            const compiled = registrar.getCompiled('SchemaUser');
            const fieldNames = compiled.schema.fields!.map((f: any) => f.name);

            expect(fieldNames).toContain('createdBy');
            expect(fieldNames).toContain('updatedBy');
        });

        it('Mixin 字段应该保留原始属性', () => {
            const registrar = SchemaRegistrar.getInstance();
            const compiled = registrar.getCompiled('SchemaUser');
            const createdByField = compiled.schema.fields!.find((f: any) => f.name === 'createdBy')!;

            expect(createdByField.readonly).toBe(true);
        });
    });

    describe('Schema 编译：override 覆盖', () => {
        it('应该覆盖继承字段的属性', () => {
            const registrar = SchemaRegistrar.getInstance();
            const compiled = registrar.getCompiled('OverrideUser');
            const createdAtField = compiled.schema.fields!.find((f: any) => f.name === 'createdAt')!;

            expect(createdAtField.readonly).toBe(false);
        });

        it('应该覆盖继承字段的类型', () => {
            const registrar = SchemaRegistrar.getInstance();
            const compiled = registrar.getCompiled('OverrideUser');
            const updatedAtField = compiled.schema.fields!.find((f: any) => f.name === 'updatedAt')!;

            expect(updatedAtField.type).toBe('string');
        });
    });

    describe('Schema 编译：searchFields 提取', () => {
        it('应该提取 searchable=true 的字段到 searchFields', () => {
            const registrar = SchemaRegistrar.getInstance();
            const compiled = registrar.getCompiled('SchemaUser');

            expect(compiled.schema.searchFields).toBeDefined();
            expect(compiled.schema.searchFields).toContain('username');
            expect(compiled.schema.searchFields).toContain('email');
            expect(compiled.schema.searchFields).not.toContain('age');
        });
    });

    describe('Schema 编译：validation rules 提取', () => {
        it('应该提取 string 类型字段的验证规则', () => {
            const registrar = SchemaRegistrar.getInstance();
            const compiled = registrar.getCompiled('SchemaUser');

            expect(compiled.rules.username).toBeDefined();
            expect(compiled.rules.username.length).toBeGreaterThan(0);
            expect(compiled.rules.username[0].type).toBe('string');
        });

        it('应该提取 number 类型字段的验证规则', () => {
            const registrar = SchemaRegistrar.getInstance();
            const compiled = registrar.getCompiled('SchemaUser');

            expect(compiled.rules.age).toBeDefined();
            expect(compiled.rules.age[0].type).toBe('number');
        });

        it('应该提取 pattern/format 类型的验证规则', () => {
            const registrar = SchemaRegistrar.getInstance();
            const compiled = registrar.getCompiled('SchemaUser');

            expect(compiled.rules.email).toBeDefined();
            expect(compiled.rules.email[0].type).toBe('format');
        });
    });

    describe('Schema 编译：树形默认值', () => {
        it('应该为树形 Schema 补充默认字段名', () => {
            const registrar = SchemaRegistrar.getInstance();
            const compiled = registrar.getCompiled('SchemaTree');

            expect(compiled.schema.isTree).toBe(true);
            expect((compiled.schema as TreeSchema).parentIdField).toBe('parentId');
            expect((compiled.schema as TreeSchema).childrenField).toBe('children');
            expect((compiled.schema as TreeSchema).root).toBeNull();
        });
    });

    describe('EntityManager 中 SchemaAbility 属性', () => {
        it('schemaKeys 应该返回正确的字段映射键名', () => {
            const manager = new TestSchemaUserManager();
            const keys = manager.schemaKeys;

            expect(keys.id).toBe('id');
            expect(keys.label).toBe('name');
            expect(keys.createdAt).toBe('createdAt');
            expect(keys.updatedAt).toBe('updatedAt');
        });

        it('schemaFilters 应该返回 searchFields', () => {
            const manager = new TestSchemaUserManager();
            const filters = manager.schemaFilters;

            expect(filters).toContain('username');
            expect(filters).toContain('email');
        });

        it('schemaSort 应该返回默认排序配置', () => {
            const manager = new TestSchemaUserManager();
            const sort = manager.schemaSort;

            expect(sort.prop).toBeDefined();
            expect(sort.order).toBeDefined();
        });

        it('schemaIdType 应该返回 ID 类型', () => {
            const manager = new TestSchemaUserManager();
            expect(manager.schemaIdType).toBe('string');
        });

        it('getSchemaRules() 应该返回验证规则', () => {
            const manager = new TestSchemaUserManager();
            const rules = manager.getSchemaRules();

            expect(rules.username).toBeDefined();
            expect(rules.email).toBeDefined();
        });

        it('getSchemaRules(fieldName) 应该返回指定字段的规则', () => {
            const manager = new TestSchemaUserManager();
            const usernameRules = manager.getSchemaRules('username');

            expect(usernameRules).toBeDefined();
            expect(usernameRules.length).toBeGreaterThan(0);
        });
    });

    describe('EntityManager processItem 字段映射', () => {
        it('字符串 mapping 应该将字段重命名到目标 key', async () => {
            const manager = new TestMappingUserManager();
            const options = await manager.buildOptions(ENTITY_ACTION.CREATE, {}, {
                id: '1',
                userName: 'test',
                firstName: 'John',
                lastName: 'Doe',
            });

            expect(options.body.user_name).toBe('test');
            expect(options.body.userName).toBe('test');
        });

        it('函数 mapping 应该被跳过（不发送到后端）', async () => {
            const manager = new TestMappingUserManager();
            const options = await manager.buildOptions(ENTITY_ACTION.CREATE, {}, {
                id: '1',
                userName: 'test',
                firstName: 'John',
                lastName: 'Doe',
            });

            expect(options.body.displayName).toBeUndefined();
        });

        it('无 mapping 的字段应该使用原始字段名', async () => {
            const manager = new TestMappingUserManager();
            const options = await manager.buildOptions(ENTITY_ACTION.CREATE, {}, {
                id: '1',
                userName: 'test',
                firstName: 'John',
                lastName: 'Doe',
            });

            expect(options.body.id).toBe('1');
            expect(options.body.firstName).toBe('John');
            expect(options.body.lastName).toBe('Doe');
        });
    });

    describe('EntityManager state 与 compiledSchema 集成', () => {
        it('state 应该使用编译后的 Schema', () => {
            const manager = new TestSchemaUserManager();
            const state = manager.state as FlatRemoteEntityState;

            expect(state.schema).toBeDefined();
            expect(state.schema.name).toBe('SchemaUser');
            expect(state.schema.fields!.length).toBeGreaterThanOrEqual(6);
        });

        it('state.cacheTTL 应该使用 Manager 的 cacheTTL', () => {
            const manager = new TestSchemaUserManager();
            const state = manager.state as FlatRemoteEntityState;

            expect(state.cacheTTL).toBe(300000);
        });
    });
});
