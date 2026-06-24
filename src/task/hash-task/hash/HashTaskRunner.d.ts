import { HashTaskResources } from './HashTaskResources';
import { HashTaskState } from './HashTaskState';
import { HashTaskProgress } from './HashTaskProgress';
import { HashTaskOptions } from './HashTask';
/**
 * HashTaskRunner类
 *
 * 该类只负责流程控制：
 * - 驱动任务生命周期
 * - 串联 State / Progress / Resources
 * - 把「计算」委托给 worker
 * - 处理中断（pause / cancel）
 *
 * 明确不负责：
 * - 不分块（ChunkProvider 的事）
 * - 不实现 hash 算法
 * - 不处理内存细节
 * - 不做健康监控
 * - 不做任务调度
 */
export declare class HashTaskRunner {
    private readonly state;
    private readonly progress;
    private readonly resources;
    private readonly options;
    private logger;
    private builder;
    /**
     * 构造函数
     *
     * @param state 任务状态管理器
     * @param progress 任务进度管理器
     * @param resources 任务资源管理器
     * @param options 哈希任务选项
     */
    constructor(state: HashTaskState, progress: HashTaskProgress, resources: HashTaskResources, options: HashTaskOptions);
    /**
     * 获取ChunkProvider的辅助属性，让代码更易读
     */
    private get chunkProvider();
    /**
     * 执行哈希任务
     *
     * 该方法负责：
     * 1. 构建Worker脚本
     * 2. 计算所需内存
     * 3. 获取资源（内存和Worker）
     * 4. 启动健康监控
     * 5. 执行哈希计算
     * 6. 最终释放资源
     *
     * @returns Promise<ArrayBuffer> 包含哈希结果的Promise
     */
    run(): Promise<ArrayBuffer>;
    /**
     * 暂停任务：通过状态机实现
     *
     * 检查当前状态是否允许暂停，如果允许则更新状态为暂停
     */
    pause(): void;
    /**
     * 恢复任务：通过状态机实现
     *
     * 检查当前状态是否允许恢复，如果允许则更新状态为运行中
     */
    resume(): void;
    /**
     * 取消任务：直接调用状态机的 cancel
     * 状态变更为 'cancelled' 后，executeHashing 循环中的 isCancelled() 会检测到并抛出异常
     *
     * 检查当前状态是否允许取消，如果允许则更新状态为已取消
     */
    cancel(): void;
    /**
     * 等待任务恢复（如果处于暂停状态）
     *
     * 当任务处于暂停状态时，持续等待直到恢复运行或被取消
     *
     * @private
     */
    private waitIfPaused;
    /**
     * 运行单个数据块的哈希计算
     *
     * 该方法向Worker发送数据块进行哈希计算，并等待处理结果
     *
     * @param worker Worker句柄
     * @param chunk 要处理的数据块
     * @returns Promise<void> 表示处理完成的Promise
     * @private
     */
    private runChunk;
    /**
     * 完成哈希计算并获取最终结果
     *
     * 该方法向Worker发送完成信号并等待最终的哈希结果
     *
     * @param worker Worker句柄
     * @returns Promise<ArrayBuffer> 包含最终哈希结果的Promise
     * @private
     */
    private finalize;
    /**
     * 计算所需内存大小
     *
     * 根据数据块大小计算所需的内存，预留额外空间用于处理
     *
     * @returns 所需的内存大小（以字节为单位）
     * @private
     */
    private calculateRequiredMemory;
    /**
     * 执行哈希计算的主要逻辑
     *
     * 主循环：获取数据块 -> 检查暂停/取消 -> 执行哈希 -> 更新进度 -> 继续下一块
     *
     * @returns Promise<ArrayBuffer> 包含最终哈希结果的Promise
     * @private
     */
    private executeHashing;
}
//# sourceMappingURL=HashTaskRunner.d.ts.map