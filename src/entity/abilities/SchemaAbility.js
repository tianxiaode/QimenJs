"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaAbility = void 0;
const registrars_1 = require("../../registrars");
const composable_1 = require("../../composable");
const types_1 = require("../../types");
/**
 * SchemaAbility - 模式能力类
 *
 * 提供实体结构定义和验证能力，处理模式的继承、混入、字段合并等功能。
 * 主要负责：
 * 1. 编译和缓存实体模式（Schema）
 * 2. 处理模式继承（extends）和混入（mixins）
 * 3. 字段定义的合并与覆盖（override）
 * 4. 校验规则的提取和管理
 * 5. 提供标准化的模式访问接口
 */
class SchemaAbility extends composable_1.AbilityBase {
    /**
     * 暴露模式相关的属性和方法
     *
     * 提供对编译后模式的访问接口，包括模式定义、校验规则、键名映射等。
     * 使用缓存机制避免重复编译，提高性能。
     *
     * @returns 包含模式定义相关属性和方法的对象
     */
    expose() {
        // 1. 尝试从静态缓存获取已编译的 Schema 结果
        // 结果包含：finalSchema (完整对象) 和 resolvedRules (拆解后的规则)
        let cached = this.host.getStatic(types_1.SCHEMA_CACHE_SYMBOL);
        if (!cached) {
            const rawSchema = this.host.schema;
            // 如果有定义则编译，否则给一个默认的空 Schema 结构
            cached = rawSchema ? this.compileSchema(rawSchema) : { schema: {}, rules: {} };
            this.host.setStatic(types_1.SCHEMA_CACHE_SYMBOL, cached);
        }
        const { schema, rules } = cached;
        // 3. 动态注入方法到 host
        return {
            /** 返回原始 Schema 对象 */
            getSchema: () => schema,
            /** 返回校验规则 */
            getSchemaRules: (fieldName) => {
                return fieldName ? rules[fieldName] : rules;
            },
            /** 属性化：字段映射键名 */
            schemaKeys: {
                get: () => ({
                    id: schema.idField || 'id',
                    label: schema.nameField || 'name',
                    createdAt: schema.createField || 'createdAt',
                    updatedAt: schema.updateField || 'updatedAt',
                    // --- 新增树相关键名 ---
                    parentId: schema.parentIdField || 'parentId',
                    children: schema.childrenField || 'children',
                    path: schema.pathField || 'path',
                    leaf: schema.leafField || 'leaf',
                }),
                enumerable: true,
            },
            /** 属性化：树行为配置 */
            schemaTree: {
                get: () => ({
                    isTree: !!schema.isTree,
                    isLazy: !!schema.isLazy,
                    root: schema.root, // 注意：这个值可能是 0, null, '', 需原样保留
                }),
                enumerable: true,
            },
            /** 属性化：排序行为 */
            schemaSort: {
                get: () => ({
                    prop: schema.defaultSort || 'id',
                    order: schema.defaultOrder || 'desc',
                }),
                enumerable: true,
            },
            /** 属性化：预设过滤字段 */
            schemaFilters: {
                get: () => schema.searchFields || [],
                enumerable: true,
            },
            schemaIdType: {
                get: () => cached.idType,
                enumerable: true,
            },
        };
    }
    compileSchema(localSchema) {
        const registrar = registrars_1.SchemaRegistrar.getInstance();
        // 1. 初始化中间容器
        const fieldMap = new Map();
        const searchFields = new Set();
        const resolvedRules = {};
        const overrides = localSchema.override || {};
        // 2. 编排处理顺序 (由底向上，Local 拥有最高覆盖权)
        // 处理 Mixins
        if (localSchema.mixins) {
            localSchema.mixins.forEach(mKey => {
                this.processFieldBatch(registrar.get(mKey, 'field'), fieldMap, searchFields, resolvedRules, overrides);
            });
        }
        // 处理 Local Fields
        this.processFieldBatch(localSchema.fields || [], fieldMap, searchFields, resolvedRules, overrides);
        // 3. 组装结果
        const finalFields = Array.from(fieldMap.values());
        const baseMetadata = localSchema.extends ? registrar.get(localSchema.extends) : {};
        const finalSchema = {
            ...baseMetadata,
            ...localSchema,
            fields: finalFields,
            domain: this.host.domain,
        };
        finalSchema.searchFields = Array.from(searchFields);
        // 4. 补充树形默认值与 ID 类型探测
        this.ensureTreeDefaults(finalSchema);
        return {
            schema: finalSchema,
            rules: resolvedRules,
            idType: finalSchema.idType,
        };
    }
    /**
     * 核心：批量字段处理器
     */
    processFieldBatch(fields, fieldMap, searchSet, ruleMap, overrides) {
        for (const f of fields) {
            if (!(f === null || f === void 0 ? void 0 : f.name))
                continue;
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
            }
            else {
                searchSet.delete(name); // 确保 override 关闭时能实时剔除
            }
            // 实时维护校验规则
            const rules = this.extractRule(merged);
            if (rules.length > 0) {
                ruleMap[name] = rules;
            }
            else {
                delete ruleMap[name];
            }
        }
    }
    extractRule(field) {
        const { name, label, seachable, defaultValue, readonly, mapping, rules: customRules, ...ruleContent } = field;
        let ruleType;
        const type = ruleContent.type;
        // 1. 严格按照定义的 Rule 类型进行分流
        if (field.type === 'string') {
            ruleType = 'string';
            if (field.hasOwnProperty('separator')) {
                ruleType = 'split';
            }
            else if (field.hasOwnProperty('pattern') || field.hasOwnProperty('format')) {
                ruleType = 'format';
            }
        }
        else if (['password', 'number', 'date', 'boolean'].includes(type)) {
            // 对应 NumberRule, DateRule, BooleanRule
            ruleType = type;
        }
        const extraRules = Array.isArray(customRules)
            ? customRules
            : customRules
                ? [customRules]
                : [];
        if (!ruleType)
            return extraRules;
        // 2. 组装内置规则 (仅限上述识别出的类型)
        const builtInRule = {
            ...ruleContent,
            type: ruleType,
            field: name,
        };
        // 3. 收集自定义规则
        // 4. 返回：没有内置则只返回自定义，都没有则返回空
        return [builtInRule, ...extraRules];
    }
    /**
     * 补充：树形结构默认值处理
     */
    ensureTreeDefaults(schema) {
        if (schema.isTree) {
            schema.parentIdField = schema.parentIdField || 'parentId';
            schema.childrenField = schema.childrenField || 'children';
            if (schema.root === undefined)
                schema.root = null;
        }
    }
}
exports.SchemaAbility = SchemaAbility;
//# sourceMappingURL=SchemaAbility.js.map