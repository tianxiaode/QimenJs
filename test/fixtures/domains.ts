/**
 * 测试域配置工厂
 *
 * 提供统一的测试域注册和清理功能，避免每个测试文件重复编写域配置代码。
 */
import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import type { DomainConfig } from '@/registry/types';

export interface TestDomainConfig {
    name: string;
    baseUrl?: string;
    preset?: 'abp' | 'spring' | 'default' | string;
    token?: string;
    commonParams?: Record<string, any>;
    pageSize?: number;
    pagesizes?: number[];
    timeout?: number;
}

const DEFAULT_BASE_URL = 'https://test-api.example.com';

/**
 * 注册测试域，返回清理函数
 */
export function registerTestDomain(config: TestDomainConfig): () => void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    const domainConfig: DomainConfig = {
        baseUrl: config.baseUrl || DEFAULT_BASE_URL,
        preset: config.preset || 'default',
        pageSize: config.pageSize || 10,
        pagesizes: config.pagesizes || [10, 20, 50],
        timeout: config.timeout,
        commonParams: config.commonParams,
        token: config.token,
    };

    domainRegistrar.register(config.name, domainConfig, true);

    return () => {
        domainRegistrar.unregister(config.name);
    };
}

/**
 * 注册 OAuth2 测试域
 */
export function registerOAuth2TestDomain(name: string = 'test-oauth'): () => void {
    return registerTestDomain({
        name,
        baseUrl: DEFAULT_BASE_URL,
        preset: 'default',
    });
}

/**
 * 清理指定测试域
 */
export function cleanupTestDomain(name: string): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    domainRegistrar.unregister(name);
}
