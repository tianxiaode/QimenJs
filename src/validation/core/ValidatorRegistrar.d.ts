import { RegistrarBase } from '@orbitjs/registry';
import { ValidationProcessorEntry } from '../types';
export declare class ValidatorRegistrar extends RegistrarBase<ValidationProcessorEntry[]> {
    private static chainCache;
    readonly name: "validator";
    protected storage: ValidationProcessorEntry[];
    /** 编码期注入：Presets 使用此方法 */
    register(entry: ValidationProcessorEntry): void;
    unregister(processorName: string): void;
    /** * 获取排序后的流水线
     * 对应你原来的 getSortedProcessors
     */
    get(type: string): ValidationProcessorEntry[];
    lock(): void;
    /** * 完美的自省：按阶段展示所有流水线
     */
    protected doInspect(): void;
    private getStageName;
}
//# sourceMappingURL=ValidatorRegistrar.d.ts.map