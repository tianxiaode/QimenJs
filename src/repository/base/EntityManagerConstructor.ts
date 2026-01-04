import { HttpClient } from '@orbitjs/http';
import { EntityManagerConfig } from '../types';
import { CoreEntityManager } from './CoreEntityManager';
import { EntityManagerConfigNotFoundError, EntityManagerClassNotFoundError } from '../errors';

type EntityManagerConstructor<T extends CoreEntityManager> = new (config: EntityManagerConfig) => T;

export class EntityManagerFactory {
    private static configs = new Map<string, EntityManagerConfig>();
    // 缓存池，Key 变为 "configName:entityManagerName" 以便复用同一个 Manager 类对接不同后端
    private static instances = new Map<string, any>();

    private static entityManagers = new Map<string, EntityManagerConstructor<CoreEntityManager>>();

    /**
     * 1. 注册配置域 (只存发动机配置)
     */
    static registerConfig(name: string, config: EntityManagerConfig) {
        this.configs.set(name, config);
    }

    static registerEntityManager<T extends CoreEntityManager>(
        name: string,
        entityManager: EntityManagerConstructor<T>
    ) {
        this.entityManagers.set(name, entityManager as EntityManagerConstructor<CoreEntityManager>);
    }
    /**
     * 2. 创建一个纯净的新实例 (多实例模式)
     * 适用于：下拉列表、弹窗等需要独立状态的场景
     */
    static create<T extends CoreEntityManager>(entityManagerName: string, configName: string): T {
        const { config, EntityManagerCtor } = this.resolveResources(entityManagerName, configName);
        return new EntityManagerCtor(config) as T;
    }

    /**
     * 获取指定域的 HttpClient
     * 场景：用于那些不需要定义 Manager 类，但需要复用全局配置（如 Token、错误处理）的临时请求
     */
    static getHttpClient(configName: string): HttpClient {
        const config = this.configs.get(configName);
        if (!config) {
            throw new EntityManagerConfigNotFoundError(configName);
        }
        // 返回该域名下预装好的 HttpClient 实例
        return config.httpClient;
    }

    /**
     * 获取方法通过泛型 T 动态回传具体的子类类型（如 UserEntityManager）
     */
    static get<T extends CoreEntityManager>(entityManagerName: string, configName: string): T {
        const key = `${configName}:${entityManagerName}`;
        if (this.instances.has(key)) return this.instances.get(key);

        const { config, EntityManagerCtor } = this.resolveResources(entityManagerName, configName);

        const instance = new EntityManagerCtor(config) as T;
        this.instances.set(key, instance);
        return instance;
    }

    /**
     * [核心重构] 资源解析器
     * 统一处理配置和构造器的查找逻辑，集中抛错
     */
    private static resolveResources(entityManagerName: string, configName: string) {
        const config = this.configs.get(configName);
        if (!config) {
            throw new EntityManagerConfigNotFoundError(configName);
        }

        const EntityManagerCtor = this.entityManagers.get(entityManagerName);
        if (!EntityManagerCtor) {
            throw new EntityManagerClassNotFoundError(entityManagerName);
        }

        return { config, EntityManagerCtor };
    }
}