import type { AbilityDefinition } from '@/composable';
import type { SystemConfig } from '@/registry';
import { SystemRegistrar } from '@/registry';

/**
 * SystemAbility - 系统能力
 *
 * 提供对系统级配置的访问能力，通过封装 SystemRegistrar 实现统一的系统配置管理。
 * this 指向宿主（ComposableBase）。
 */
export const SystemAbility: AbilityDefinition = {
    /**
     * 系统配置访问器
     *
     * @param key - 配置键名（可选），不传则返回全量配置
     */
    systemConfig<K extends keyof SystemConfig>(key?: K) {
        const registrar = SystemRegistrar.getInstance();
        if (key !== undefined) {
            return registrar.get(key);
        }
        return registrar.getAll();
    },
};
