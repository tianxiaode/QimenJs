import { AbilityBase } from '@/composable/AbilityBase';
import type { IExposeResult } from '@/types/composable';
/**
 * DomainAbility - 域能力类
 *
 * 该能力为宿主对象提供域（Domain）相关的配置信息访问功能。
 * 它通过 DomainRegistrar 单例获取域配置，并利用静态缓存机制提升性能。
 */
export declare class DomainAbility extends AbilityBase {
    readonly name = "Domain";
    /**
     * 暴露域配置供宿主对象使用
     */
    protected expose(): IExposeResult;
}
//# sourceMappingURL=DomainAbility.d.ts.map