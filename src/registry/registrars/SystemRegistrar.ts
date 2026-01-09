import { ISystemRegistrar, Registrar, SystemConfig, SystemRegistrarName } from '../types';

export class SystemRegistrar implements Registrar<Partial<SystemConfig>>, ISystemRegistrar {
    readonly name = SystemRegistrarName;

    // 静态配置池：这是唯一的真相来源（Source of Truth）
    private static config: Partial<SystemConfig> = {
        locale: 'zh-CN',
        dateFormat: 'YYYY-MM-DD',
        datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
        timezone: 'UTC+8',
        password: {
            minLength: 8,
            maxLength: 16,
            upperCase: true,
            lowerCase: true,
            digit: true,
            specialChar: true,
        },
    };

    /** * 【编码期使用】静态方法
     * 场景：SystemRegistrar.add('theme', 'dark')
     */
    static add(key: string, value: any): void {
        (this.config as any)[key] = value;
    }

    /** * 【满足接口】实例方法：直接操作静态配置池
     * 场景：Registry.system.add('locale', 'en')
     */
    add(key: string, value: any): void {
        SystemRegistrar.add(key, value);
    }

    /** * 【运行期使用】实例批量更新
     * 场景：Registry.system.register('remoteConfig', { locale: 'fr' })
     */
    register(_name: string, entry: Partial<SystemConfig>): void {
        SystemRegistrar.config = { ...SystemRegistrar.config, ...entry };
    }

    unregister(key: string): void {
        delete (SystemRegistrar.config as any)[key];
    }

    get(key: keyof SystemConfig): any {
        return SystemRegistrar.config[key];
    }

    lock(): void {
        Object.freeze(SystemRegistrar.config);
    }

    inspect(): void {
        console.group('🖥️ System Global Configuration');
        console.table(SystemRegistrar.config);
        console.groupEnd();
    }
}
