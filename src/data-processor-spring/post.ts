/**
 * Spring 后道管道处理器
 *
 * 响应返回后的数据处理：提取 Page<T>、错误处理
 *
 * @module data-processor-spring/post
 */

import type { RequestContext } from '@/context';
import type { DataProcessorHandler } from '@/data-processor/types';
import { DataProcessorWeight } from '@/data-processor/weights';
import type { SpringErrorResponse, SpringPage } from './types';

/**
 * Spring 数据提取
 *
 * 从 Spring Data 标准响应格式中提取数据：
 * - Page<T> → content + totalElements
 * - 数组 → 直接使用
 * - 单个对象 → 作为 item
 */
export function createSpringExtractHandler(): DataProcessorHandler {
    return {
        name: 'spring-extract',
        weight: DataProcessorWeight.EXTRACT,
        tags: ['spring', 'post'],
        category: 'data',
        description: 'Spring 数据提取：Page<T> 解包',

        async handle(context: RequestContext): Promise<void> {
            const raw = context.response.data;
            if (!raw || typeof raw !== 'object') return;

            context.data.raw = raw;

            // Page<T>：{ content: [], totalElements: 0, ... }
            if (isSpringPage(raw)) {
                context.data.list = raw.content || [];
                context.data.total = raw.totalElements ?? 0;
                context.data.pagination = {
                    isRequestAligned: true,
                    isResponseAligned: true,
                    total: raw.totalElements ?? 0,
                    pageSize: raw.size ?? 20,
                    pageIndex: raw.number ?? 0,
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
 * Spring 错误处理
 *
 * 将 Spring Boot 标准错误格式转换为统一错误对象
 */
export function createSpringErrorHandler(): DataProcessorHandler {
    return {
        name: 'spring-error',
        weight: DataProcessorWeight.ERROR,
        tags: ['spring', 'post'],
        category: 'error',
        description: 'Spring 错误处理：SpringErrorResponse 转换',

        shouldExecute(context: RequestContext): boolean {
            return !context.response.isSuccess && !!context.response.data?.status;
        },

        async handle(context: RequestContext): Promise<void> {
            const errorResponse = context.response.data as SpringErrorResponse;
            if (!errorResponse) return;

            context.error = {
                code: `SPRING_${errorResponse.status ?? 'ERROR'}`,
                message: errorResponse.message ?? errorResponse.error ?? 'Unknown error',
                path: errorResponse.path,
                traceId: errorResponse.traceId,
                errors: errorResponse.errors?.map(e => ({
                    field: e.field,
                    message: e.message,
                    rejectedValue: e.rejectedValue,
                })),
            };

            context.metadata.isErrorHandled = true;
        },
    };
}

// ---- 辅助函数 ----

function isSpringPage(data: any): data is SpringPage {
    return data
        && typeof data === 'object'
        && 'content' in data
        && 'totalElements' in data;
}

/**
 * 获取所有 Spring 后道处理器
 */
export function getSpringPostHandlers(): DataProcessorHandler[] {
    return [
        createSpringExtractHandler(),
        createSpringErrorHandler(),
    ];
}
