import { Registrar, RegistryHub } from '@orbitjs/registry';
import { ValidationProcessorEntry } from '../types';
import { ValidatorRegistrarName } from '../types/validate';

export class ValidatorRegistrar implements Registrar<ValidationProcessorEntry> {
    readonly name = ValidatorRegistrarName;

    // 静态存储，确保 Presets 可以在加载时直接注入
    private static processors: ValidationProcessorEntry[] = [];
    private static chainCache = new Map<string, ValidationProcessorEntry[]>();

    /** 编码期注入：Presets 使用此方法 */
    static add(entry: ValidationProcessorEntry): void {
        this.processors.push(entry);
        // 数据变更，必须清空缓存
        this.chainCache.clear();
    }

    // --- 实现 Registrar 接口 ---

    /** 实例方法：单个添加 */
    add(_name: string, entry: ValidationProcessorEntry): void {
        ValidatorRegistrar.add(entry);
    }

    /** 实例方法：批量添加 */
    register(_name: string, entries: ValidationProcessorEntry | ValidationProcessorEntry[]): void {
        if (Array.isArray(entries)) {
            entries.forEach(e => ValidatorRegistrar.add(e));
        } else {
            ValidatorRegistrar.add(entries);
        }
    }

    unregister(processorName: string): void {
        ValidatorRegistrar.processors = ValidatorRegistrar.processors.filter(
            p => p.name !== processorName
        );
        ValidatorRegistrar.chainCache.clear();
    }

    /** * 获取排序后的流水线
     * 对应你原来的 getSortedProcessors
     */
    get(type: string): ValidationProcessorEntry[] {
        const ruleType = type || 'any';

        if (ValidatorRegistrar.chainCache.has(ruleType)) {
            return ValidatorRegistrar.chainCache.get(ruleType)!;
        }

        const sorted = ValidatorRegistrar.processors
            .filter(p => p.tags.includes(ruleType as any) || p.tags.includes('any' as any))
            .sort((a, b) => a.weight + a.offset - (b.weight + b.offset));

        ValidatorRegistrar.chainCache.set(ruleType, sorted);
        return sorted;
    }

    lock(): void {
        Object.freeze(ValidatorRegistrar.processors);
        console.log('🔒 [ValidatorRegistrar] Pipeline is now immutable.');
    }

    /** * 完美的自省：按阶段展示所有流水线
     */
    inspect(): void {
        console.log(
            '%c === Validation Engine Blueprint === ',
            'color: white; background: #222; font-weight: bold;'
        );

        // 获取所有涉及到的 Tags
        const allTags = new Set<string>();
        ValidatorRegistrar.processors.forEach(p => p.tags.forEach(t => allTags.add(t)));

        allTags.forEach(tag => {
            const pipeline = this.get(tag);
            if (pipeline.length > 0) {
                console.log(
                    `\n%c [Pipeline: ${tag.toUpperCase()}] `,
                    'color: #2196F3; font-weight: bold;'
                );
                console.table(
                    pipeline.map(p => ({
                        Priority: p.weight + p.offset,
                        'Station Name': p.name,
                        Stage: this.getStageName(p.weight),
                        Offset: p.offset,
                    }))
                );
            }
        });
    }

    private getStageName(weight: number): string {
        if (weight < 100) return 'PREPARATION';
        if (weight < 200) return 'PRESENCE';
        if (weight < 300) return 'SEMANTIC';
        if (weight < 400) return 'QUANTITY';
        if (weight < 500) return 'RELATION';
        return 'STRUCTURAL';
    }
}


RegistryHub.use(new ValidatorRegistrar());