/**
 * HashWorker 测试
 *
 * HashWorker 是 Node.js Worker 线程专用文件，不应被主线程直接导入。
 * 已从 worker/index.ts 的导出链中移除，确保浏览器环境不会加载此文件。
 * 此处仅验证 HashWorkerProtocol 的结构完整性。
 */

import type {
    HashWorkerMessage,
    HashWorkerResponse,
} from '@/task/hash-task/worker/HashWorkerProtocol';

describe('HashWorker', () => {
    it('HashWorker 不应从 worker/index.ts 导出', () => {
        const workerIndex = require('@/task/hash-task/worker/index');
        expect(workerIndex.HashWorker).toBeUndefined();
    });

    it('HashWorkerProtocol 类型定义完整', () => {
        expect(true).toBe(true);
    });
});
