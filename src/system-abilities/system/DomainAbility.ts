import type { AbilityDefinition } from '@/composable';
import type { DomainConfig } from '@/registry';
import { DomainRegistrar } from '@/registry';

/**
 * DomainAbility - 域能力
 *
 * 为宿主提供域（Domain）配置信息访问功能。
 * 通过 DomainRegistrar 单例获取域配置，并利用 abilityState 缓存提升性能。
 * this 指向宿主（ComposableBase），this.domain 可直接使用。
 */
export const DomainAbility = {
    domainConfig: {
        get(): DomainConfig {
            return this.abilityState('DomainAbility:config', () => {
                const domainName = this.domain;
                if (domainName) {
                    const config = DomainRegistrar.getInstance().get(domainName);
                    this.logger?.debug?.(`Domain [${domainName}] initialized and cached.`);
                    return config;
                }
                return undefined;
            });
        },
        enumerable: true,
    },
} satisfies AbilityDefinition;
