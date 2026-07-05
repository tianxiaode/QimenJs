import type { AbilityDefinition } from '@/composable';
import type { DomainConfig } from '@/registry';
import { DomainRegistrar } from '@/registry';
import { DOMAIN_CACHE_SYMBOL } from '../types/abilities';

/**
 * DomainAbility - 域能力
 *
 * 为宿主提供域（Domain）配置信息访问功能。
 * 通过 DomainRegistrar 单例获取域配置，并利用静态缓存机制提升性能。
 * this 指向宿主（ComposableBase），this.domain / this.getStatic / this.setStatic 可直接使用。
 */
export const DomainAbility: AbilityDefinition = {
    domainConfig: {
        get(): DomainConfig {
            // 1. 尝试从缓存获取
            let config = this.getStatic(DOMAIN_CACHE_SYMBOL);

            // 2. 如果没有缓存，则初始化
            if (!config) {
                const domainName = this.domain;
                if (domainName) {
                    config = DomainRegistrar.getInstance().get(domainName);
                    this.setStatic(DOMAIN_CACHE_SYMBOL, config);
                    this.logger?.debug?.(`Domain [${domainName}] initialized and cached.`);
                }
            }

            return config as DomainConfig;
        },
        enumerable: true,
    },
};
