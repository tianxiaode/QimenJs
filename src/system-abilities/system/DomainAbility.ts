import { AbilityBase, type IExposeResult } from '@/composable';
import type { DomainConfig } from '@/registry';
import { DomainRegistrar } from '@/registry';
import { DOMAIN_CACHE_SYMBOL } from '../types/abilities';

/**
 * DomainAbility - 域能力类
 *
 * 该能力为宿主对象提供域（Domain）相关的配置信息访问功能。
 * 它通过 DomainRegistrar 单例获取域配置，并利用静态缓存机制提升性能。
 */
export class DomainAbility extends AbilityBase {
    /**
     * 暴露域配置供宿主对象使用
     */
    protected expose(host: any): IExposeResult {
        return {
            /**
             * 域配置属性
             * 
             * 使用 getter 延迟获取配置
             */
            domainConfig: {
                get: (): DomainConfig => {
                    // 1. 尝试从缓存获取
                    let config = host.getStatic(DOMAIN_CACHE_SYMBOL);
                    
                    // 2. 如果没有缓存，则初始化
                    if (!config) {
                        const domainName = host.domain;
                        if (domainName) {
                            config = DomainRegistrar.getInstance().get(domainName);
                            host.setStatic(DOMAIN_CACHE_SYMBOL, config);
                            host.logger?.debug?.(`Domain [${domainName}] initialized and cached.`);
                        }
                    }
                    
                    return config as DomainConfig;
                },
                enumerable: true,
            },
        };
    }
}
