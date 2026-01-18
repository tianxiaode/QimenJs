import { DomainConfig, DomainRegistrar } from '@orbitjs/registry';
import { AbilityBase } from '../../composable';
import { DOMAIN_CACHE_SYMBOL, IComposableBase, IExposeResult } from '../../types';

/**
 * DomainAbility - 域能力类
 *
 * 该能力为宿主对象提供域（Domain）相关的配置信息访问功能。
 * 它通过 DomainRegistrar 单例获取域配置，并利用静态缓存机制提升性能。
 */
export class DomainAbility<T extends IComposableBase> extends AbilityBase<T> {
    /**
     * 暴露域配置供宿主对象使用
     *
     * 此方法实现了父类的 expose 抽象方法，返回一个包含可枚举属性的对象，
     * 该对象提供了对当前宿主所属域的配置信息的只读访问。
     *
     * @returns 包含暴露给宿主对象的功能和属性的结果对象
     */
    protected expose(): IExposeResult {
        const host = this.host;

        // 1. 尝试从宿主的静态存储中获取已缓存的域配置，避免重复查询
        let config = host.getStatic<DomainConfig>(DOMAIN_CACHE_SYMBOL);

        // 2. 如果缓存中没有找到配置，则进行初始化
        if (!config) {
            // 获取宿主对象声明的域名称
            const domainName = host.domain;
            if (domainName) {
                // 通过 DomainRegistrar 单例根据域名获取完整的配置
                config = DomainRegistrar.getInstance().get(domainName);
                // 将获取到的配置缓存到宿主的静态存储中，以供后续快速访问
                host.setStatic(DOMAIN_CACHE_SYMBOL, config);
                // 记录调试日志，表明域已成功初始化并缓存
                host.logger?.debug?.(`Domain [${domainName}] initialized and cached.`);
            }
        }

        return {
            /**
             * domainConfig - 域配置属性
             *
             * 一个可枚举的属性，其 getter 函数返回当前宿主对象所关联的域配置。
             * 配置内容由 DomainRegistrar 管理，本能力负责提供安全、高效的访问。
             */
            domainConfig: {
                get: (): DomainConfig => config as DomainConfig,
                enumerable: true,
            },
        };
    }
}
