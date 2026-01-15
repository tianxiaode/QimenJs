import { SchemaRegistrar } from '@/kernel/registrars';
import { AbilityBase } from '../../composable';
import { FieldDefinition, IEntityManagerBase, SCHEMA_CACHE_SYMBOL, SchemaCache } from '../../types';
import { RuleExtractor } from './RuleExtractor';

export class SchemaAbility<T extends IEntityManagerBase> extends AbilityBase<T> {
    protected onAttach(): void {
        // 1. 尝试从静态缓存获取已编译的 Schema 结果
        // 结果包含：finalSchema (完整对象) 和 resolvedRules (拆解后的规则)
        let cached = this.host.getStatic(SCHEMA_CACHE_SYMBOL) as SchemaCache;

        if (!cached) {
            // 2. 第一次实例化：执行“编译”逻辑
            const rawSchema = (this.host as any).schema; // 获取类定义的原始 schema
            if (rawSchema) {
                // 执行递归合并与拆解
                cached = this.compileSchema(rawSchema);
                // 存入类级缓存
                this.host.setStatic(SCHEMA_CACHE_SYMBOL, cached);
            }
        }

        // 3. 动态注入方法到 host
        if (cached) {
            Object.assign(this.host, {
                getSchema: () => cached.schema,
                getRules: (fieldName?: string) => {
                    return fieldName ? cached.rules[fieldName] : cached.rules;
                },
                /** 1. 注入 getKeys：统一访问字段映射 */
                getKeys: () => {
                    const k = cached.schema.keys || {} as any;
                    return {
                        id: k.id || 'id',
                        label: k.label || 'name',
                        createdAt: k.createdAt || 'createdAt',
                        updatedAt: k.updatedAt || 'updatedAt',
                    };
                },

                /** 2. 注入 getBehavior：统一访问行为配置 */
                getBehavior: () => {
                    // 这里可以处理默认排序等逻辑
                    return (
                        cached.schema.behavior || {
                            sort: { prop: 'id', order: 'desc' },
                            filters: [],
                        }
                    );
                },
            });
        }
    }

    /**
     * Schema 编译器：处理继承、混入、拆解
     */
    private compileSchema(localSchema: any): SchemaCache {
        const registrar = SchemaRegistrar.getInstance();

        // 1. 获取基座 (Extends)
        const base = localSchema.extends ? registrar.get(localSchema.extends) : null;

        // 2. 收集混入 (Mixins)
        const mixinFields: FieldDefinition[] = [];
        if (localSchema.mixins) {
            localSchema.mixins.forEach((mKey: string) => {
                const mSchema = registrar.get(mKey);
                if (mSchema?.fields) mixinFields.push(...mSchema.fields);
            });
        }

        // 3. 执行核心合并 (Base -> Mixins -> Local)
        let finalFields = this.mergeFields(
            base?.fields || [],
            mixinFields,
            localSchema.fields || []
        );

        // 4. 【关键步骤】：执行 Override 修正
        // 在所有字段收集完毕后，根据 override 定义进行定向“微创手术”
        if (localSchema.override) {
            finalFields = finalFields.map(field => {
                const patch = localSchema.override[field.name];
                return patch ? { ...field, ...patch } : field;
            });
        }

        const finalSchema = { ...base, ...localSchema, fields: finalFields };
        const resolvedRules = RuleExtractor.extractFromFields(finalFields);

        return { schema: finalSchema, rules: resolvedRules };
    }

    private mergeFields(...fieldArrays: any[][]) {
        const map = new Map<string, any>();
        fieldArrays.flat().forEach(f => {
            if (f?.name) {
                // 后来的覆盖先来的（Local > Mixin > Base）
                map.set(f.name, { ...map.get(f.name), ...f });
            }
        });
        return Array.from(map.values());
    }

    protected onDispose(): void {
        const h = this.host as any;
        h.getSchema = null;
        h.getRules = null;
    }
}
