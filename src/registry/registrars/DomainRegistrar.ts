import { DomainConfig, DomainRegistrarName } from '../types';
import { RegistrarBase } from './RegistrarBase';
import { RegistrarConflictError } from './errors';

/**
 * 域配置注册器
 * 管理不同域名的配置信息
 *
 * 用于存储和管理多个API端点或服务域的配置信息，
 * 支持不同的超时时长、分页配置、公共参数等
 */
export class DomainRegistrar extends RegistrarBase<Map<string, DomainConfig>> {
    public readonly name = DomainRegistrarName;

    /**
     * 存储域名称到域配置的映射
     * 使用Map结构提供高效的键值对存储和检索
     * @protected
     */
    protected storage = new Map<string, DomainConfig>();

    /**
     * 注册一个域配置
     *
     * @param name - 域名称，作为唯一标识符
     * @param config - 域配置对象，包含API端点的相关设置
     * @param force - 是否强制注册（覆盖已有配置），默认为 false
     * @throws RegistrarConflictError - 当配置名称冲突且未使用 force 时
     */
    register(name: string, config: DomainConfig, force = false): void {
        this.checkLock();

        // 1. 如果不强制且已存在，直接炸掉，不给任何模糊空间
        if (!force && this.storage.has(name)) {
            throw new RegistrarConflictError(this.name, name);
        }

        // 2. 只有两种情况会走到这：要么是新的，要么你明确说了要覆盖
        this.storage.set(name, config);
    }

    /**
     * 删除一个域配置
     * 从存储中移除指定名称的配置
     *
     * @param name - 要删除的域名称
     */
    unregister(name: string): void {
        this.checkLock();
        this.storage.delete(name);
    }

    /**
     * 获取域配置
     *
     * @param name - 域名称
     * @returns 域配置对象
     */
    get(name: string): DomainConfig {
        return this.storage.get(name)!;
    }

    /**
     * 获取域的基地址
     * 便捷方法，直接返回指定域的baseUrl
     *
     * @param name - 域名称
     * @returns 域的基地址
     */
    getBaseUrl(name: string): string {
        const config = this.storage.get(name);
        return config!.baseUrl;
    }

    /**
     * 更新 token
     *
     * 批量更新多个域的 token
     *
     * @param token - Token 字符串
     * @param domains - 域名列表（可变参数）
     */
    updateToken(token: string, ...domains: string[]): void {
        domains.forEach(domain => {
            const config = this.storage.get(domain);
            if (config) {
                config.token = token;
            }
        });
    }

    /**
     * 清除 token
     *
     * 批量清除多个域的 token
     *
     * @param domains - 域名列表（可变参数）
     */
    clearToken(...domains: string[]): void {
        domains.forEach(domain => {
            const config = this.storage.get(domain);
            if (config) {
                config.token = undefined;
            }
        });
    }

    /**
     * 输出域注册器的状态信息
     * 显示当前存储的所有域名称和对应的基地址
     *
     * @protected
     */
    protected doInspect(): void {
        console.group('🌐 Domain Registry Status');
        const summary: Record<string, string> = {};
        this.storage.forEach((config, name) => {
            summary[name] = config.baseUrl;
        });
        console.table(summary);
        console.groupEnd();
    }
}
