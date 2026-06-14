import { TaskPriority } from './types';
/**
 * 全局任务队列 - 用于管理任务执行、优先级排序和重试的核心类
 *
 * 该类实现了单例模式，确保整个应用中只有一个任务队列实例。
 * 支持任务优先级、重试机制和轮询任务。
 *
 * @example
 * ```ts
 * // 获取全局任务队列实例并添加一个普通任务
 * globalTaskQueue.addTask(
 *   async () => console.log('Task executed'),
 *   'HIGH',
 *   3, // 最大重试次数
 *   1000 // 重试延迟
 * );
 *
 * // 添加一个轮询任务
 * globalTaskQueue.addTask(
 *   async () => fetch('/api/data'),
 *   'NORMAL',
 *   5,
 *   1000,
 *   true, // 轮询
 *   5000  // 轮询间隔
 * );
 * ```
 */
export declare class GlobalTaskQueue {
    private taskQueue;
    private maxConcurrentTasks;
    private isRunning;
    private static instance;
    private logger;
    /**
     * 构造函数 - 创建任务队列实例
     *
     * @param maxConcurrentTasks - 最大并发任务数，默认为5
     */
    constructor(maxConcurrentTasks?: number);
    /**
     * 获取任务队列的单例实例
     *
     * @param maxConcurrentTasks - 可选参数，指定最大并发任务数
     * @returns 返回任务队列的单例实例
     */
    static getInstance(maxConcurrentTasks?: number): GlobalTaskQueue;
    /**
     * 根据优先级对任务队列进行排序
     *
     * @returns 排序后的任务数组
     * @private
     */
    private getSortedQueue;
    /**
     * 添加任务到队列
     *
     * @param fn - 要执行的任务函数，返回Promise
     * @param priority - 任务优先级，默认为NORMAL
     * @param maxRetries - 最大重试次数，默认为3
     * @param delay - 重试延迟时间（毫秒），默认为1000
     * @param isPolling - 是否为轮询任务，默认为false
     * @param interval - 轮询间隔时间（毫秒），默认为5000
     */
    addTask(fn: () => Promise<unknown>, priority?: TaskPriority, maxRetries?: number, delay?: number, isPolling?: boolean, interval?: number): void;
    /**
     * 处理任务的重试逻辑
     *
     * @param task - 需要重试的任务
     * @returns 如果任务将被重试则返回true，否则返回false
     * @private
     */
    private handleTaskRetry;
    /**
     * 处理轮询任务的重试逻辑
     *
     * @param task - 需要轮询的任务
     * @returns 如果任务将被重试则返回true，否则返回false
     * @private
     */
    private handlePollingTask;
    /**
     * 执行任务
     *
     * @param task - 要执行的任务
     * @private
     */
    private runTask;
    /**
     * 执行队列中的任务
     *
     * @private
     */
    private run;
}
export declare const globalTaskQueue: GlobalTaskQueue;
//# sourceMappingURL=TaskQueue.d.ts.map