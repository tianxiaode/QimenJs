import { AbilityBase } from '@/composable';
import type { IExposeResult } from '@/composable';
/**
 * DomainAbility - 域能力类
 *
 * 该能力为宿主对象提供域（Domain）相关的配置信息访问功能。
 * 它通过 DomainRegistrar 单例获取域配置，并利用静态缓存机制提升性能。
 */
export declare class DomainAbility extends AbilityBase {
    /**
     * 能力名称（使用类名）
     */
    readonly name = "DomainAbility";
    /**
     * 能力描述
     */
    static readonly description = "\u57DF\u80FD\u529B\uFF1A\u63D0\u4F9B\u57DF\u914D\u7F6E\u8BBF\u95EE\u548C\u7BA1\u7406\u80FD\u529B";
    /**
     * 能力依赖
     */
    static readonly deps: string[];
    /**
     * 暴露域配置供宿主对象使用
     */
    protected expose(): IExposeResult;
}
//# sourceMappingURL=DomainAbility.d.ts.map