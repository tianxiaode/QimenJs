/**
 * Spring 前道管道处理器
 *
 * 请求发送前的数据处理：分页参数转换
 *
 * @module data-processor-spring/pre
 */

import type { RequestContext } from '@/context';
import type { DataProcessorHandler } from '@/data-processor/types';
import { DataProcessorWeight } from '@/data-processor/weights';
import type { SpringPipelineOptions } from './types';

/**
 * Spring 分页参数转换
 *
 * 将前端分页参数转换为 Spring Data 格式（page/size/sort）
 * 注入到 context.request.queryParams，由 UrlBuilder 拼接到 URL
 *
 * 前端格式：{ pageIndex: 1, pageSize: 10 }
 * Spring 格式：queryParams 中 { page: 0, size: 10, sort: 'name,asc' }
 */
export function createSpringPaginationHandler(options?: SpringPipelineOptions): DataProcessorHandler {
    const defaultPageSize = options?.defaultPageSize ?? 20;
    const zeroBased = options?.zeroBasedPageIndex ?? true;

    return {
        name: 'spring-pagination',
        weight: DataProcessorWeight.TRANSFORM,
        tags: ['spring', 'pre'],
        category: 'param',
        description: 'Spring 分页参数转换：pageIndex/pageSize → page/size',

        async handle(context: RequestContext): Promise<void> {
            const params = context.data.params;
            if (!params || typeof params !== 'object') return;

            // 前端分页参数
            const pageIndex = params.pageIndex ?? params.page ?? 0;
            const pageSize = params.pageSize ?? params.size ?? defaultPageSize;
            const sort = params.sort;

            // 转换为 Spring 格式，注入到 queryParams
            if (!context.request.queryParams) {
                context.request.queryParams = {};
            }
            context.request.queryParams.page = zeroBased ? pageIndex : pageIndex - 1;
            context.request.queryParams.size = pageSize;

            // 保留排序参数
            if (sort) {
                context.request.queryParams.sort = sort;
            }

            // 移除前端参数
            delete params.pageIndex;
            delete params.pageSize;
        },
    };
}

/**
 * 获取所有 Spring 前道处理器
 */
export function getSpringPreHandlers(options?: SpringPipelineOptions): DataProcessorHandler[] {
    return [
        createSpringPaginationHandler(options),
    ];
}
