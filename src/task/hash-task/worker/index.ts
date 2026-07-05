/**
 * Worker模块的公共API导出
 *
 * 该模块提供了一个用于处理哈希计算任务的Worker管理解决方案，
 * 包括Worker句柄、Worker池、通信协议和脚本构建等功能。
 *
 * 核心组件：
 * - WorkerHandle: Worker句柄接口及实现
 * - WorkerPool: Worker池接口及实现
 * - HashWorkerProtocol: Worker通信协议定义
 * - WorkerScriptBuilder: Worker脚本构建器
 * - HashWorker: Node.js环境下的哈希计算Worker
 */

export * from './HashWorkerProtocol';
export * from './HashWorker';
export * from './WorkerPool';
export * from './WorkerHandle';
export * from './WorkerScriptBuilder';
export * from './DefaultWorkerHandle';
export * from './BrowserWorkerHandle';
export * from './DefaultWorkerPool';
export * from './BrowserWorkerPool';
