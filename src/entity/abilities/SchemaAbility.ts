import type { AbilityDefinition } from '@/composable';
import { SchemaRegistrar } from '@/schema';
import type { TreeSchema } from '@/schema';

/**
 * SchemaAbility - 模式能力
 *
 * 通过 SchemaRegistrar 获取编译后的 Schema，提供便捷的属性访问接口。
 * this 指向宿主（ICoreEntityManager），this.schema 可直接访问。
 */
export const SchemaAbility = {
    /** 返回编译后的 Schema */
    getSchema() {
        return this._getCompiledSchema().schema;
    },

    /** 返回校验规则 */
    getSchemaRules(fieldName?: string) {
        const rules = this._getCompiledSchema().rules;
        return fieldName ? rules[fieldName] : rules;
    },

    /** 属性化：字段映射键名 */
    schemaKeys: {
        get() {
            const schema = this._getCompiledSchema().schema;
            return {
                id: schema.idField || 'id',
                label: schema.nameField || 'name',
                createdAt: schema.createField || 'createdAt',
                updatedAt: schema.updateField || 'updatedAt',
                parentId: (schema as TreeSchema).parentIdField || 'parentId',
                children: (schema as TreeSchema).childrenField || 'children',
                path: (schema as TreeSchema).pathField || 'path',
                leaf: (schema as TreeSchema).leafField || 'leaf',
            };
        },
        enumerable: true,
    },

    /** 属性化：树行为配置 */
    schemaTree: {
        get() {
            const schema = this._getCompiledSchema().schema;
            return {
                isTree: !!schema.isTree,
                isLazy: !!(schema as TreeSchema).isLazy,
                root: (schema as TreeSchema).root,
            };
        },
        enumerable: true,
    },

    /** 属性化：排序行为 */
    schemaSort: {
        get() {
            const schema = this._getCompiledSchema().schema;
            return {
                prop: schema.defaultSort || 'id',
                order: schema.defaultOrder || 'desc',
            };
        },
        enumerable: true,
    },

    /** 属性化：预设过滤字段 */
    schemaFilters: {
        get() {
            return this._getCompiledSchema().schema.searchFields || [];
        },
        enumerable: true,
    },

    /** 属性化：ID 类型 */
    schemaIdType: {
        get() {
            return this._getCompiledSchema().idType;
        },
        enumerable: true,
    },

    /**
     * 通过 SchemaRegistrar 获取编译后的 Schema
     * 自动注册：如果尚未注册，先注册
     */
    _getCompiledSchema() {
        const registrar = SchemaRegistrar.getInstance();
        const key = this.schema.name;

        if (!registrar.has(key)) {
            registrar.register(this.schema);
        }

        return registrar.getCompiled(key);
    },
} satisfies AbilityDefinition;
