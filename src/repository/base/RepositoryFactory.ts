import { HttpClient } from '@orbitjs/http';
import { RepositoryConfig } from '../types';
import { CoreRepository } from './CoreRepository';
import { RepositoryConfigNotFoundError, RepositoryClassNotFoundError } from '../errors';

type RepositoryConstructor<T extends CoreRepository> = new (config: RepositoryConfig) => T;

export class RepositoryFactory {
    private static configs = new Map<string, RepositoryConfig>();
    // 缓存池，Key 变为 "configName:repoName" 以便复用同一个 Repo 类对接不同后端
    private static instances = new Map<string, any>();

    private static repositories = new Map<string, RepositoryConstructor<CoreRepository>>();

    /**
     * 1. 注册配置域 (只存发动机配置)
     */
    static registerConfig(name: string, config: RepositoryConfig) {
        this.configs.set(name, config);
    }

    static registerRepository<T extends CoreRepository>(
        name: string,
        repo: RepositoryConstructor<T>
    ) {
        this.repositories.set(name, repo as RepositoryConstructor<CoreRepository>);
    }
    /**
     * 2. 创建一个纯净的新实例 (多实例模式)
     * 适用于：下拉列表、弹窗等需要独立状态的场景
     */
    static create<T extends CoreRepository>(repositoryName: string, configName: string): T {
        const { config, RepoCtor } = this.resolveResources(repositoryName, configName);
        return new RepoCtor(config) as T;
    }

    /**
     * 获取指定域的 HttpClient
     * 场景：用于那些不需要定义 Repo 类，但需要复用全局配置（如 Token、错误处理）的临时请求
     */
    static getHttpClient(configName: string): HttpClient {
        const config = this.configs.get(configName);
        if (!config) {
            throw new RepositoryConfigNotFoundError(configName);
        }
        // 返回该域名下预装好的 HttpClient 实例
        return config.httpClient;
    }

    /**
     * 获取方法通过泛型 T 动态回传具体的子类类型（如 UserRepo）
     */
    static get<T extends CoreRepository>(repositoryName: string, configName: string): T {
        const key = `${configName}:${repositoryName}`;
        if (this.instances.has(key)) return this.instances.get(key);

        const { config, RepoCtor } = this.resolveResources(repositoryName, configName);

        const instance = new RepoCtor(config) as T;
        this.instances.set(key, instance);
        return instance;
    }

    /**
     * [核心重构] 资源解析器
     * 统一处理配置和构造器的查找逻辑，集中抛错
     */
    private static resolveResources(repositoryName: string, configName: string) {
        const config = this.configs.get(configName);
        if (!config) {
            throw new RepositoryConfigNotFoundError(configName);
        }

        const RepoCtor = this.repositories.get(repositoryName);
        if (!RepoCtor) {
            throw new RepositoryClassNotFoundError(repositoryName);
        }

        return { config, RepoCtor };
    }
}