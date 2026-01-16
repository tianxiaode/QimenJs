import { DomainConfig, DomainRegistrar } from '@orbitjs/registry';
import { AbilityBase } from '../../composable';
import { DOMAIN_CACHE_SYMBOL,IComposableBase, IExposeResult } from '../../types';

export class DomainAbility<T extends IComposableBase> extends AbilityBase<T> {
    protected expose(): IExposeResult {
        const host = this.host;

        // 1. 获取/初始化静态缓存 (这部分逻辑保留，用于性能优化)
        let config = host.getStatic(DOMAIN_CACHE_SYMBOL);

        if (!config) {
            const domainName = host.domain;
            if (domainName) {
                config = DomainRegistrar.getInstance().get(domainName);
                host.setStatic(DOMAIN_CACHE_SYMBOL, config);
                host.logger?.debug?.(`Domain [${domainName}] initialized and cached.`);
            }
        }

        return {
            domainConfig: {
                get: () => config as DomainConfig,
                enumerable: true,
            },
        };
    }
}
