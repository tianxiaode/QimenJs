import { MemoryManager } from '@/runtime';
import { BrowserWorkerPool } from './worker';
import { BrowserFileChunkProvider, StreamChunkProvider, FileChunkProvider } from './chunk';
import { ChunkProvider } from './types';
import { HashTask } from './hash';

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
export function createHashTask(
    input: File | string | ReadableStream<Uint8Array>,
    algorithm: string | ((data: ArrayBuffer) => any)
) {
    // 1. 初始化工作池和内存管理器
    const pool = new BrowserWorkerPool();
    const mem = new MemoryManager({ maxBytes: 100 * 1024 * 1024 });

    // 2. 根据输入类型选择合适的块提供者
    let provider: ChunkProvider;

    if (typeof input === 'string') {
        // Node.js 环境下的文件路径
        provider = new FileChunkProvider(input);
    } else if (input instanceof File || input instanceof Blob) {
        // 浏览器环境下的文件对象
        provider = new BrowserFileChunkProvider(input);
    } else {
        // 流式输入
        provider = new StreamChunkProvider(input);
    }

    // 3. 实例化哈希任务
    const task = new HashTask({
        algorithm,
        workerPool: pool,
        memoryManager: mem,
        chunkProvider: provider,
    });

    return task;
}
