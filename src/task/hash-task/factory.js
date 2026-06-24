"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHashTask = createHashTask;
const runtime_1 = require("@/runtime");
const worker_1 = require("./worker");
const chunk_1 = require("./chunk");
const hash_1 = require("./hash");
/**
 * 创建哈希任务的工厂函数
 *
 * 根据输入类型（File、string或ReadableStream）创建相应的哈希任务
 *
 * @param input - 输入数据，可以是File对象、文件路径字符串或ReadableStream
 * @param algorithm - 哈希算法，可以是字符串（如'sha256'）或自定义哈希函数
 * @returns 返回配置好的HashTask实例
 *
 * @example
 * ```ts
 * // 使用内置算法
 * const task = createHashTask(file, 'sha256');
 *
 * // 使用自定义哈希函数
 * const task = createHashTask(data, (data: ArrayBuffer) => customHashFunction(data));
 * ```
 */
function createHashTask(input, algorithm) {
    // 1. 初始化工作池和内存管理器
    const pool = new worker_1.BrowserWorkerPool();
    const mem = new runtime_1.MemoryManager({ maxBytes: 100 * 1024 * 1024 });
    // 2. 根据输入类型选择合适的块提供者
    let provider;
    if (typeof input === 'string') {
        // Node.js 环境下的文件路径
        provider = new chunk_1.FileChunkProvider(input);
    }
    else if (input instanceof File || input instanceof Blob) {
        // 浏览器环境下的文件对象
        provider = new chunk_1.BrowserFileChunkProvider(input);
    }
    else {
        // 流式输入
        provider = new chunk_1.StreamChunkProvider(input);
    }
    // 3. 实例化哈希任务
    const task = new hash_1.HashTask({
        algorithm,
        workerPool: pool,
        memoryManager: mem,
        chunkProvider: provider,
    });
    return task;
}
//# sourceMappingURL=factory.js.map