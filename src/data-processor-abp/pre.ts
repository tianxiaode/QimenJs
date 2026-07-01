/**
 * ABP 前道管道处理器
 *
 * 请求发送前的数据处理：分页参数转换、租户 Header 注入
 *
 * @module data-processor-abp/pre
 */

import type { RequestContext } from '@/context';
import type { DataProcessorHandler } from '@/data-processor/types';
import { DataProcessorWeight } from '@/data-processor/weights';
import type { AbpPipelineOptions } from './types';

/**
 * ABP 分页参数转换
 *
 * 将前端分页参数（pageIndex/pageSize）转换为 ABP 格式（skipCount/takeCount）
 * 注入到 context.request.queryParams，由 UrlBuilder 拼接到 URL
 *
 * 前端格式：{ pageIndex: 1, pageSize: 10 }
 * ABP 格式：queryParams 中 { skipCount: 0, takeCount: 10 }
 */
export function createAbpPaginationHandler(options?: AbpPipelineOptions): DataProcessorHandler {
    const defaultPageSize = options?.defaultPageSize ?? 10;

    return {
        name: 'abp-pagination',
        weight: DataProcessorWeight.TRANSFORM,
        tags: ['abp', 'pre'],
        category: 'param',
        description: 'ABP 分页参数转换：pageIndex/pageSize → skipCount/takeCount',

        async handle(context: RequestContext): Promise<void> {
            const params = context.data.params;
            if (!params || typeof params !== 'object') return;

            // 前端分页参数
            const pageIndex = params.pageIndex ?? params.page ?? 0;
            const pageSize = params.pageSize ?? params.size ?? defaultPageSize;

            // 转换为 ABP 格式，注入到 queryParams
            if (!context.request.queryParams) {
                context.request.queryParams = {};
            }
            context.request.queryParams.skipCount = pageIndex * pageSize;
            context.request.queryParams.takeCount = pageSize;

            // 移除前端参数，避免发送到后端
            delete params.pageIndex;
            delete params.page;
            delete params.pageSize;
            delete params.size;
        },
    };
}

/**
 * ABP 租户 Header 注入
 *
 * 在请求头中注入 ABP 多租户标识
 */
export function createAbpTenantHeaderHandler(options?: AbpPipelineOptions): DataProcessorHandler {
    return {
        name: 'abp-tenant-header',
        weight: DataProcessorWeight.ENRICHMENT,
        tags: ['abp', 'pre'],
        category: 'param',
        description: 'ABP 租户 Header 注入',

        shouldExecute(context: RequestContext): boolean {
            return !!options?.tenantId;
        },

        async handle(context: RequestContext): Promise<void> {
            if (options?.tenantId) {
                context.request.headers['__tenant'] = options.tenantId;
            }
        },
    };
}

/**
 * 获取所有 ABP 前道处理器
 */
export function getAbpPreHandlers(options?: AbpPipelineOptions): DataProcessorHandler[] {
    return [
        createAbpPaginationHandler(options),
        createAbpTenantHeaderHandler(options),
    ];
}
