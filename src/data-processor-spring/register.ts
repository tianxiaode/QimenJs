/**
 * Spring 数据处理管道自动注册
 *
 * 引入此模块时自动注册所有 Spring 处理器到 DataProcessor
 *
 * @module data-processor-spring/register
 */

import { DataProcessor } from '@/data-processor';
import { getSpringPreHandlers, getSpringPostHandlers } from './index';
import type { SpringPipelineOptions } from './types';

/**
 * 注册所有 Spring 处理器
 *
 * @param options Spring 管道配置
 */
export function registerSpringHandlers(options?: SpringPipelineOptions): void {
    DataProcessor.registerAll(getSpringPreHandlers(options));
    DataProcessor.registerAll(getSpringPostHandlers());
}

// 自动注册（使用默认配置）
registerSpringHandlers();
