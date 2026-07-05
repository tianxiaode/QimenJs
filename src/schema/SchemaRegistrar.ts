/**
 * Schema 注册器
 *
 * 管理实体 Schema 和字段组的注册与检索
 * 继承自 RegistrarBase，保持架构一致性
 */

import { RegistrarBase } from '@qimenjs/registry';
import type { RegistrSchema, FieldDefinition, Schema, SchemaCache, ValidationRule } from './types';

/**
 * Schema 注册器存储结构
 */
interface SchemaStorage {
    /**
     * Schema 存储（原始定义）
     */
    schemas: Map<string, RegistrSchema>;

    /**
     * 字段组存储
     */
    fields: Map<string, FieldDefinition[]>;

    /**
     * 编译后的 Schema 缓存
     */
    compiled: Map<string, SchemaCache>;
}

/**
 * Schema 注册器名称常量
 */
export const SchemaRegistrarName = 'schema';

/**
 * SchemaRegistrar 类用于管理模式和字段定义的注册与检索
 *
 * 设计特点：
 * - 支持两种不同的注册模式：实体模式和字段组模式
 * - 使用两个独立的存储来分别管理实体模式和字段定义
 * - 提供统一的API来访问不同类型的数据
 *
 * @example
 * ```typescript
 * const registrar = SchemaRegistrar.getInstance();
 *
 * // 注册基础 Schema
 * registrar.register('base', {
 *     fields: [
 *         { name: 'id', type: 'string' },
 *         { name: 'createdAt', type: 'date' },
 *     ]
 * });
 *
 * // 注册字段组
 * registrar.register('auditFields', [
 *     { name: 'createdAt', type: 'date', readonly: true },
 *     { name: 'updatedAt', type: 'date', readonly: true },
 * ]);
 *
 * // 注册实体 Schema（继承基础 Schema，混入字段组）
 * registrar.register('user', {
 *     extends: 'base',
 *     mixins: ['auditFields'],
 *     fields: [
 *         { name: 'username', type: 'string' },
 *         { name: 'email', type: 'string' },
 *     ]
 * });
 *
 * // 获取编译后的 Schema（第一次调用时编译并缓存）
 * const compiled = registrar.getCompiled('user');
 * console.log(compiled.schema); // 编译后的完整 Schema
 * console.log(compiled.rules); // 提取的验证规则
 * ```
 */
export class SchemaRegistrar extends RegistrarBase<SchemaStorage> {
    /**
     * 注册器名称
     */
    public readonly name = SchemaRegistrarName;

    /**
     * 存储结构
     */
    protected storage: SchemaStorage = {
        schemas: new Map(),
        fields: new Map(),
        compiled: new Map(),
    };

    /**
     * 注册 Schema 或字段组
     *
     * 支持两种注册模式：
     * 1. 注册实体 Schema：register(schema) - 使用 schema.name 作为 key
     * 2. 注册字段组：register(name, fields)
     *
     * @param arg1 - Schema 对象或字段组名称
     * @param arg2 - 字段定义数组（仅字段组模式）
     */
    register(arg1: RegistrSchema | string, arg2?: FieldDefinition[]): void {
        this.checkLock();

        if (typeof arg1 === 'string') {
            // 注册字段组
            if (!arg2) {
                throw new Error('[SchemaRegistrar] Field group requires a name and fields array');
            }
            this.storage.fields.set(arg1, arg2);
        } else {
            // 注册实体 Schema，使用 schema.name 作为 key
            const schema = arg1 as RegistrSchema;
            if (!schema.name) {
                throw new Error('[SchemaRegistrar] Schema must have a name property');
            }
            if (this.storage.schemas.has(schema.name)) {
                console.warn(
                    `[SchemaRegistrar] Schema "${schema.name}" is already registered, overwriting`
                );
            }
            this.storage.schemas.set(schema.name, schema);
        }
    }

    /**
     * 注销 Schema 或字段组
     *
     * @param name - Schema 名称或字段组名称
     */
    unregister(name: string): void {
        this.checkLock();
        this.storage.schemas.delete(name);
        this.storage.fields.delete(name);
    }

    /**
     * 获取 Schema 或字段组
     *
     * @param name - 名称
     * @param type - 类型（'schema' 或 'field'）
     * @returns Schema 或字段组
     */
    get<T = RegistrSchema>(name: string, type: 'schema' | 'field' = 'schema'): T {
        if (type === 'field') {
            const fieldDef = this.storage.fields.get(name);
            if (!fieldDef) {
                throw new Error(`[SchemaRegistrar] Field group "${name}" not found`);
            }
            return fieldDef as any;
        }

        const schema = this.storage.schemas.get(name);
        if (!schema) {
            throw new Error(`[SchemaRegistrar] Schema "${name}" not found`);
        }
        return schema as any;
    }

    /**
     * 获取字段组的快捷方法
     *
     * @param groupName - 字段组名称
     * @returns 字段定义数组
     */
    getField(groupName: string): FieldDefinition[] {
        return this.get(groupName, 'field');
    }

    /**
     * 获取编译后的 Schema（延迟编译）
     *
     * 第一次调用时编译并缓存，后续直接从缓存返回
     *
     * @param key - Schema key
     * @returns 编译后的 Schema
     */
    getCompiled(key: string): SchemaCache {
        // 1. 检查缓存
        let cached = this.storage.compiled.get(key);
        if (cached) {
            return cached;
        }

        // 2. 获取原始 Schema
        const rawSchema = this.storage.schemas.get(key);
        if (!rawSchema) {
            throw new Error(`[SchemaRegistrar] Schema "${key}" not found`);
        }

        // 3. 编译 Schema
        cached = this.compileSchema(key, rawSchema);

        // 4. 缓存编译结果
        this.storage.compiled.set(key, cached);

        return cached;
    }

    /**
     * 编译 Schema
     *
     * 处理 extends、mixins、override，合并字段定义
     *
     * @param key - Schema key
     * @param schema - 原始 Schema
     * @returns 编译后的 Schema 缓存
     */
    private compileSchema(key: string, schema: RegistrSchema): SchemaCache {
        // 1. 初始化中间容器
        const fieldMap = new Map<string, any>();
        const searchFields = new Set<string>();
        const resolvedRules: Record<string, ValidationRule[]> = {};
        const overrides = schema.override || {};

        // 2. 处理 extends（继承基础 Schema）
        if (schema.extends) {
            const baseSchema = this.storage.schemas.get(schema.extends);
            if (baseSchema) {
                this.processFieldBatch(
                    baseSchema.fields || [],
                    fieldMap,
                    searchFields,
                    resolvedRules,
                    overrides
                );
            }
        }

        // 3. 处理 mixins
        if (schema.mixins) {
            schema.mixins.forEach(mKey => {
                const mixinFields = this.storage.fields.get(mKey);
                if (mixinFields) {
                    this.processFieldBatch(
                        mixinFields,
                        fieldMap,
                        searchFields,
                        resolvedRules,
                        overrides
                    );
                }
            });
        }

        // 4. 处理本地字段
        this.processFieldBatch(
            schema.fields || [],
            fieldMap,
            searchFields,
            resolvedRules,
            overrides
        );

        // 5. 组装最终 Schema
        const finalFields = Array.from(fieldMap.values());
        const finalSchema: Schema = {
            ...schema,
            fields: finalFields,
        } as Schema;

        finalSchema.searchFields = Array.from(searchFields);

        // 6. 补充树形默认值
        this.ensureTreeDefaults(finalSchema);

        return {
            schema: finalSchema,
            rules: resolvedRules,
            idType: finalSchema.idType || 'string',
        };
    }

    /**
     * 批量处理字段定义
     *
     * @param fields - 字段定义数组
     * @param fieldMap - 字段映射表
     * @param searchSet - 搜索字段集合
     * @param ruleMap - 规则映射表
     * @param overrides - 字段覆盖配置
     */
    private processFieldBatch(
        fields: any[],
        fieldMap: Map<string, any>,
        searchSet: Set<string>,
        ruleMap: Record<string, ValidationRule[]>,
        overrides: Record<string, any>
    ): void {
        for (const f of fields) {
            if (!f?.name) continue;
            const name = f.name;

            // 获取现有定义（用于 Mixin 叠加）
            const existing = fieldMap.get(name);
            const patch = overrides[name];

            // 核心合并：现有值 < 当前字段值 < Override 补丁
            const merged = { ...existing, ...f, ...patch };
            fieldMap.set(name, merged);

            // 实时维护搜索集合
            if (merged.searchable) {
                searchSet.add(name);
            } else {
                searchSet.delete(name);
            }

            // 实时维护校验规则
            const rules = this.extractRule(merged);
            if (rules.length > 0) {
                ruleMap[name] = rules;
            } else {
                delete ruleMap[name];
            }
        }
    }

    /**
     * 提取字段的验证规则
     *
     * @param field - 字段定义
     * @returns 验证规则数组
     */
    private extractRule(field: any): ValidationRule[] {
        const {
            name,
            label,
            seachable,
            defaultValue,
            readonly,
            mapping,
            rules: customRules,
            ...ruleContent
        } = field;

        let ruleType: string | undefined;
        const type = ruleContent.type;

        // 1. 严格按照定义的 Rule 类型进行分流
        if (field.type === 'string') {
            ruleType = 'string';
            if (field.hasOwnProperty('separator')) {
                ruleType = 'split';
            } else if (field.hasOwnProperty('pattern') || field.hasOwnProperty('format')) {
                ruleType = 'format';
            }
        } else if (['password', 'number', 'date', 'boolean'].includes(type)) {
            ruleType = type;
        }

        const extraRules = Array.isArray(customRules)
            ? customRules
            : customRules
              ? [customRules]
              : [];

        if (!ruleType) return extraRules;

        // 2. 组装内置规则
        const builtInRule = {
            ...ruleContent,
            type: ruleType,
            field: name,
        } as ValidationRule;

        // 3. 返回：内置规则 + 自定义规则
        return [builtInRule, ...extraRules];
    }

    /**
     * 补充树形结构默认值
     *
     * @param schema - Schema 对象
     */
    private ensureTreeDefaults(schema: Schema): void {
        if (schema.isTree) {
            schema.parentIdField = schema.parentIdField || 'parentId';
            schema.childrenField = schema.childrenField || 'children';
            if (schema.root === undefined) schema.root = null;
        }
    }

    /**
     * 检查 Schema 或字段组是否存在
     *
     * @param name - 名称
     * @param type - 类型（'schema' 或 'field'）
     * @returns 是否存在
     */
    has(name: string, type: 'schema' | 'field' = 'schema'): boolean {
        if (type === 'field') {
            return this.storage.fields.has(name);
        }
        return this.storage.schemas.has(name);
    }

    /**
     * 获取所有 Schema 名称
     *
     * @returns Schema 名称列表
     */
    getAllSchemaNames(): string[] {
        return Array.from(this.storage.schemas.keys());
    }

    /**
     * 获取所有字段组名称
     *
     * @returns 字段组名称列表
     */
    getAllFieldNames(): string[] {
        return Array.from(this.storage.fields.keys());
    }

    /**
     * 清空所有注册项
     */
    clear(): void {
        this.checkLock();
        this.storage.schemas.clear();
        this.storage.fields.clear();
        this.storage.compiled.clear();
    }

    /**
     * 输出注册器状态信息
     */
    protected doInspect(): void {
        console.log('📊 Schemas:', this.storage.schemas.size);
        console.log('📋 Field Groups:', this.storage.fields.size);
        console.log('⚡ Compiled:', this.storage.compiled.size);

        if (this.storage.schemas.size > 0) {
            console.log('\n📦 Schemas:');
            this.storage.schemas.forEach((schema, name) => {
                const compiled = this.storage.compiled.has(name) ? '✓' : ' ';
                console.log(`  ${compiled} - ${name} (${schema.fields?.length || 0} fields)`);
            });
        }

        if (this.storage.fields.size > 0) {
            console.log('\n📋 Field Groups:');
            this.storage.fields.forEach((fields, name) => {
                console.log(`  - ${name} (${fields.length} fields)`);
            });
        }
    }
}
