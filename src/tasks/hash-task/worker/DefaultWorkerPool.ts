import { WorkerHandle } from './WorkerHandle';
import { WorkerPool } from './WorkerPool';
import { DefaultWorkerHandle } from './DefaultWorkerHandle';

export class DefaultWorkerPool implements WorkerPool {
    private readonly idleWorkers: WorkerHandle[] = [];
    private readonly allWorkers = new Set<WorkerHandle>();
    private readonly waiters: Array<(worker: WorkerHandle) => void> = [];

    private isDestroyed = false;

    /**
     * 注意：构造函数不再接收 scriptUrl，因为每个任务的代码可能是动态生成的
     */
    constructor(
        private readonly maxWorkers: number = Math.min(navigator.hardwareConcurrency || 4, 8)
    ) {}

    /**
     * ✅ 核心修改：acquire 现在接收 scriptSource
     */
    async acquire(scriptSource: string): Promise<WorkerHandle> {
        if (this.isDestroyed) throw new Error('WorkerPool is destroyed');

        // 1. 如果有闲置的 Worker
        const idle = this.idleWorkers.pop();
        if (idle) {
            // 这里有一个进阶逻辑：
            // 如果你希望 Worker 复用（不重造 Blob），你可能需要判断 idle 的 Worker
            // 里面跑的代码是否和当前 scriptSource 一致。
            // 但为了简单和“不限定算法包”，我们这里选择：只要是归还的，就直接用（假设 Runner 会发 reset 消息）
            return idle;
        }

        // 2. 如果还没到上限，造个新的
        if (this.allWorkers.size < this.maxWorkers) {
            // 这里的 scriptSource 就是 WorkerScriptBuilder 生成的完整 JS 代码
            const worker = new DefaultWorkerHandle(scriptSource);
            this.allWorkers.add(worker);
            return worker;
        }

        // 3. 否则，排队等别人释放
        return new Promise<WorkerHandle>(resolve => {
            this.waiters.push(resolve);
        });
    }

    /**
     * 归还 Worker 到池子
     */
    release(worker: WorkerHandle): void {
        if (this.isDestroyed) {
            worker.terminate();
            return;
        }

        // 如果有人在排队，直接转交给排队的人
        const nextWaiter = this.waiters.shift();
        if (nextWaiter) {
            nextWaiter(worker);
        } else {
            // 否则放入闲置队列
            this.idleWorkers.push(worker);
        }
    }

    /**
     * 销毁整个池子
     */
    async destroy(): Promise<void> {
        this.isDestroyed = true;

        // 终止所有 Worker
        const terminations = Array.from(this.allWorkers).map(w => w.terminate());
        await Promise.all(terminations);

        this.allWorkers.clear();
        this.idleWorkers.length = 0;
        this.waiters.length = 0;
    }
}
