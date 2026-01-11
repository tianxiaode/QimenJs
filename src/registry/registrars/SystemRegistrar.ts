import { SystemConfig, SystemRegistrarName } from '../types';

export class SystemRegistrar{
    static readonly registrarName = SystemRegistrarName;

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
    static register(key: string, value: any): void {
        (this.config as any)[key] = value;
    }

    static unregister(key: string): void {
        delete (SystemRegistrar.config as any)[key];
    }

    static get(key: keyof SystemConfig): any {
        return SystemRegistrar.config[key];
    }

    static lock(): void {
        Object.freeze(SystemRegistrar.config);
    }

    static inspect(): void {
        console.group('🖥️ System Global Configuration');
        console.table(SystemRegistrar.config);
        console.groupEnd();
    }
}
