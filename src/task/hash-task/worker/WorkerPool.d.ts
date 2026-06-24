/**
 * Worker池接口
 *
 * 定义了Worker池的基本操作接口，用于管理和复用Worker实例
 * 设计原则：只负责Worker的获取、归还和销毁，不关心具体执行的任务
 *
 * 明确不负责：
 * - 不执行具体的哈希计算
 * - 不管理任务状态
 * - 不处理算法逻辑
 */
import { WorkerHandle } from './WorkerHandle';
export interface WorkerPool {
    /**
     * 获取一个可用的Worker
     *
     * 如果有空闲Worker则直接返回，否则如果未达到最大数量则创建新的，
     * 否则等待其他任务释放Worker
     *
     * @param scriptSource 要注入Worker的脚本源码
     * @returns 可用的Worker句柄
     */
    acquire(scriptSource: string): Promise<WorkerHandle>;
    /**
     * 归还Worker到池中
     *
     * 将使用完毕的Worker归还到池中，供其他任务使用
     *
     * @param worker 要归还的Worker句柄
     */
    release(worker: WorkerHandle): void;
    /**
     * 销毁整个Worker池
     *
     * 终止并清理池中的所有Worker，释放相关资源
     */
    destroy(): Promise<void>;
}
//# sourceMappingURL=WorkerPool.d.ts.map