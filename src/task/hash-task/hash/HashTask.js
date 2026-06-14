"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashTask = void 0;
const HashTaskProgress_1 = require("./HashTaskProgress");
const HashTaskRunner_1 = require("./HashTaskRunner");
const HashTaskState_1 = require("./HashTaskState");
const HashTaskResources_1 = require("./HashTaskResources");
/**
 * 哈希任务类
 *
 * 用于处理大文件或数据流的哈希计算任务，支持进度监控、暂停/恢复/取消操作
 *
 * 设计原则：
 * - 仅负责任务的生命周期管理
 * - 串联各个组件（State, Progress, Resources, Runner）
 * - 提供统一的外部接口
 *
 * 明确不负责：
 * - 不执行具体的哈希计算（由Runner和Worker负责）
 * - 不管理内存（由MemoryManager负责）
 * - 不调度Worker（由WorkerPool负责）
 *
 * @example
 * ```ts
 * const task = new HashTask({
 *   algorithm: 'sha256',
 *   chunkProvider: new FileChunkProvider(file),
 *   memoryManager: new MemoryManager(),
 *   workerPool: new BrowserWorkerPool(),
 * });
 *
 * task.onProgress((snapshot) => {
 *   console.log(`Progress: ${snapshot.percentage}%`);
 * });
 *
 * task.start();
 * const result = await task.result();
 * ```
 */
class HashTask {
    /**
     * 构造函数
     *
     * 初始化哈希任务的各项组件和状态
     *
     * @param options 哈希任务配置选项
     */
    constructor(options) {
        this.options = options;
        this.state = new HashTaskState_1.HashTaskState();
        this.progress = new HashTaskProgress_1.HashTaskProgress();
        this.progressListeners = new Set();
        this.state = new HashTaskState_1.HashTaskState();
        this.progress = new HashTaskProgress_1.HashTaskProgress();
        const totalSize = options.chunkProvider.getTotalSize();
        this.progress.init(totalSize);
        this.resources = new HashTaskResources_1.HashTaskResources(options.memoryManager, options.workerPool);
        this.runner = new HashTaskRunner_1.HashTaskRunner(this.state, this.progress, this.resources, options);
        this.resultPromise = new Promise((resolve, reject) => {
            this.resolveResult = resolve;
            this.rejectResult = reject;
        });
    }
    /**
     * 启动任务
     *
     * 开始执行哈希计算任务，并启动进度轮询机制
     */
    async start() {
        try {
            const result = await this.runner.run();
            this.resolveResult(result);
        }
        catch (err) {
            // 这里的处理逻辑会立刻被测试捕获
            this.rejectResult(err);
            // 如果需要让外部也感知到错误，可以继续 throw
            throw err;
        }
        finally {
            this.startProgressPolling();
        }
    }
    /**
     * 暂停任务
     *
     * 暂停当前正在执行的哈希计算任务
     */
    pause() {
        this.runner.pause();
    }
    /**
     * 恢复任务
     *
     * 恢复之前暂停的哈希计算任务
     */
    resume() {
        this.runner.resume();
    }
    /**
     * 取消任务
     *
     * 取消当前正在执行的哈希计算任务
     */
    cancel() {
        this.runner.cancel();
    }
    /**
     * 获取最终 hash 结果
     *
     * 返回一个Promise，当任务完成时包含哈希计算结果
     *
     * @returns 包含哈希结果的Promise
     */
    result() {
        return this.resultPromise;
    }
    /**
     * 订阅进度
     *
     * 添加进度监听器，当任务进度更新时会调用监听器
     *
     * @param listener 进度监听器函数
     * @returns 用于取消监听的函数
     */
    onProgress(listener) {
        this.progressListeners.add(listener);
        return () => this.progressListeners.delete(listener);
    }
    /**
     * 轮询推送进度（简单稳定）
     *
     * 启动一个定时器，定期向所有进度监听器发送进度更新
     *
     * @private
     */
    startProgressPolling() {
        const tick = () => {
            if (this.state.value === 'completed' ||
                this.state.value === 'failed' ||
                this.state.value === 'cancelled') {
                return;
            }
            const snapshot = this.progress.snapshot();
            this.progressListeners.forEach(fn => fn(snapshot));
            setTimeout(tick, 200);
        };
        tick();
    }
}
exports.HashTask = HashTask;
//# sourceMappingURL=HashTask.js.map