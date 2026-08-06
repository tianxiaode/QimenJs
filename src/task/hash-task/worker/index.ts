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
 *
 * 注意：HashWorker 是 Node.js 专用 Worker 脚本，仅由 WorkerScriptBuilder
 * 在构建 Worker 脚本时引用，不应被主线程代码直接导入，因此不从此处导出。
 */

export * from './HashWorkerProtocol';
export * from './WorkerPool';
export * from './WorkerHandle';
export * from './WorkerScriptBuilder';
export * from './DefaultWorkerHandle';
export * from './BrowserWorkerHandle';
export * from './DefaultWorkerPool';
export * from './BrowserWorkerPool';
