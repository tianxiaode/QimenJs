import { SystemConfig, SystemRegistrarName } from '../types';
import { RegistrarBase } from './RegistrarBase';

export class SystemRegistrar extends RegistrarBase<Partial<SystemConfig>> {
    public readonly name = SystemRegistrarName;

    // 静态配置池：这是唯一的真相来源（Source of Truth）
    protected storage: Partial<SystemConfig> = {
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

    /**
     * 支持两种调用方式：
     * 1. 单个注册: register('locale', 'zh-CN')
     * 2. 对象拆解: register({ locale: 'zh-CN', timezone: 'UTC+8' })
     */
    register(keyOrObj: string | Partial<SystemConfig>, value?: any): void {
        this.checkLock();

        if (typeof keyOrObj === 'object' && keyOrObj !== null) {
            // 模式 2：拆解对象注册
            Object.assign(this.storage, keyOrObj);
        } else if (typeof keyOrObj === 'string') {
            // 模式 1：单个 Key 注册
            (this.storage as any)[keyOrObj] = value;
        }
    }

    /**
     * 批量合并注册配置
     * 场景：SystemRegistrar.registerAll({ locale: 'en-US', theme: 'light' })
     */
    registerAll(obj: Partial<SystemConfig>): void {
        this.checkLock();

        // 使用 Object.assign 进行一级合并
        // 如果需要处理 password 这种嵌套对象，建议使用简单的递归合并
        Object.assign(this.storage, obj);
    }

    unregister(key: string): void {
        this.checkLock();
        delete (this.storage as any)[key];
    }

    get(key: keyof SystemConfig): any {
        return this.storage[key];
    }

    public getAll(): Partial<SystemConfig> {
        return this.storage;
    }

    protected doInspect(): void {
        console.group('🖥️ System Global Configuration');
        console.table(this.storage);
        console.groupEnd();
    }
}
