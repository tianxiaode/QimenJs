import { AbilityBase, type IExposeResult, type AbilityProxy } from '@/composable';
import { SchemaRegistrar } from '@/schema';
import type { Schema, SchemaCache, TreeSchema } from '@/schema';
import type { ICoreEntityManager } from '@/entity/types';

/**
 * SchemaAbility - 模式能力类（代理模式）
 *
 * 通过 SchemaRegistrar 获取编译后的 Schema，提供便捷的属性访问接口。
 * 编译逻辑已移至 SchemaRegistrar，本类仅负责代理访问。
 */
export class SchemaAbility extends AbilityBase {
    protected expose(proxy: AbilityProxy): IExposeResult {
        return {
            /** 返回编译后的 Schema */
            getSchema: () => {
                const host = proxy.self.host as ICoreEntityManager;
                return proxy.self.getCompiledSchema(host).schema;
            },

            /** 返回校验规则 */
            getSchemaRules: (fieldName?: string) => {
                const host = proxy.self.host as ICoreEntityManager;
                const rules = proxy.self.getCompiledSchema(host).rules;
                return fieldName ? rules[fieldName] : rules;
            },

            /** 属性化：字段映射键名 */
            schemaKeys: {
                get: () => {
                    const host = proxy.host as ICoreEntityManager;
                    const schema = proxy.self.getCompiledSchema(host).schema;
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
                get: () => {
                    const host = proxy.host as ICoreEntityManager;
                    const schema = proxy.self.getCompiledSchema(host).schema;
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
                get: () => {
                    const host = proxy.host as ICoreEntityManager;
                    const schema = proxy.self.getCompiledSchema(host).schema;
                    return {
                        prop: schema.defaultSort || 'id',
                        order: schema.defaultOrder || 'desc',
                    };
                },
                enumerable: true,
            },

            /** 属性化：预设过滤字段 */
            schemaFilters: {
                get: () => {
                    const host = proxy.host as ICoreEntityManager;
                    return proxy.self.getCompiledSchema(host).schema.searchFields || [];
                },
                enumerable: true,
            },

            /** 属性化：ID 类型 */
            schemaIdType: {
                get: () => {
                    const host = proxy.host as ICoreEntityManager;
                    return proxy.self.getCompiledSchema(host).idType;
                },
                enumerable: true,
            },
        };
    }

    /**
     * 通过 SchemaRegistrar 获取编译后的 Schema
     * 自动注册：如果尚未注册，先注册
     */
    private getCompiledSchema(host: ICoreEntityManager): SchemaCache {
        const registrar = SchemaRegistrar.getInstance();
        const key = host.schema.name;
        
        if (!registrar.has(key)) {
            registrar.register(host.schema);
        }
        
        return registrar.getCompiled(key);
    }
}
