import type { AbilityDefinition } from '@/composable';
import type { SystemConfig } from '@/registry';
import { SystemRegistrar } from '@/registry';
import { getI18nManager } from '@qimenjs/i18n';
import type { I18nLocaleConfig } from '@qimenjs/i18n';

/**
 * SystemAbility - 系统能力
 *
 * 提供对系统级配置的访问能力，通过封装 SystemRegistrar 实现统一的系统配置管理。
 * 同时提供 i18nConfig() 方法，直接从 i18n 获取当前语言的完整区域配置。
 * 事件触发后再获取肯定是最新的，组件无需缓存。
 *
 * this 指向宿主（ComposableBase）。
 */
export const SystemAbility = {
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

    /**
     * 获取当前语言的 i18n 区域配置
     *
     * 直接从 I18nManager 获取，保证是最新值。
     * 包含 date/time/currency/number/ui 等全部配置。
     *
     * @param locale - 可选指定语言，不传则取当前语言
     */
    i18nConfig(locale?: string): I18nLocaleConfig | undefined {
        const i18n = getI18nManager();
        if (!i18n) return undefined;
        return i18n.getLocaleConfig(locale);
    },
} satisfies AbilityDefinition;
