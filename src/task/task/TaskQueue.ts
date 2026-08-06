import { Task, TaskPriority } from './types';
import { ILogger, Logger } from '@qimenjs/logger';
import { time, string } from '@qimenjs/utils';

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
export class GlobalTaskQueue {
    private taskQueue: Task[] = [];
    private maxConcurrentTasks: number;
    private isRunning: boolean = false;
    private static instance: GlobalTaskQueue | null = null;
    private logger: ILogger;

    /**
     * 构造函数 - 创建任务队列实例
     *
     * @param maxConcurrentTasks - 最大并发任务数，默认为5
     */
    constructor(maxConcurrentTasks: number = 5) {
        this.maxConcurrentTasks = maxConcurrentTasks;
        this.logger = Logger.for('GlobalTaskQueue');
    }

    /**
     * 获取任务队列的单例实例
     *
     * @param maxConcurrentTasks - 可选参数，指定最大并发任务数
     * @returns 返回任务队列的单例实例
     */
    public static getInstance(maxConcurrentTasks?: number): GlobalTaskQueue {
        if (!GlobalTaskQueue.instance) {
            GlobalTaskQueue.instance = new GlobalTaskQueue(maxConcurrentTasks);
        }
        return GlobalTaskQueue.instance;
    }

    /**
     * 根据优先级对任务队列进行排序
     *
     * @returns 排序后的任务数组
     * @private
     */
    private getSortedQueue(): Task[] {
        const priorityMap: { [key in TaskPriority]: number } = {
            HIGH: 1,
            NORMAL: 2,
            LOW: 3,
        };
        return this.taskQueue.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);
    }

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
    public addTask(
        fn: () => Promise<unknown>,
        priority: TaskPriority = 'NORMAL',
        maxRetries: number = 3,
        delay: number = 1000,
        isPolling: boolean = false,
        interval: number = 5000
    ): void {
        const task: Task = {
            id: string.getId('task-'),
            fn,
            retries: 0,
            maxRetries,
            delay,
            priority,
            isPolling,
            interval,
        };
        this.taskQueue.push(task);
        this.logger.debug(`Task added: ${task.id}, priority: ${task.priority}`);
        this.run();
    }

    /**
     * 处理任务的重试逻辑
     *
     * @param task - 需要重试的任务
     * @returns 如果任务将被重试则返回true，否则返回false
     * @private
     */
    private async handleTaskRetry(task: Task): Promise<boolean> {
        if (task.retries < task.maxRetries) {
            task.retries++;
            await time.after(task.delay, () =>
                this.addTask(
                    task.fn,
                    task.priority,
                    task.maxRetries,
                    task.delay,
                    task.isPolling,
                    task.interval
                )
            );
            return true;
        } else {
            this.logger.error(`Task ${task.id} exceeded max retries`);
            return false;
        }
    }

    /**
     * 处理轮询任务的重试逻辑
     *
     * @param task - 需要轮询的任务
     * @returns 如果任务将被重试则返回true，否则返回false
     * @private
     */
    private async handlePollingTask(task: Task): Promise<boolean> {
        if (task.retries < task.maxRetries) {
            task.retries++;
            await time.after(task.interval!, () =>
                this.addTask(
                    task.fn,
                    task.priority,
                    task.maxRetries,
                    task.delay,
                    task.isPolling,
                    task.interval
                )
            );
            return true;
        } else {
            this.logger.error(`Polling task ${task.id} exceeded max retries`);
            return false;
        }
    }

    /**
     * 执行任务
     *
     * @param task - 要执行的任务
     * @private
     */
    private async runTask(task: Task): Promise<void> {
        try {
            await task.fn();
            this.logger.debug(`Task executed: ${task.id}`);
            if (task.isPolling) {
                // 执行完后继续轮询
                this.handlePollingTask(task);
            }
        } catch (error) {
            this.logger.error(`Task failed: ${task.id}`, error);
            if (task.isPolling) {
                this.handlePollingTask(task);
            } else {
                this.handleTaskRetry(task);
            }
        }
    }

    /**
     * 执行队列中的任务
     *
     * @private
     */
    private async run(): Promise<void> {
        if (this.isRunning) {
            this.logger.debug('Task queue is already running');
            return;
        }
        this.isRunning = true;

        while (this.taskQueue.length > 0) {
            const sortedQueue = this.getSortedQueue();
            const tasksToRun = sortedQueue.splice(0, this.maxConcurrentTasks);
            this.logger.info(`Running ${tasksToRun.length} tasks concurrently`);

            await Promise.all(tasksToRun.map(task => this.runTask(task)));
        }

        this.isRunning = false;
        this.logger.debug('Task queue execution completed');
    }
}

// Export the global instance getter
export const globalTaskQueue = GlobalTaskQueue.getInstance();
