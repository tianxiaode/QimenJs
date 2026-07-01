/**
 * ABP 数据处理管道自动注册
 *
 * 引入此模块时自动注册所有 ABP 处理器到 DataProcessor
 *
 * @module data-processor-abp/register
 */

import { DataProcessor } from '@/data-processor';
import { getAbpPreHandlers, getAbpPostHandlers } from './index';
import type { AbpPipelineOptions } from './types';

/**
 * 注册所有 ABP 处理器
 *
 * @param options ABP 管道配置
 */
export function registerAbpHandlers(options?: AbpPipelineOptions): void {
    DataProcessor.registerAll(getAbpPreHandlers(options));
    DataProcessor.registerAll(getAbpPostHandlers(options));
}

// 自动注册（使用默认配置）
registerAbpHandlers();
