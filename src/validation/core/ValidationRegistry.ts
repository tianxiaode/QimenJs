import { ValidationRule, ValidationProcessorEntry, ValidationTag, VALID_TYPES } from '../types';

export class ValidationRegistry {
    // 以 rule 里的 key 作为索引
    private static processors: ValidationProcessorEntry[] = [];

    private static patterns: Map<string, RegExp> = new Map();
    // 静态指纹缓存
    private static chainCache: Map<string, ValidationProcessorEntry[]> = new Map();

    /**
     * 注册或替换正则
     * @param name 键名，如 'email', 'phone'
     * @param reg 正则表达式
     * @param msg 默认错误消息
     */
    static registerPattern(name: string, reg: RegExp) {
        this.patterns.set(name, reg);
    }

    /**
     * 获取所有已注册的正则名，方便处理器遍历
     */
    static getPatternNames(): string[] {
        return Array.from(this.patterns.keys());
    }

    /**
     * 获取具体的正则定义
     */
    static getPattern(name: string) {
        return this.patterns.get(name);
    }

    /**
     * 注册一个新的处理器
     */
    static register(entry: ValidationProcessorEntry) {
        this.processors.push(entry);
    }

    /**
     * 根据 Rule 对象中存在的 Key，获取并排序所有相关的处理器
     */
    static getSortedProcessors(rule: ValidationRule): ValidationProcessorEntry[] {
        const ruleType = rule.type || 'string';

        // 指纹简单到极致，命中率 100%
        if (this.chainCache.has(ruleType)) {
            return this.chainCache.get(ruleType)!;
        }

        const sorted = this.processors
            .filter(p => p.tags.includes(ruleType as ValidationTag))
            .sort((a, b) => a.weight + a.offset - (b.weight + b.offset));

        this.chainCache.set(ruleType, sorted);
        return sorted;
    }
    /**
     * 打印当前注册表的完整状态
     */
    /**
     * 打印注册表的完整全景图
     */
    static inspect() {
        console.log(
            '%c === Validation Engine Blueprint === ',
            'color: white; background: #222; font-weight: bold;'
        );

        // 1. 打印已注册的全局正则药方
        if (this.patterns.size > 0) {
            console.log('\n%c [Global Patterns] ', 'color: #4CAF50; font-weight: bold;');
            const patternData = Array.from(this.patterns.entries()).map(([name, reg]) => ({
                'Pattern Key': name,
                'Regex Source': reg.source,
            }));
            console.table(patternData);
        }

        // 2. 按 Tag 打印各自的流水线 (Pipeline)
        VALID_TYPES.forEach(tag => {
            const pipeline = this.processors
                .filter(p => p.tags.includes(tag as ValidationTag))
                .sort((a, b) => a.weight + a.offset - (b.weight + b.offset));

            if (pipeline.length > 0) {
                console.log(
                    `\n%c [Pipeline: ${tag.toUpperCase()}] `,
                    'color: #2196F3; font-weight: bold;'
                );
                const pipelineData = pipeline.map(p => ({
                    Priority: p.weight + p.offset,
                    'Station Name': p.name,
                    Stage: this.getStageName(p.weight),
                    Offset: p.offset,
                }));
                console.table(pipelineData);
            }
        });

        // 3. 统计缓存情况
        console.log(
            `\n%c [Cache Status] Active Fingerprints: ${this.chainCache.size} `,
            'color: #FF9800;'
        );
    }
    /** 辅助方法：将权重转为可读的阶段名 */
    private static getStageName(weight: number): string {
        if (weight < 100) return 'PREPARATION';
        if (weight < 200) return 'PRESENCE';
        if (weight < 300) return 'SEMANTIC';
        if (weight < 400) return 'QUANTITY';
        if (weight < 500) return 'RELATION';
        return 'STRUCTURAL';
    }
}
