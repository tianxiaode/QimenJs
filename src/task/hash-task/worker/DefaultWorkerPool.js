"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultWorkerPool = void 0;
const DefaultWorkerHandle_1 = require("./DefaultWorkerHandle");
/**
 * 默认Worker池实现
 *
 * 提供了Worker池的基本功能，包括Worker的获取、归还和销毁
 * 设计原则：只负责Worker的生命周期管理，不关心具体执行的任务
 *
 * 明确不负责：
 * - 不执行具体的哈希计算
 * - 不管理任务状态
 * - 不处理算法逻辑
 */
class DefaultWorkerPool {
    /**
     * 构造函数
     *
     * @param maxWorkers 最大Worker数量，默认为硬件并发数或8，取较小值
     */
    constructor(maxWorkers = Math.min(navigator.hardwareConcurrency || 4, 8)) {
        this.maxWorkers = maxWorkers;
        this.idleWorkers = [];
        this.allWorkers = new Set();
        this.waiters = [];
        this.isDestroyed = false;
    }
    /**
     * 获取一个可用的Worker
     *
     * 如果有空闲Worker则直接返回，否则如果未达到最大数量则创建新的，
     * 否则等待其他任务释放Worker
     *
     * @param scriptSource 要注入Worker的脚本源码
     * @returns 可用的Worker句柄
     */
    async acquire(scriptSource) {
        if (this.isDestroyed)
            throw new Error('WorkerPool is destroyed');
        // 1. 如果有闲置的 Worker
        const idle = this.idleWorkers.pop();
        if (idle) {
            // 这里有一个进阶逻辑：
            // 如果你希望 Worker 复用（不重造 Blob），你可能需要判断 idle 的 Worker
            // 里面跑的代码是否和当前 scriptSource 一致。
            // 但为了简单和"不限定算法包"，我们这里选择：只要是归还的，就直接用（假设 Runner 会发 reset 消息）
            return idle;
        }
        // 2. 如果还没到上限，造个新的
        if (this.allWorkers.size < this.maxWorkers) {
            // 这里的 scriptSource 就是 WorkerScriptBuilder 生成的完整 JS 代码
            const worker = new DefaultWorkerHandle_1.DefaultWorkerHandle(scriptSource);
            this.allWorkers.add(worker);
            return worker;
        }
        // 3. 否则，排队等别人释放
        return new Promise(resolve => {
            this.waiters.push(resolve);
        });
    }
    /**
     * 归还Worker到池子
     *
     * 将使用完毕的Worker归还到池中，供其他任务使用
     *
     * @param worker 要归还的Worker句柄
     */
    release(worker) {
        if (this.isDestroyed) {
            worker.terminate();
            return;
        }
        // 如果有人在排队，直接转交给排队的人
        const nextWaiter = this.waiters.shift();
        if (nextWaiter) {
            nextWaiter(worker);
        }
        else {
            // 否则放入闲置队列
            this.idleWorkers.push(worker);
        }
    }
    /**
     * 销毁整个Worker池
     *
     * 终止并清理池中的所有Worker，释放相关资源
     */
    async destroy() {
        this.isDestroyed = true;
        // 终止所有 Worker
        const terminations = Array.from(this.allWorkers).map(w => w.terminate());
        await Promise.all(terminations);
        this.allWorkers.clear();
        this.idleWorkers.length = 0;
        this.waiters.length = 0;
    }
}
exports.DefaultWorkerPool = DefaultWorkerPool;
//# sourceMappingURL=DefaultWorkerPool.js.map