import { createSpringPaginationHandler, getSpringPreHandlers } from '@/data-processor-spring/pre';
import { createSpringExtractHandler, createSpringErrorHandler, getSpringPostHandlers } from '@/data-processor-spring/post';
import { registerSpringHandlers } from '@/data-processor-spring/register';
import type { RequestContext } from '@/context';

function createContext(overrides: Partial<RequestContext> = {}): RequestContext {
    return {
        identity: { domain: 'test' },
        request: {
            url: '/api/test',
            method: 'GET',
            headers: {},
            queryParams: {},
            pathParams: [],
            timeout: 30000,
            responseType: 'json',
            controller: new AbortController(),
        },
        response: {
            status: 200,
            isSuccess: true,
            headers: {},
            data: null,
        },
        data: {
            params: {},
            source: null,
            parsed: null,
            raw: null,
            list: [],
            item: null,
            total: 0,
        },
        isAborted: false,
        error: null,
        steps: [],
        metadata: {
            isTransportFailure: false,
            hasError: false,
            contentType: 'application/json',
            isJson: true,
            isText: false,
            isBlob: false,
            action: 'list',
            isUpload: false,
            isDownload: false,
            isErrorHandled: false,
        },
        ...overrides,
    } as RequestContext;
}

describe('Spring 前道处理器', () => {
    describe('spring-pagination', () => {
        test('应该将 page/pageSize 转换为 Spring 的 page/size（1-based → 0-based）', async () => {
            const handler = createSpringPaginationHandler();
            const ctx = createContext();
            ctx.data.params = { page: 1, pageSize: 20 };

            await handler.handle(ctx);

            expect(ctx.request.queryParams!.page).toBe(0);
            expect(ctx.request.queryParams!.size).toBe(20);
            expect(ctx.data.params.page).toBeUndefined();
            expect(ctx.data.params.pageSize).toBeUndefined();
        });

        test('应该使用默认 pageSize', async () => {
            const handler = createSpringPaginationHandler({ defaultPageSize: 50 });
            const ctx = createContext();
            ctx.data.params = { page: 1 };

            await handler.handle(ctx);

            expect(ctx.request.queryParams!.size).toBe(50);
        });

        test('应该保留 sort 参数', async () => {
            const handler = createSpringPaginationHandler();
            const ctx = createContext();
            ctx.data.params = { page: 1, pageSize: 10, sort: 'name,asc' };

            await handler.handle(ctx);

            expect(ctx.request.queryParams!.sort).toBe('name,asc');
        });

        test('zeroBasedPageIndex=true 时直接使用 page 值', async () => {
            const handler = createSpringPaginationHandler({ zeroBasedPageIndex: true });
            const ctx = createContext();
            ctx.data.params = { page: 0, pageSize: 10 };

            await handler.handle(ctx);

            expect(ctx.request.queryParams!.page).toBe(0);
        });

        test('queryParams 为空时应该自动创建', async () => {
            const handler = createSpringPaginationHandler();
            const ctx = createContext();
            ctx.request.queryParams = undefined;
            ctx.data.params = { page: 1, pageSize: 10 };

            await handler.handle(ctx);

            expect(ctx.request.queryParams).toBeDefined();
            expect(ctx.request.queryParams!.page).toBe(0);
            expect(ctx.request.queryParams!.size).toBe(10);
        });
    });

    describe('getSpringPreHandlers', () => {
        test('应该返回 1 个前道处理器', () => {
            const handlers = getSpringPreHandlers();
            expect(handlers.length).toBe(1);
            expect(handlers[0].name).toBe('spring-pagination');
        });
    });
});

describe('Spring 后道处理器', () => {
    describe('spring-extract', () => {
        test('应该提取 Page<T> 响应', async () => {
            const handler = createSpringExtractHandler();
            const ctx = createContext();
            ctx.response.data = {
                content: [{ id: 1 }, { id: 2 }],
                pageable: { pageNumber: 0, pageSize: 20, offset: 0 },
                totalElements: 100,
                totalPages: 5,
                size: 20,
                number: 0,
                sort: { sorted: false, unsorted: true, empty: true },
                first: true,
                last: false,
                numberOfElements: 2,
                empty: false,
            };

            await handler.handle(ctx);

            expect(ctx.data.list).toEqual([{ id: 1 }, { id: 2 }]);
            expect(ctx.data.total).toBe(100);
            expect(ctx.data.pagination?.total).toBe(100);
            expect(ctx.data.pagination?.pageSize).toBe(20);
            expect(ctx.data.pagination?.pageIndex).toBe(0);
        });

        test('应该处理数组响应', async () => {
            const handler = createSpringExtractHandler();
            const ctx = createContext();
            ctx.response.data = [{ id: 1 }, { id: 2 }];

            await handler.handle(ctx);

            expect(ctx.data.list).toEqual([{ id: 1 }, { id: 2 }]);
            expect(ctx.data.total).toBe(2);
        });

        test('应该处理单个对象响应', async () => {
            const handler = createSpringExtractHandler();
            const ctx = createContext();
            ctx.response.data = { id: 1, name: 'test' };

            await handler.handle(ctx);

            expect(ctx.data.item).toEqual({ id: 1, name: 'test' });
        });

        test('空响应应该跳过', async () => {
            const handler = createSpringExtractHandler();
            const ctx = createContext();
            ctx.response.data = null;

            await handler.handle(ctx);

            expect(ctx.data.list).toEqual([]);
        });
    });

    describe('spring-error', () => {
        test('应该转换 Spring 错误格式', async () => {
            const handler = createSpringErrorHandler();
            const ctx = createContext();
            ctx.response.isSuccess = false;
            ctx.response.data = {
                timestamp: '2024-01-01T00:00:00.000+00:00',
                status: 404,
                error: 'Not Found',
                message: 'Entity not found',
                path: '/api/users/1',
            };

            await handler.handle(ctx);

            expect(ctx.error.code).toBe('SPRING_404');
            expect(ctx.error.message).toBe('Entity not found');
            expect(ctx.error.path).toBe('/api/users/1');
            expect(ctx.metadata.isErrorHandled).toBe(true);
        });

        test('应该处理验证错误', async () => {
            const handler = createSpringErrorHandler();
            const ctx = createContext();
            ctx.response.isSuccess = false;
            ctx.response.data = {
                timestamp: '2024-01-01T00:00:00.000+00:00',
                status: 400,
                error: 'Bad Request',
                message: 'Validation failed',
                path: '/api/users',
                errors: [
                    { field: 'name', message: 'Name is required', rejectedValue: null },
                ],
            };

            await handler.handle(ctx);

            expect(ctx.error.errors.length).toBe(1);
            expect(ctx.error.errors[0].field).toBe('name');
        });

        test('成功响应时 shouldExecute 返回 false', () => {
            const handler = createSpringErrorHandler();
            const ctx = createContext();
            ctx.response.isSuccess = true;

            expect(handler.shouldExecute?.(ctx)).toBe(false);
        });
    });

    describe('getSpringPostHandlers', () => {
        test('应该返回 2 个后道处理器', () => {
            const handlers = getSpringPostHandlers();
            expect(handlers.length).toBe(2);
            expect(handlers.map(h => h.name)).toEqual(['spring-extract', 'spring-error']);
        });
    });
});

describe('registerSpringHandlers', () => {
    test('应该注册所有 Spring 处理器到 DataProcessor', () => {
        const { DataProcessor } = require('@/data-processor');
        const beforeCount = DataProcessor.getPipeline('spring').length;

        registerSpringHandlers({ defaultPageSize: 20 });

        const afterCount = DataProcessor.getPipeline('spring').length;
        expect(afterCount).toBeGreaterThan(beforeCount);

        // 清理
        DataProcessor.unregister('spring-pagination');
        DataProcessor.unregister('spring-extract');
        DataProcessor.unregister('spring-error');
    });
});
