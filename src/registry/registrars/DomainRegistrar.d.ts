import { DomainConfig } from '../types';
import { RegistrarBase } from './RegistrarBase';
/**
 * 域配置注册器
 * 管理不同域名的配置信息
 *
 * 用于存储和管理多个API端点或服务域的配置信息，
 * 支持不同的超时时长、分页配置、公共参数等
 */
export declare class DomainRegistrar extends RegistrarBase<Map<string, DomainConfig>> {
    readonly name: "domain";
    /**
     * 存储域名称到域配置的映射
     * 使用Map结构提供高效的键值对存储和检索
     * @protected
     */
    protected storage: Map<string, DomainConfig>;
    /**
     * 注册一个域配置
     *
     * @param name - 域名称，作为唯一标识符
     * @param config - 域配置对象，包含API端点的相关设置
     * @param force - 是否强制注册（覆盖已有配置），默认为 false
     * @throws RegistrarConflictError - 当配置名称冲突且未使用 force 时
     */
    register(name: string, config: DomainConfig, force?: boolean): void;
    /**
     * 删除一个域配置
     * 从存储中移除指定名称的配置
     *
     * @param name - 要删除的域名称
     */
    unregister(name: string): void;
    /**
     * 获取域配置
     *
     * @param name - 域名称
     * @returns 域配置对象
     */
    get(name: string): DomainConfig;
    /**
     * 获取域的基地址
     * 便捷方法，直接返回指定域的baseUrl
     *
     * @param name - 域名称
     * @returns 域的基地址
     */
    getBaseUrl(name: string): string;
    /**
     * 更新 token
     *
     * 批量更新多个域的 token
     *
     * @param token - Token 字符串
     * @param domains - 域名列表（可变参数）
     */
    updateToken(token: string, ...domains: string[]): void;
    /**
     * 清除 token
     *
     * 批量清除多个域的 token
     *
     * @param domains - 域名列表（可变参数）
     */
    clearToken(...domains: string[]): void;
    /**
     * 输出域注册器的状态信息
     * 显示当前存储的所有域名称和对应的基地址
     *
     * @protected
     */
    protected doInspect(): void;
}
//# sourceMappingURL=DomainRegistrar.d.ts.map