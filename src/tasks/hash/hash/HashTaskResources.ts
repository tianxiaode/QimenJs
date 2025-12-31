import { IMemoryTicket, MemoryManager } from '@orbitjs/runtime-env';
import { WorkerHandle, WorkerPool } from '../worker';

/**
 * HashTaskResources 只做 3 件事：
 * 申请资源
 * memory budget
 * worker slot
 * 释放资源
 * 暴露一个只读视图，给 Runner 用
 * ❌ 它 不做：
 * 不分 chunk
 * 不调度任务
 * 不跑 hash
 * 不处理进度
 * 不做健康判断（HealthMonitor 的事）
 */
// src/hash/HashTaskResources.ts

export interface HashTaskResourceSnapshot {
    memoryBytes?: number;
    hasWorker: boolean;
}

export class HashTaskResources {
    private memoryTicket?: IMemoryTicket;
    private worker?: WorkerHandle;
    private acquired = false;

    constructor(
        private readonly memoryManager: MemoryManager,
        private readonly workerPool: WorkerPool
    ) {}

    /**
     * 核心：申请计算所需的军需（内存 + 线程）
     * @param scriptSource 经过 Builder 转换后的算法源码字符串
     * @param memoryBytes 需要锁定的内存预算
     */
    async acquire(scriptSource: string, memoryBytes: number): Promise<void> {
        if (this.acquired) return;

        try {
            // 1. 申请内存预算
            this.memoryTicket = await this.memoryManager.acquire(memoryBytes);

            // 2. 申请线程槽位（并将算法源码注入）
            this.worker = await this.workerPool.acquire(scriptSource);

            this.acquired = true;
        } catch (err) {
            await this.release(); // 申请失败需确保清理
            throw err;
        }
    }
    /**
     * 释放所有资源（幂等）
     */
    async release(): Promise<void> {
        if (this.worker) {
            this.workerPool.release(this.worker);
            this.worker = undefined;
        }

        if (this.memoryTicket) {
            this.memoryTicket.release();
            this.memoryTicket = undefined;
        }

        this.acquired = false;
    }

    /**
     * 访问 worker（只允许 Runner 用）
     */
    getWorker(): WorkerHandle {
        if (!this.worker) {
            throw new Error('Worker not acquired');
        }
        return this.worker;
    }

    /**
     * 当前资源快照（给 health / debug）
     */
    snapshot(): HashTaskResourceSnapshot {
        return {
            // ✅ 修正：如果有内存票据，返回具体的字节数
            memoryBytes: this.memoryTicket?.bytes,
            hasWorker: !!this.worker,
        };
    }
}
