import { DomainConfig, DomainRegistrarName } from '../types';
import { RegistrarBase } from './RegistrarBase';
import { RegistrarConflictError } from './errors';

/**
 * 域配置注册器
 * 管理不同域名的配置信息
 */
export class DomainRegistrar extends RegistrarBase<Map<string, DomainConfig>> {
    public readonly name = DomainRegistrarName;
    
    /**
     * 存储域名称到域配置的映射
     * @protected
     */
    protected storage = new Map<string, DomainConfig>();

    /**
     * 注册一个域配置
     * @param name - 域名称
     * @param config - 域配置
     * @param force - 是否强制注册（覆盖已有配置）
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
     * @param name - 要删除的域名称
     */
    unregister(name: string): void {
        this.checkLock();
        this.storage.delete(name);
    }
    
    /**
     * 获取域配置
     * @param name - 域名称
     * @returns 域配置对象
     */
    get(name: string): DomainConfig {
        return this.storage.get(name)!;
    }

    /**
     * 获取域的基地址
     * @param name - 域名称
     * @returns 域的基地址
     */
    getBaseUrl(name: string): string {
        const config = this.storage.get(name);
        return config!.baseUrl;
    }

    /**
     * 输出域注册器的状态信息
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