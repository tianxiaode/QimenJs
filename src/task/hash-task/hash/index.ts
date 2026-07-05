/**
 * Hash任务模块的公共API导出
 *
 * 该模块提供了一个用于处理大文件或数据流的哈希计算任务的完整解决方案，
 * 包括进度监控、暂停/恢复/取消操作、资源管理等功能。
 */

export * from './HashTask';
export * from './HashTaskProgress';
export * from './HashTaskResources';
export * from './HashTaskRunner';
export * from './HashTaskState';
export * from './HashTaskHealthMonitor';
