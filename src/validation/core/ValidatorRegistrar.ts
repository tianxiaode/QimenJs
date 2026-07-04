import { RegistrarBase } from '@qimenjs/registry';
import { ValidationProcessorEntry } from '../types';
import { ValidatorRegistrarName } from '../types/validate';

export class ValidatorRegistrar extends RegistrarBase<ValidationProcessorEntry[]> {
    // 静态存储，确保 Presets 可以在加载时直接注入
    private static chainCache = new Map<string, ValidationProcessorEntry[]>();

    // 实现基类要求的 name 属性
    public readonly name = ValidatorRegistrarName;

    // 存储验证处理器
    protected storage: ValidationProcessorEntry[] = [];

    /** 编码期注入：Presets 使用此方法 */
    register(entry: ValidationProcessorEntry): void {
        this.checkLock();
        this.storage.push(entry);
        // 数据变更，必须清空缓存
        ValidatorRegistrar.chainCache.clear();
    }

    unregister(processorName: string): void {
        this.checkLock();
        this.storage = this.storage.filter(
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

        const sorted = this.storage
            .filter(p => p.tags.includes(ruleType as any) || p.tags.includes('any' as any))
            .sort((a, b) => a.weight + a.offset - (b.weight + b.offset));

        ValidatorRegistrar.chainCache.set(ruleType, sorted);
        return sorted;
    }

    lock(): void {
        this.checkLock();
        this.isLocked = true;
        console.log('🔒 [ValidatorRegistrar] Pipeline is now immutable.');
    }

    /** * 完美的自省：按阶段展示所有流水线
     */
    protected doInspect(): void {
        console.log(
            '%c === Validation Engine Blueprint === ',
            'color: white; background: #222; font-weight: bold;'
        );

        // 获取所有涉及到的 Tags
        const allTags = new Set<string>();
        this.storage.forEach(p => p.tags.forEach(t => allTags.add(t)));

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



