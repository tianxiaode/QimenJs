import { SystemConfig, SystemRegistrar } from '@orbitjs/registry';
import { AbilityBase } from './AbilityBase';
import { DOMAIN_CACHE_SYMBOL, IComposableBase } from '../../types';

export class SystemAbility<T extends IComposableBase> extends AbilityBase<T> {
    protected onAttach(): void {
        // 1. 系统配置通常是全局唯一的，甚至不需要存 static 缓存，直接找 Registrar 拿
        // 因为 Registrar 本身就是一个单例，自带缓存属性
        const config = SystemRegistrar.getInstance().getAll();

        // 2. 动态注入到宿主
        Object.assign(this.host, {
            /** 1. 获取全量：适合需要解构多个字段的场景 */
            getSystemConfig: (): Partial<SystemConfig> => {
                return config;
            },

            /** 2. 获取单项：适合只需要一个值，且希望类型安全的场景 */
            getSystemValue: <K extends keyof SystemConfig>(key: K): SystemConfig[K] => {
                return config.get(key);
            },
        });
    }

    protected onDispose(): void {
        const host = this.host as any;
        host.getSystemConfig = null;
        host.getSystemValue = null;
    }
}
