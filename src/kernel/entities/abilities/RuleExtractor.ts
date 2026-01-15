import { FieldDefinition } from "../../types";

export class RuleExtractor {
    /**
     * 核心方法：将字段数组转化为以 fieldName 为 key 的规则映射
     */
    static extractFromFields(fields: FieldDefinition[]): Record<string, any[]> {
        const ruleMap: Record<string, any[]> = {};

        fields.forEach(field => {
            const rules = this.extract(field);
            if (rules.length > 0) {
                ruleMap[field.name] = rules;
            }
        });

        return ruleMap;
    }

    // 定义特征检测策略
    private static strategies: Array<{
        test: (f: any) => boolean;
        build: (f: any, base: any) => any;
    }> = [
        {
            test: f => f.type === 'password',
            build: (f, base) => ({ ...base, type: 'password', trim: f.trim }),
        },
        {
            test: f => f.separator !== undefined,
            build: (f, base) => ({
                ...base,
                type: 'split',
                separator: f.separator,
                minItems: f.minItems,
                maxItems: f.maxItems,
                minLength: f.minLength,
            }),
        },
        {
            test: f => !!(f.pattern || f.format),
            build: (f, base) => ({ ...base, type: 'format', pattern: f.pattern, format: f.format }),
        },
        {
            test: f => f.type === 'string',
            build: (f, base) => ({
                ...base,
                type: 'string',
                minLength: f.minLength,
                maxLength: f.maxLength,
                includes: f.includes,
                excludes: f.excludes,
            }),
        },
    ];

    static extract(field: any): any[] {
        // 1. 基础属性：仅保留逻辑判断相关的字段
        // 注意：这里不强行生成 message，让适配层根据 errorType + i18n 生成
        const base: any = {
            required: field.required,
            nullable: field.nullable,
            // 只有当用户在 Field 里手写了 message 时才保留，否则设为 undefined
            message: field.message,
        };

        // 2. 匹配内置策略
        const matchedStrategy = this.strategies.find(s => s.test(field));
        const builtRules = matchedStrategy
            ? [matchedStrategy.build(field, base)]
            : field.type
              ? [{ ...base, type: field.type }]
              : [];

        // 3. 处理手写的自定义规则
        const customRules = Array.isArray(field.rules)
            ? field.rules
            : field.rules
              ? [field.rules]
              : [];

        return [...builtRules, ...customRules];
    }
}
