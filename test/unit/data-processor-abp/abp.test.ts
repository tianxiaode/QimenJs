import { createAbpPaginationHandler, createAbpTenantHeaderHandler, getAbpPreHandlers } from '@/data-processor-abp/pre';
import {
    createAbpExtractHandler,
    createAbpAuditCleanHandler,
    createAbpSoftDeleteFilterHandler,
    createAbpErrorHandler,
    convertToFieldErrors,
    getAbpPostHandlers,
} from '@/data-processor-abp/post';
import { registerAbpHandlers } from '@/data-processor-abp/register';
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

describe('ABP 前道处理器', () => {
    describe('abp-pagination', () => {
        test('应该将 page/pageSize 转换为 skipCount/maxResultCount（1-based → 0-based skip）', async () => {
            const handler = createAbpPaginationHandler();
            const ctx = createContext();
            ctx.data.params = { page: 2, pageSize: 20 };

            await handler.handle(ctx);

            expect(ctx.request.queryParams!.skipCount).toBe(20);
            expect(ctx.request.queryParams!.maxResultCount).toBe(20);
            expect(ctx.data.params.page).toBeUndefined();
            expect(ctx.data.params.pageSize).toBeUndefined();
        });

        test('应该支持 page/size 别名', async () => {
            const handler = createAbpPaginationHandler();
            const ctx = createContext();
            ctx.data.params = { page: 1, size: 15 };

            await handler.handle(ctx);

            expect(ctx.request.queryParams!.skipCount).toBe(0);
            expect(ctx.request.queryParams!.maxResultCount).toBe(15);
        });

        test('应该使用默认 pageSize', async () => {
            const handler = createAbpPaginationHandler({ defaultPageSize: 25 });
            const ctx = createContext();
            ctx.data.params = { page: 1 };

            await handler.handle(ctx);

            expect(ctx.request.queryParams!.skipCount).toBe(0);
            expect(ctx.request.queryParams!.maxResultCount).toBe(25);
        });

        test('没有 params 时应该跳过', async () => {
            const handler = createAbpPaginationHandler();
            const ctx = createContext();
            ctx.data.params = null;

            await handler.handle(ctx);

            expect(ctx.data.params).toBeNull();
        });

        test('queryParams 为空时应该自动创建', async () => {
            const handler = createAbpPaginationHandler();
            const ctx = createContext();
            ctx.request.queryParams = undefined;
            ctx.data.params = { page: 1, pageSize: 10 };

            await handler.handle(ctx);

            expect(ctx.request.queryParams).toBeDefined();
            expect(ctx.request.queryParams!.skipCount).toBe(0);
            expect(ctx.request.queryParams!.maxResultCount).toBe(10);
        });
    });

    describe('abp-tenant-header', () => {
        test('应该注入 __tenant Header', async () => {
            const handler = createAbpTenantHeaderHandler({ tenantId: 'my-tenant' });
            const ctx = createContext();

            await handler.handle(ctx);

            expect(ctx.request.headers['__tenant']).toBe('my-tenant');
        });

        test('没有 tenantId 时 shouldExecute 返回 false', () => {
            const handler = createAbpTenantHeaderHandler();
            const ctx = createContext();

            expect(handler.shouldExecute?.(ctx)).toBe(false);
        });
    });

    describe('getAbpPreHandlers', () => {
        test('应该返回 2 个前道处理器', () => {
            const handlers = getAbpPreHandlers();
            expect(handlers.length).toBe(2);
            expect(handlers[0].name).toBe('abp-pagination');
            expect(handlers[1].name).toBe('abp-tenant-header');
        });
    });
});

describe('ABP 后道处理器', () => {
    describe('abp-extract', () => {
        test('应该提取 PagedResultDto', async () => {
            const handler = createAbpExtractHandler();
            const ctx = createContext();
            ctx.request.queryParams = { skipCount: 0, maxResultCount: 10 };
            ctx.response.data = {
                items: [{ id: 1 }, { id: 2 }],
                totalCount: 50,
            };

            await handler.handle(ctx);

            expect(ctx.data.list).toEqual([{ id: 1 }, { id: 2 }]);
            expect(ctx.data.total).toBe(50);
            expect(ctx.data.pagination?.total).toBe(50);
            expect(ctx.data.pagination?.pageSize).toBe(10);
            expect(ctx.data.pagination?.pageIndex).toBe(0);
        });

        test('应该处理数组响应', async () => {
            const handler = createAbpExtractHandler();
            const ctx = createContext();
            ctx.response.data = [{ id: 1 }, { id: 2 }];

            await handler.handle(ctx);

            expect(ctx.data.list).toEqual([{ id: 1 }, { id: 2 }]);
            expect(ctx.data.total).toBe(2);
        });

        test('应该处理单个对象响应', async () => {
            const handler = createAbpExtractHandler();
            const ctx = createContext();
            ctx.response.data = { id: 1, name: 'test' };

            await handler.handle(ctx);

            expect(ctx.data.item).toEqual({ id: 1, name: 'test' });
        });

        test('空响应应该跳过', async () => {
            const handler = createAbpExtractHandler();
            const ctx = createContext();
            ctx.response.data = null;

            await handler.handle(ctx);

            expect(ctx.data.list).toEqual([]);
            expect(ctx.data.item).toBeNull();
        });
    });

    describe('abp-audit-clean', () => {
        test('应该移除审计字段', async () => {
            const handler = createAbpAuditCleanHandler();
            const ctx = createContext();
            ctx.data.list = [{
                id: 1,
                name: 'test',
                creationTime: '2024-01-01',
                creatorId: 'user1',
                lastModificationTime: null,
                lastModifierId: null,
            }];

            await handler.handle(ctx);

            expect(ctx.data.list[0]).toEqual({ id: 1, name: 'test' });
        });

        test('removeAuditFields=false 时应该跳过', () => {
            const handler = createAbpAuditCleanHandler({ removeAuditFields: false });
            expect(handler.shouldExecute?.(createContext())).toBe(false);
        });

        test('应该清理 item 中的审计字段', async () => {
            const handler = createAbpAuditCleanHandler();
            const ctx = createContext();
            ctx.data.item = {
                id: 1,
                creationTime: '2024-01-01',
                creatorId: 'user1',
            };

            await handler.handle(ctx);

            expect(ctx.data.item).toEqual({ id: 1 });
        });
    });

    describe('abp-soft-delete-filter', () => {
        test('应该过滤 isDeleted=true 的记录', async () => {
            const handler = createAbpSoftDeleteFilterHandler();
            const ctx = createContext();
            ctx.data.list = [
                { id: 1, name: 'active' },
                { id: 2, name: 'deleted', isDeleted: true },
                { id: 3, name: 'active2' },
            ];

            await handler.handle(ctx);

            expect(ctx.data.list.length).toBe(2);
            expect(ctx.data.total).toBe(2);
        });

        test('filterSoftDeleted=false 时应该跳过', () => {
            const handler = createAbpSoftDeleteFilterHandler({ filterSoftDeleted: false });
            expect(handler.shouldExecute?.(createContext())).toBe(false);
        });
    });

    describe('abp-error', () => {
        test('应该转换 ABP 错误格式', async () => {
            const handler = createAbpErrorHandler();
            const ctx = createContext();
            ctx.response.isSuccess = false;
            ctx.response.data = {
                error: {
                    code: 'Volo.Abp:01001',
                    message: 'Entity not found',
                    details: null,
                    validationErrors: undefined,
                },
            };

            await handler.handle(ctx);

            expect(ctx.error.code).toBe('Volo.Abp:01001');
            expect(ctx.error.message).toBe('Entity not found');
            expect(ctx.metadata.isErrorHandled).toBe(true);
        });

        test('应该处理验证错误', async () => {
            const handler = createAbpErrorHandler();
            const ctx = createContext();
            ctx.response.isSuccess = false;
            ctx.response.data = {
                error: {
                    code: 'Volo.Abp:Validation',
                    message: 'Validation failed',
                    details: null,
                    validationErrors: [
                        { message: 'Name is required', members: ['name'] },
                    ],
                },
            };

            await handler.handle(ctx);

            expect(ctx.error.validationErrors.length).toBe(1);
            expect(ctx.error.validationErrors[0].message).toBe('Name is required');
        });

        test('应该将验证错误转换为字段级映射', async () => {
            const handler = createAbpErrorHandler();
            const ctx = createContext();
            ctx.response.isSuccess = false;
            ctx.response.data = {
                error: {
                    code: 'Volo.Abp:Validation',
                    message: 'Validation failed',
                    details: null,
                    validationErrors: [
                        { message: 'Name is required', members: ['name'] },
                        { message: 'Email is invalid', members: ['email'] },
                    ],
                },
            };

            await handler.handle(ctx);

            expect(ctx.error.fieldErrors).toEqual({
                name: ['Name is required'],
                email: ['Email is invalid'],
            });
        });

        test('一个错误关联多个字段时，每个字段都应包含该错误', async () => {
            const handler = createAbpErrorHandler();
            const ctx = createContext();
            ctx.response.isSuccess = false;
            ctx.response.data = {
                error: {
                    code: 'Volo.Abp:Validation',
                    message: 'Validation failed',
                    details: null,
                    validationErrors: [
                        { message: 'Passwords do not match', members: ['password', 'confirmPassword'] },
                    ],
                },
            };

            await handler.handle(ctx);

            expect(ctx.error.fieldErrors).toEqual({
                password: ['Passwords do not match'],
                confirmPassword: ['Passwords do not match'],
            });
        });

        test('同一字段多个错误应合并', async () => {
            const handler = createAbpErrorHandler();
            const ctx = createContext();
            ctx.response.isSuccess = false;
            ctx.response.data = {
                error: {
                    code: 'Volo.Abp:Validation',
                    message: 'Validation failed',
                    details: null,
                    validationErrors: [
                        { message: 'Name is required', members: ['name'] },
                        { message: 'Name must be at least 2 characters', members: ['name'] },
                    ],
                },
            };

            await handler.handle(ctx);

            expect(ctx.error.fieldErrors).toEqual({
                name: ['Name is required', 'Name must be at least 2 characters'],
            });
        });

        test('没有验证错误时 fieldErrors 应为 undefined', async () => {
            const handler = createAbpErrorHandler();
            const ctx = createContext();
            ctx.response.isSuccess = false;
            ctx.response.data = {
                error: {
                    code: 'Volo.Abp:01001',
                    message: 'Entity not found',
                    details: null,
                },
            };

            await handler.handle(ctx);

            expect(ctx.error.fieldErrors).toBeUndefined();
        });

        test('成功响应时 shouldExecute 返回 false', () => {
            const handler = createAbpErrorHandler();
            const ctx = createContext();
            ctx.response.isSuccess = true;

            expect(handler.shouldExecute?.(ctx)).toBe(false);
        });
    });

    describe('getAbpPostHandlers', () => {
        test('应该返回 4 个后道处理器', () => {
            const handlers = getAbpPostHandlers();
            expect(handlers.length).toBe(4);
            expect(handlers.map(h => h.name)).toEqual([
                'abp-extract', 'abp-audit-clean', 'abp-soft-delete-filter', 'abp-error',
            ]);
        });
    });
});

describe('convertToFieldErrors', () => {
    test('应该将验证错误转换为字段级映射', () => {
        const result = convertToFieldErrors([
            { message: 'Name is required', members: ['name'] },
            { message: 'Email is invalid', members: ['email'] },
        ]);
        expect(result).toEqual({
            name: ['Name is required'],
            email: ['Email is invalid'],
        });
    });

    test('一个错误关联多个字段时，每个字段都应包含该错误', () => {
        const result = convertToFieldErrors([
            { message: 'Passwords do not match', members: ['password', 'confirmPassword'] },
        ]);
        expect(result).toEqual({
            password: ['Passwords do not match'],
            confirmPassword: ['Passwords do not match'],
        });
    });

    test('同一字段多个错误应合并', () => {
        const result = convertToFieldErrors([
            { message: 'Name is required', members: ['name'] },
            { message: 'Name must be at least 2 characters', members: ['name'] },
        ]);
        expect(result).toEqual({
            name: ['Name is required', 'Name must be at least 2 characters'],
        });
    });

    test('空数组应返回 undefined', () => {
        expect(convertToFieldErrors([])).toBeUndefined();
    });

    test('undefined 应返回 undefined', () => {
        expect(convertToFieldErrors(undefined)).toBeUndefined();
    });
});

describe('registerAbpHandlers', () => {
    test('应该注册所有 ABP 处理器到 DataProcessor', () => {
        const { DataProcessor } = require('@/data-processor');
        const beforeCount = DataProcessor.getPipeline('abp').length;

        registerAbpHandlers({ tenantId: 'test-tenant' });

        const afterCount = DataProcessor.getPipeline('abp').length;
        expect(afterCount).toBeGreaterThan(beforeCount);

        // 清理
        DataProcessor.unregister('abp-pagination');
        DataProcessor.unregister('abp-tenant-header');
        DataProcessor.unregister('abp-extract');
        DataProcessor.unregister('abp-audit-clean');
        DataProcessor.unregister('abp-soft-delete-filter');
        DataProcessor.unregister('abp-error');
    });
});
