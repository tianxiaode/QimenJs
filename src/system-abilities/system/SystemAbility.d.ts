import { AbilityBase } from '@/composable/AbilityBase';
import type { IExposeResult } from '@/types/composable';
/**
 * SystemAbility - 系统能力类
 *
 * 提供对系统级配置的访问能力，通过封装 SystemRegistrar 实现统一的系统配置管理。
 * 支持获取单项配置或全量配置，适用于需要读取系统信息的组件。
 */
export declare class SystemAbility extends AbilityBase {
    readonly name = "System";
    /**
     * 暴露系统配置访问接口
     */
    protected expose(): IExposeResult;
}
//# sourceMappingURL=SystemAbility.d.ts.map