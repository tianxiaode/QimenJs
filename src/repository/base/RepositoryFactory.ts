import { HttpClient } from '@orbitjs/http';
import { CrudRepository } from './CrudRepository';
import { RepositoryConfig } from '../types';

export class RepositoryFactory {
    private static configs = new Map<string, RepositoryConfig>();
    // 缓存池，Key 变为 "configName:repoName" 以便复用同一个 Repo 类对接不同后端
    private static instances = new Map<string, any>();

    private static repositories = new Map<string,any>();

    /**
     * 1. 注册配置域 (只存发动机配置)
     */
    static registerConfig(name: string, config: RepositoryConfig) {
        this.configs.set(name, config);
    }

    static registerRepository(name: string, repo: any) {
        this.repositories.set(name, repo);
    }

    /**
     * 2. 创建一个纯净的新实例 (多实例模式)
     * 适用于：下拉列表、弹窗等需要独立状态的场景
     */
    static create<T extends CrudRepository>(repositoryName: string, configName: string): T {
        const config = this.configs.get(configName);
        if (!config) throw new Error(`Config domain ${configName} not found`);

        const repoCtor = this.repositories.get(repositoryName);
        if (!repoCtor) throw new Error(`Repository ${repositoryName} not found`);

        return new repoCtor(config);
    }

    /**
     * 获取指定域的 HttpClient
     * 场景：用于那些不需要定义 Repo 类，但需要复用全局配置（如 Token、错误处理）的临时请求
     */
    static getHttpClient(configName: string): HttpClient {
        const config = this.configs.get(configName);
        if (!config) {
            throw new Error(`[RepositoryFactory] Config domain "${configName}" not found.`);
        }
        // 返回该域名下预装好的 HttpClient 实例
        return config.httpClient;
    }

    static get<T extends CrudRepository>(repositoryName: string, configName: string): T {
        const key = `${configName}:${repositoryName}`;

        if (this.instances.has(key)) {
            return this.instances.get(key);
        }

        const config = this.configs.get(configName);
        if (!config) throw new Error(`Config domain ${configName} not found`);
        const repoCtor = this.repositories.get(repositoryName);
        if(!repoCtor) throw new Error(`Repository ${repositoryName} not found`);

        const instance = new repoCtor(config);
        this.instances.set(key, instance);
        return instance;
    }
}
