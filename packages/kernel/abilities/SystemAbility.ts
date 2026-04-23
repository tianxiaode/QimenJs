import { SystemConfig, SystemRegistrar } from '@orbitjs/registry';
import { AbilityBase } from '../../composable';
import { IComposableBase, IExposeResult } from '../../types';

/**
 * SystemAbility - 系统能力类
 *
 * 提供对系统级配置的访问能力，通过封装 SystemRegistrar 实现统一的系统配置管理。
 * 支持获取单项配置或全量配置，适用于需要读取系统信息的组件。
 *
 * @template T - 继承自 IComposableBase 的宿主类型
 */
export class SystemAbility<T extends IComposableBase> extends AbilityBase<T> {
    /**
     * 暴露系统配置访问接口
     *
     * 创建并返回一个包含系统配置访问方法的对象，允许宿主组件安全地读取系统配置。
     * 使用惰性求值方式获取 SystemRegistrar 实例，确保注册表单例模式。
     *
     * @returns 包含 systemConfig 方法的对象，用于访问系统配置
     */
    protected expose(): IExposeResult {
        const registrar = SystemRegistrar.getInstance();

        /**
         * 系统配置访问函数
         *
         * 统一的系统配置访问入口：
         * 1. 不传参数时返回完整的系统配置对象 (SystemConfig)
         * 2. 传入键名时返回对应配置项的值
         *
         * @param key - 可选的配置项键名，继承自 SystemConfig 的键类型
         * @returns 请求的配置值或整个配置对象
         *
         * @example
         * // 获取全部配置
         * const config = systemConfig();
         *
         * @example
         * // 获取主题配置
         * const theme = systemConfig('theme');
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
             *
             * 用于安全访问系统级配置信息，支持细粒度和全量两种访问模式。
             */
            systemConfig: systemConfig,
        };
    }
}
