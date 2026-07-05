/**
 * ABP 后道管道处理器
 *
 * 响应返回后的数据处理：提取 PagedResultDto、移除审计字段、错误处理
 *
 * @module data-processor-abp/post
 */

import type { RequestContext } from '@/context';
import type { DataProcessorHandler } from '@/data-processor/types';
import { DataProcessorWeight } from '@/data-processor/weights';
import type {
    AbpAuditFields,
    AbpErrorResponse,
    AbpFieldErrors,
    AbpPagedResult,
    AbpPipelineOptions,
} from './types';

/**
 * ABP 数据提取
 *
 * 从 ABP 标准响应格式中提取数据：
 * - PagedResultDto → items + totalCount
 * - EntityDto → 直接取值
 * - 普通对象 → 直接使用
 */
export function createAbpExtractHandler(options?: AbpPipelineOptions): DataProcessorHandler {
    return {
        name: 'abp-extract',
        weight: DataProcessorWeight.EXTRACT,
        tags: ['abp', 'post'],
        category: 'data',
        description: 'ABP 数据提取：PagedResultDto / EntityDto 解包',

        async handle(context: RequestContext): Promise<void> {
            const raw = context.response.data;
            if (!raw || typeof raw !== 'object') return;

            context.data.raw = raw;

            // PagedResultDto：{ items: [], totalCount: 0 }
            if (isPagedResult(raw)) {
                context.data.list = raw.items || [];
                context.data.total = raw.totalCount ?? 0;
                const pageSize =
                    context.request.queryParams?.maxResultCount ??
                    context.data.params?.takeCount ??
                    10;
                const skipCount =
                    context.request.queryParams?.skipCount ?? context.data.params?.skipCount ?? 0;
                context.data.pagination = {
                    isRequestAligned: true,
                    isResponseAligned: true,
                    total: raw.totalCount ?? 0,
                    pageSize,
                    pageIndex: Math.floor(skipCount / pageSize),
                };
                return;
            }

            // 数组：直接作为列表
            if (Array.isArray(raw)) {
                context.data.list = raw;
                context.data.total = raw.length;
                return;
            }

            // 单个对象：作为 item
            context.data.item = raw;
        },
    };
}

/**
 * ABP 审计字段清理
 *
 * 移除 ABP 实体自带的审计字段（creationTime, creatorId 等）
 */
export function createAbpAuditCleanHandler(options?: AbpPipelineOptions): DataProcessorHandler {
    const shouldRemove = options?.removeAuditFields ?? true;

    return {
        name: 'abp-audit-clean',
        weight: DataProcessorWeight.ALIGN,
        offset: 10,
        tags: ['abp', 'post'],
        category: 'data',
        description: 'ABP 审计字段清理',

        shouldExecute(): boolean {
            return shouldRemove;
        },

        async handle(context: RequestContext): Promise<void> {
            const auditKeys: (keyof AbpAuditFields)[] = [
                'creationTime',
                'creatorId',
                'lastModificationTime',
                'lastModifierId',
                'deletionTime',
                'deleterId',
            ];

            // 清理列表数据
            if (context.data.list?.length) {
                for (const item of context.data.list) {
                    removeAuditFields(item, auditKeys);
                }
            }

            // 清理单项数据
            if (context.data.item) {
                removeAuditFields(context.data.item, auditKeys);
            }
        },
    };
}

/**
 * ABP 软删除过滤
 *
 * 过滤掉 isDeleted=true 的记录
 */
export function createAbpSoftDeleteFilterHandler(
    options?: AbpPipelineOptions
): DataProcessorHandler {
    const shouldFilter = options?.filterSoftDeleted ?? true;

    return {
        name: 'abp-soft-delete-filter',
        weight: DataProcessorWeight.ALIGN,
        offset: 20,
        tags: ['abp', 'post'],
        category: 'data',
        description: 'ABP 软删除过滤',

        shouldExecute(): boolean {
            return shouldFilter;
        },

        async handle(context: RequestContext): Promise<void> {
            if (context.data.list?.length) {
                context.data.list = context.data.list.filter((item: any) => !item.isDeleted);
                context.data.total = context.data.list.length;
            }
        },
    };
}

/**
 * ABP 错误处理
 *
 * 将 ABP 标准错误格式转换为统一错误对象，
 * 并将 validationErrors 转换为以字段名为 key 的 fieldErrors 映射
 */
export function createAbpErrorHandler(): DataProcessorHandler {
    return {
        name: 'abp-error',
        weight: DataProcessorWeight.ERROR,
        tags: ['abp', 'post'],
        category: 'error',
        description: 'ABP 错误处理：RemoteServiceErrorResponse 转换 + 字段级错误映射',

        shouldExecute(context: RequestContext): boolean {
            return !context.response.isSuccess && !!context.response.data?.error;
        },

        async handle(context: RequestContext): Promise<void> {
            const errorResponse = context.response.data as AbpErrorResponse;
            if (!errorResponse?.error) return;

            const error = errorResponse.error;
            const fieldErrors = convertToFieldErrors(error.validationErrors);

            context.error = {
                code: error.code ?? 'ABP_ERROR',
                message: error.message ?? 'Unknown error',
                details: error.details,
                validationErrors: error.validationErrors,
                fieldErrors,
            };

            context.metadata.isErrorHandled = true;
        },
    };
}

/**
 * 将 ABP validationErrors 转换为字段级错误映射
 *
 * ABP 原始格式：[{ message: 'Name is required', members: ['name'] }]
 * 转换后：{ name: ['Name is required'] }
 *
 * 当一个错误关联多个字段时（如 password 和 confirmPassword），
 * 每个字段都会包含该错误消息
 */
export function convertToFieldErrors(
    validationErrors?: Array<{ message: string; members: string[] }>
): AbpFieldErrors | undefined {
    if (!validationErrors?.length) return undefined;

    const result: AbpFieldErrors = {};
    for (const ve of validationErrors) {
        for (const member of ve.members) {
            if (!result[member]) {
                result[member] = [];
            }
            result[member].push(ve.message);
        }
    }
    return result;
}

// ---- 辅助函数 ----

function isPagedResult(data: any): data is AbpPagedResult {
    return data && typeof data === 'object' && 'items' in data && 'totalCount' in data;
}

function removeAuditFields(item: any, keys: (keyof AbpAuditFields)[]): void {
    if (!item || typeof item !== 'object') return;
    for (const key of keys) {
        delete item[key];
    }
}

/**
 * 获取所有 ABP 后道处理器
 */
export function getAbpPostHandlers(options?: AbpPipelineOptions): DataProcessorHandler[] {
    return [
        createAbpExtractHandler(options),
        createAbpAuditCleanHandler(options),
        createAbpSoftDeleteFilterHandler(options),
        createAbpErrorHandler(),
    ];
}
