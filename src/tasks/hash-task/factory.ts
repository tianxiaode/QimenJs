import { MemoryManager } from '@/runtime-env';
import { BrowserWorkerPool } from './worker';
import { BrowserFileChunkProvider, StreamChunkProvider,FileChunkProvider } from './chunk';
import { ChunkProvider } from './types';
import { HashTask } from './hash';

export function createHashTask(
    input: File | string | ReadableStream<Uint8Array>,
    algorithm: string | ((data: ArrayBuffer) => any)
) {
    // 1. 初始化池子和内存
    const pool = new BrowserWorkerPool();
    const mem = new MemoryManager({ maxBytes: 100 * 1024 * 1024 });

    // 2. 根据输入类型选择 Provider
    let provider: ChunkProvider;

    if (typeof input === 'string') {
        // Node.js 环境下的路径
        provider = new FileChunkProvider(input);
    } else if (input instanceof File || input instanceof Blob) {
        // 浏览器环境下的文件对象
        provider = new BrowserFileChunkProvider(input);
    } else {
        // 流式输入
        provider = new StreamChunkProvider(input);
    }

    // 3. 实例化任务
    const task = new HashTask({
        algorithm,
        workerPool: pool,
        memoryManager: mem,
        chunkProvider: provider,
    });

    return task;
}
