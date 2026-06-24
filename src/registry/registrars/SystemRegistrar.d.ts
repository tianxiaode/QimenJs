import { SystemConfig } from '../types';
import { RegistrarBase } from './RegistrarBase';
/**
 * 系统配置注册器
 * 管理全局系统配置信息
 *
 * 存储和管理系统级的配置，如语言环境、日期格式、密码策略等
 * 提供默认配置和动态更新功能
 */
export declare class SystemRegistrar extends RegistrarBase<Partial<SystemConfig>> {
    readonly name: "system";
    protected storage: Partial<SystemConfig>;
    /**
     * 注册系统配置
     * 支持两种调用方式：
     * 1. 单个注册: register('locale', 'zh-CN')
     * 2. 对象拆解: register({ locale: 'zh-CN', timezone: 'UTC+8' })
     *
     * @param keyOrObj - 配置键名或包含多个配置的对象
     * @param value - 配置值（当第一个参数为键名时）
     */
    register(keyOrObj: string | Partial<SystemConfig>, value?: any): void;
    /**
     * 批量合并注册配置
     * 一次性更新多个配置项
     *
     * @param obj - 包含多个配置项的对象
     */
    registerAll(obj: Partial<SystemConfig>): void;
    /**
     * 注销指定的配置项
     * 从存储中删除指定键的配置
     *
     * @param key - 要删除的配置键
     */
    unregister(key: string): void;
    /**
     * 获取指定的配置项
     *
     * @param key - 配置键名
     * @returns 配置值
     */
    get(key: keyof SystemConfig): any;
    /**
     * 获取所有系统配置
     *
     * @returns 完整的配置对象
     */
    getAll(): Partial<SystemConfig>;
    /**
     * 输出系统配置注册器的状态信息
     * 显示当前存储的所有配置项
     *
     * @protected
     */
    protected doInspect(): void;
}
//# sourceMappingURL=SystemRegistrar.d.ts.map