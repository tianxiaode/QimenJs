import { SchemaRegistrar } from '../../registrars';
import { AbilityBase } from '../../composable';
import {
    FieldDefinition,
    IEntityManagerBase,
    IExposeResult,
    Schema,
    SCHEMA_CACHE_SYMBOL,
    SchemaCache,
} from '../../types';
import { RuleExtractor } from './RuleExtractor';

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
export class SchemaAbility<T extends IEntityManagerBase> extends AbilityBase<T> {
    /**
     * 暴露模式相关的属性和方法
     *
     * 提供对编译后模式的访问接口，包括模式定义、校验规则、键名映射等。
     * 使用缓存机制避免重复编译，提高性能。
     *
     * @returns 包含模式定义相关属性和方法的对象
     */
    protected expose(): IExposeResult {
        // 1. 尝试从静态缓存获取已编译的 Schema 结果
        // 结果包含：finalSchema (完整对象) 和 resolvedRules (拆解后的规则)
        let cached = this.host.getStatic(SCHEMA_CACHE_SYMBOL) as SchemaCache;

        if (!cached) {
            const rawSchema = (this.host as any).schema;
            // 如果有定义则编译，否则给一个默认的空 Schema 结构
            cached = rawSchema ? this.compileSchema(rawSchema) : { schema: {} as any, rules: {} };
            this.host.setStatic(SCHEMA_CACHE_SYMBOL, cached);
        }

        const { schema, rules } = cached;
        // 3. 动态注入方法到 host
        return {
            /** 返回原始 Schema 对象 */
            getSchema: () => schema,

            /** 返回校验规则 */
            getSchemaRules: (fieldName?: string) => {
                return fieldName ? rules[fieldName] : rules;
            },

            /** 属性化：字段映射键名 */
            schemaKeys: {
                get: () => ({
                    id: schema.idKey || 'id',
                    label: schema.labelKey || 'name',
                    createdAt: schema.createdAtKey || 'createdAt',
                    updatedAt: schema.updatedAtKey || 'updatedAt',
                    // --- 新增树相关键名 ---
                    parentId: schema.parentIdKey || 'parentId',
                    children: schema.childrenKey || 'children',
                    path: schema.pathKey || 'path',
                    leaf: schema.leafKey || 'leaf',
                }),
                enumerable: true,
            },

            /** 属性化：树行为配置 */
            schemaTree: {
                get: () => ({
                    isTree: !!schema.isTree,
                    isLazy: !!schema.isLazy,
                    rootIdValue: schema.rootIdValue, // 注意：这个值可能是 0, null, '', 需原样保留
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
                get: () => schema.filters || [],
                enumerable: true,
            },
            schemaIdType: {
                get: () => cached.idType,
                enumerable: true,
            },
        };
    }

    /**
     * Schema 编译器：处理继承、混入、拆解
     */
    private compileSchema(localSchema: Schema): SchemaCache {
        const registrar = SchemaRegistrar.getInstance();

        // 1. 获取纯净的公共配置 (只有 idKey, defaultSort, filters 等)
        // base 此时是一个 RegistrSchema 类型，不含 fields
        const base = localSchema.extends ? registrar.get(localSchema.extends) : {};

        // 2. 收集来自 Mixins 的字段
        // 即使 Registrar 的类型定义 Omit 了 fields，
        // 但在“模板”类型的 Schema 中，我们依然约定它可以携带 fields 供人混入
        const mixinFields: FieldDefinition[] = [];
        if (localSchema.mixins) {
            localSchema.mixins.forEach((mKey: string) => {
                const mSchema = registrar.get(mKey);
                // 提取混入模板中的字段定义
                if (mSchema?.fields) {
                    mixinFields.push(...mSchema.fields);
                }
            });
        }
        // 3. 执行字段合并 (逻辑：Mixins + Local)
        // 注意：既然 Base 没字段，合并就变简单了
        let finalFields = this.mergeFields(mixinFields, localSchema.fields || []);

        // 4. 执行 Override 修正
        // 这一步非常重要，因为虽然 base 没有 fields，
        // 但如果 localSchema 定义了 fields，override 可以对其进行二次修饰
        if (localSchema.override) {
            finalFields = finalFields.map(field => {
                const patch = localSchema.override![field.name];
                return patch ? { ...field, ...patch } : field;
            });
        }
        // 5. 合并扁平属性 (idKey, filters, defaultSort 等)
        // 优先级：Local > Mixins(最后一个优先) > Base
        const mergedMetadata = { ...base };
        if (localSchema.mixins) {
            localSchema.mixins.forEach(mKey => {
                Object.assign(mergedMetadata, registrar.get(mKey));
            });
        }
        Object.assign(mergedMetadata, localSchema);
        // 5. 组装产物
        const finalSchema = {
            ...mergedMetadata,
            fields: finalFields,
        } as Schema;

        let idType = finalSchema.idType;
        if (!idType) {
            const idKey = finalSchema.idKey || 'id';
            const idField = finalFields.find(f => f.name === idKey);
            // 自动探测作为兜底逻辑，保证开发者不写 idType 也能跑
            idType =
                idField?.type === 'number' || idField?.type === 'integer' ? 'number' : 'string';
        }
        // 6. 提取校验规则
        const resolvedRules = RuleExtractor.extractFromFields(finalFields);

        // 补充：合并本地直接定义的 rules
        if (localSchema.rules) {
            Object.entries(localSchema.rules).forEach(([fieldKey, localRules]) => {
                // 统一转为数组格式，方便处理
                const newRules = Array.isArray(localRules) ? localRules : [localRules];

                if (resolvedRules[fieldKey]) {
                    // 如果该字段已有规则（如来自 fields 的 required），则追加
                    resolvedRules[fieldKey] = [...resolvedRules[fieldKey], ...newRules];
                } else {
                    // 如果没有，直接赋值
                    resolvedRules[fieldKey] = newRules;
                }
            });
        }

        if (finalSchema.isTree) {
            finalSchema.parentIdKey = finalSchema.parentIdKey || 'parentId';
            finalSchema.childrenKey = finalSchema.childrenKey || 'children';

            // 如果是树但没定义 rootIdValue，给一个合理的警告或默认值
            if (finalSchema.rootIdValue === undefined) {
                this.host.logger.warn(
                    `[SchemaAbility] Schema "${finalSchema.name}" is a tree but rootIdValue is undefined.`
                );
                finalSchema.rootIdValue = null;
            }
        }

        if (finalSchema.isLazy && !finalSchema.isTree) {
            // 逻辑上：只有树才需要 Lazy 加载（分页是另一种逻辑）
            finalSchema.isTree = true;
        }

        return { schema: finalSchema, rules: resolvedRules, idType: idType as 'number' | 'string' };
    }

    /**
     * 合并多个字段数组
     *
     * 将多个字段数组合并为一个数组，相同名称的字段会被后面的覆盖。
     * 合并策略遵循"后者优先"原则：Local > Mixin > Base。
     *
     * @param fieldArrays - 要合并的字段数组列表
     * @returns 合并后的字段数组，按名称去重，保留最后出现的字段定义
     */
    private mergeFields(...fieldArrays: any[][]) {
        const map = new Map<string, any>();
        fieldArrays.flat().forEach(f => {
            if (f?.name) {
                // 后来的覆盖先来的（Local > Mixin > Base）
                // 使用展开运算符合并对象，确保新字段的属性覆盖旧字段的同名属性
                map.set(f.name, { ...map.get(f.name), ...f });
            }
        });
        return Array.from(map.values());
    }
}
