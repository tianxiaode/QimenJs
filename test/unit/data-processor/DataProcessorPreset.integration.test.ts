/**
 * DomainRegistrar → DataProcessor preset 集成测试
 *
 * 验证 domain 的 preset 配置是否正确传递到 DataProcessor 管道选择：
 * 1. DomainRegistrar 注册不同 preset 的 domain
 * 2. CoreEntityManager.getDataProcessorPreset() 返回正确的 preset
 * 3. DataProcessorRegistrar.getPipeline() 根据 preset 返回正确的处理器
 * 4. ABP preset 的 post-processor 正确解包 PagedResultDto
 * 5. Spring preset 的 post-processor 正确解包 Page<T>
 * 6. default preset 不执行任何数据处理
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            }))
        }
    };
});

import { RegistryHub } from '@/registry/RegistryHub';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';
import { DataProcessor, dataProcessorExecutor } from '@/data-processor';
import { RequestContextBuilder } from '@/context/RequestContextBuilder';
import type { RequestContext } from '@/context';

// 确保 ABP 和 Spring 处理器已注册
import '@/data-processor-abp/register';
import '@/data-processor-spring/register';

// ============================================
// 辅助：注册测试域
// ============================================

const ABP_DOMAIN = 'dp-test-abp';
const SPRING_DOMAIN = 'dp-test-spring';
const DEFAULT_DOMAIN = 'dp-test-default';

function ensureDomains(): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    if (!domainRegistrar) return;

    if (domainRegistrar.get(ABP_DOMAIN)) domainRegistrar.unregister(ABP_DOMAIN);
    if (domainRegistrar.get(SPRING_DOMAIN)) domainRegistrar.unregister(SPRING_DOMAIN);
    if (domainRegistrar.get(DEFAULT_DOMAIN)) domainRegistrar.unregister(DEFAULT_DOMAIN);

    domainRegistrar.register(ABP_DOMAIN, {
        baseUrl: 'http://localhost:3001',
        preset: 'abp',
        pageSize: 10,
        pagesizes: [10, 20, 50],
    });

    domainRegistrar.register(SPRING_DOMAIN, {
        baseUrl: 'http://localhost:3002',
        preset: 'spring',
        pageSize: 10,
        pagesizes: [10, 20, 50],
    });

    domainRegistrar.register(DEFAULT_DOMAIN, {
        baseUrl: 'http://localhost:3003',
        preset: 'default',
        pageSize: 10,
        pagesizes: [10, 20, 50],
    });
}

function removeDomains(): void {
    const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
    if (!domainRegistrar) return;
    [ABP_DOMAIN, SPRING_DOMAIN, DEFAULT_DOMAIN].forEach(d => {
        if (domainRegistrar.get(d)) domainRegistrar.unregister(d);
    });
}

// ============================================
// 测试
// ============================================

describe('DomainRegistrar → DataProcessor preset 集成测试', () => {
    beforeEach(() => {
        ensureDomains();
    });

    afterEach(() => {
        removeDomains();
    });

    // ========================================
    // 1. DomainRegistrar preset 配置
    // ========================================

    describe('DomainRegistrar preset 配置', () => {
        it('ABP domain 应该有 preset=abp', () => {
            const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
            const config = domainRegistrar!.get(ABP_DOMAIN);

            expect(config.preset).toBe('abp');
        });

        it('Spring domain 应该有 preset=spring', () => {
            const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
            const config = domainRegistrar!.get(SPRING_DOMAIN);

            expect(config.preset).toBe('spring');
        });

        it('default domain 应该有 preset=default', () => {
            const domainRegistrar = RegistryHub.get<DomainRegistrar>('domain');
            const config = domainRegistrar!.get(DEFAULT_DOMAIN);

            expect(config.preset).toBe('default');
        });
    });

    // ========================================
    // 2. DataProcessorRegistrar.getPipeline() 按 preset 过滤
    // ========================================

    describe('DataProcessorRegistrar.getPipeline() 按 preset 过滤', () => {
        it('ABP pre-pipeline 应该包含 abp-pagination', () => {
            const pipeline = DataProcessor.getPipeline('abp', 'pre');

            const names = pipeline.map((h: any) => h.name);
            expect(names).toContain('abp-pagination');
        });

        it('ABP post-pipeline 应该包含 abp-extract', () => {
            const pipeline = DataProcessor.getPipeline('abp', 'post');

            const names = pipeline.map((h: any) => h.name);
            expect(names).toContain('abp-extract');
        });

        it('Spring pre-pipeline 应该包含 spring-pagination', () => {
            const pipeline = DataProcessor.getPipeline('spring', 'pre');

            const names = pipeline.map((h: any) => h.name);
            expect(names).toContain('spring-pagination');
        });

        it('Spring post-pipeline 应该包含 spring-extract', () => {
            const pipeline = DataProcessor.getPipeline('spring', 'post');

            const names = pipeline.map((h: any) => h.name);
            expect(names).toContain('spring-extract');
        });

        it('default pipeline 应该为空或只有 any 标签的处理器', () => {
            const prePipeline = DataProcessor.getPipeline('default', 'pre');
            const postPipeline = DataProcessor.getPipeline('default', 'post');

            // default preset 没有专属处理器
            expect(prePipeline.length).toBe(0);
            expect(postPipeline.length).toBe(0);
        });

        it('ABP pipeline 不应该包含 Spring 处理器', () => {
            const abpPre = DataProcessor.getPipeline('abp', 'pre');
            const abpPost = DataProcessor.getPipeline('abp', 'post');

            const names = [...abpPre, ...abpPost].map((h: any) => h.name);
            expect(names).not.toContain('spring-pagination');
            expect(names).not.toContain('spring-extract');
        });

        it('Spring pipeline 不应该包含 ABP 处理器', () => {
            const springPre = DataProcessor.getPipeline('spring', 'pre');
            const springPost = DataProcessor.getPipeline('spring', 'post');

            const names = [...springPre, ...springPost].map((h: any) => h.name);
            expect(names).not.toContain('abp-pagination');
            expect(names).not.toContain('abp-extract');
        });
    });

    // ========================================
    // 3. ABP post-processor 数据解包
    // ========================================

    describe('ABP post-processor 数据解包', () => {
        it('应该从 PagedResultDto 格式提取 list 和 total', async () => {
            // 模拟 ABP 后端返回的 PagedResultDto 格式
            // ABP 的 PagedResultDto 是 { items: [], totalCount: 0 }
            const abpResponse = {
                items: [
                    { id: 1, userName: 'admin', name: 'Admin' },
                    { id: 2, userName: 'user', name: 'User' },
                ],
                totalCount: 2,
            };

            const context = RequestContextBuilder
                .create()
                .withDomain(ABP_DOMAIN)
                .withUrl('/api/app/user')
                .build();

            // ABP extract 从 context.response.data 读取
            context.response.data = abpResponse;

            const handlers = DataProcessor.getPipeline('abp', 'post');
            await dataProcessorExecutor.execute(context, handlers, 'post');

            // ABP extract 应该将 items 提取到 context.data.list
            expect(context.data.list).toBeDefined();
            expect(context.data.list.length).toBe(2);
            expect(context.data.total).toBe(2);
        });
    });

    // ========================================
    // 4. Spring post-processor 数据解包
    // ========================================

    describe('Spring post-processor 数据解包', () => {
        it('应该从 Page<T> 格式提取 list 和 total', async () => {
            // 模拟 Spring 后端返回的 Page<T> 格式
            const springResponse = {
                content: [
                    { id: 1, orderName: 'Order 1' },
                    { id: 2, orderName: 'Order 2' },
                ],
                totalElements: 2,
                number: 0,
                size: 10,
            };

            const context = RequestContextBuilder
                .create()
                .withDomain(SPRING_DOMAIN)
                .withUrl('/api/orders')
                .build();

            // Spring extract 从 context.response.data 读取
            context.response.data = springResponse;

            const handlers = DataProcessor.getPipeline('spring', 'post');
            await dataProcessorExecutor.execute(context, handlers, 'post');

            // Spring extract 应该将 content 提取到 context.data.list
            expect(context.data.list).toBeDefined();
            expect(context.data.list.length).toBe(2);
            expect(context.data.total).toBe(2);
        });
    });

    // ========================================
    // 5. RequestContextBuilder.build() 与 domainConfig 集成
    // ========================================

    describe('RequestContextBuilder.build() 与 domainConfig 集成', () => {
        it('ABP domain 的 context 应该包含 preset=abp 的 domainConfig', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain(ABP_DOMAIN)
                .withUrl('/api/app/user')
                .build();

            expect(context.metadata.domainConfig).toBeDefined();
            expect(context.metadata.domainConfig.preset).toBe('abp');
        });

        it('Spring domain 的 context 应该包含 preset=spring 的 domainConfig', () => {
            const context = RequestContextBuilder
                .create()
                .withDomain(SPRING_DOMAIN)
                .withUrl('/api/orders')
                .build();

            expect(context.metadata.domainConfig).toBeDefined();
            expect(context.metadata.domainConfig.preset).toBe('spring');
        });
    });
});
