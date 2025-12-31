import { IMemoryTicket, MemoryManager } from '@orbitjs/runtime-env';
import { WorkerPool } from '../worker';

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

interface WorkerHandle {
    postMessage(message: any): void;
    terminate(): void;
}

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
     * 申请任务所需资源
     * 任何一步失败，都会自动回滚
     */
    async acquire(memoryBytes?: number): Promise<void> {
        if (this.acquired) return;

        try {
            if (memoryBytes !== undefined) {
                this.memoryTicket = await this.memoryManager.acquire(memoryBytes);
            }

            this.worker = await this.workerPool.acquire();
            this.acquired = true;
        } catch (err) {
            await this.release();
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
            memoryBytes: this.memoryTicket ? undefined : undefined,
            hasWorker: Boolean(this.worker),
        };
    }
}
