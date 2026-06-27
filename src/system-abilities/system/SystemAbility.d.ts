import { AbilityBase } from '@/composable';
import type { IExposeResult } from '@/composable';
/**
 * SystemAbility - 系统能力类
 *
 * 提供对系统级配置的访问能力，通过封装 SystemRegistrar 实现统一的系统配置管理。
 * 支持获取单项配置或全量配置，适用于需要读取系统信息的组件。
 */
export declare class SystemAbility extends AbilityBase {
    /**
     * 能力名称（使用类名）
     */
    readonly name = "SystemAbility";
    /**
     * 能力描述
     */
    static readonly description = "\u7CFB\u7EDF\u80FD\u529B\uFF1A\u63D0\u4F9B\u7CFB\u7EDF\u914D\u7F6E\u8BBF\u95EE\u548C\u7BA1\u7406\u80FD\u529B";
    /**
     * 能力依赖
     */
    static readonly deps: string[];
    /**
     * 暴露系统配置访问接口
     */
    protected expose(): IExposeResult;
}
//# sourceMappingURL=SystemAbility.d.ts.map