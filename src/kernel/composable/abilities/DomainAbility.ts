import { DomainConfig, DomainRegistrar } from '@orbitjs/registry';
import { AbilityBase } from './AbilityBase';
import { DOMAIN_CACHE_SYMBOL, IComposableBase } from '../../types';

export class DomainAbility<T extends IComposableBase> extends AbilityBase<T> {
    protected onAttach(): void {
        // 1. 获取/初始化静态缓存
        let config = this.host.getStatic(DOMAIN_CACHE_SYMBOL);

        if (!config) {
            const domainName = (this.host as any).domain;
            if (domainName) {
                config = DomainRegistrar.getInstance().get(domainName);
                this.host.setStatic(DOMAIN_CACHE_SYMBOL, config);
                (this.host as any).logger?.debug?.(`Domain [${domainName}] initialized.`);
            }
        }

        // 2. 【关键修正】：注入方法必须放在 if 块外面
        // 确保无论是第一个实例还是后续命缓存的实例，都能拿到 getDomainConfig
        if (config) {
            Object.assign(this.host, {
                getDomainConfig: (): DomainConfig => config as DomainConfig,
            });
        }
    }

    protected onDispose(): void {
        // 按照你之前的模式，清理 host 上的注入，防止内存泄露或逻辑残留
        (this.host as any).getDomainConfig = null;
    }
}
