/**
 * 管道执行器
 * 
 * 统一的管道执行器，内置监控和日志功能
 * 所有模块（validation、http、data-processor）都应该使用此执行器
 * 
 * @module pipeline
 */

// 导出类型
export * from './types';

// 导出执行器
export { Pipeline, pipeline } from './executor';
