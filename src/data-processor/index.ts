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

// 导出类型
export * from './types';

// 导出权重
export * from './weights';

// 导出错误类
export * from './errors';

// 导出注册器
import { DataProcessorRegistrar, DataProcessorRegistrarName } from './DataProcessorRegistrar';

export { 
    DataProcessorRegistrar,
    DataProcessorRegistrarName 
};

// 导出便捷访问对象（使用单例，确保与 RegistryHub 注册的实例一致）
export const DataProcessor = DataProcessorRegistrar.getInstance();

// 导出执行器
export { 
    DataProcessorExecutor,
    dataProcessorExecutor 
} from './executor';

// 导出模块增强（必须在最后）
export * from './register';

// 导出通用管道（稍后实现）
// export * from './common';
