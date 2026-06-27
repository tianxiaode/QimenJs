import { AbilityBase } from '@/composable';
import type { IExposeResult } from '@/composable';
import type { SystemConfig } from '@/registry';
import { SystemRegistrar } from '@/registry';

/**
 * SystemAbility - 系统能力类
 *
 * 提供对系统级配置的访问能力，通过封装 SystemRegistrar 实现统一的系统配置管理。
 * 支持获取单项配置或全量配置，适用于需要读取系统信息的组件。
 */
export class SystemAbility extends AbilityBase {
    /**
     * 能力名称（使用类名）
     */
    readonly name = 'SystemAbility';
    
    /**
     * 能力描述
     */
    static readonly description = '系统能力：提供系统配置访问和管理能力';
    
    /**
     * 能力依赖
     */
    static readonly deps: string[] = [];
    
    /**
     * 暴露系统配置访问接口
     */
    protected expose(): IExposeResult {
        const registrar = SystemRegistrar.getInstance();
        
        /**
         * 系统配置访问函数
         */
        const systemConfig = <K extends keyof SystemConfig>(key?: K) => {
            if (key !== undefined) {
                return registrar.get(key);
            }
            return registrar.getAll();
        };
        
        return {
            /**
             * 系统配置访问器
             */
            systemConfig,
        };
    }
}
