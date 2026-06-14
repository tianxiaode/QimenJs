/**
 * 数据处理管道模块入口
 *
 * @module data-processor
 *
 * 提供统一的数据处理管道系统，通过关键字路由不同的处理逻辑
 *
 * 核心概念：
 * - DataProcessorRegistrar: 统一注册器，管理所有数据处理管道
 * - DataProcessorHandler: 处理器，管道的基本处理单元
 * - DataProcessorKey: 关键字，用于标识不同的管道
 *
 * 使用方式：
 * 1. 注册处理器
 * 2. 执行管道
 *
 * @example
 * import { DataProcessor } from '@orbitjs/data-processor';
 *
 * // 注册处理器
 * DataProcessor.register('abp-post', {
 *     name: 'abp-extract',
 *     weight: 100,
 *     handle: async (ctx) => {
 *         // 数据提取逻辑
 *     }
 * });
 *
 * // 执行管道
 * await DataProcessor.execute('abp-post', context);
 */
export * from './types';
export * from './weights';
export * from './errors';
export { DataProcessorRegistrar, DataProcessor, DataProcessorRegistrarName } from './DataProcessorRegistrar';
export { DataProcessorExecutor, dataProcessorExecutor } from './executor';
export * from './register';
//# sourceMappingURL=index.d.ts.map