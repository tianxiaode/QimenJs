"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashTaskRunner = void 0;
const logger_1 = require("@orbitjs/logger");
const worker_1 = require("../worker");
const HashTaskHealthMonitor_1 = require("./HashTaskHealthMonitor");
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
class HashTaskRunner {
    /**
     * 构造函数
     *
     * @param state 任务状态管理器
     * @param progress 任务进度管理器
     * @param resources 任务资源管理器
     * @param options 哈希任务选项
     */
    constructor(state, progress, resources, options) {
        this.state = state;
        this.progress = progress;
        this.resources = resources;
        this.options = options;
        this.builder = new worker_1.WorkerScriptBuilder();
        this.logger = logger_1.Logger.for("HashTaskRunner");
    }
    /**
     * 获取ChunkProvider的辅助属性，让代码更易读
     */
    get chunkProvider() {
        return this.options.chunkProvider;
    }
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
    async run() {
        this.logger.debug(`Starting hash task with algorithm: ${this.options.algorithm}`);
        const scriptSource = this.builder.build(this.options.algorithm);
        // 使用新定义的辅助属性计算内存
        const memoryRequired = this.calculateRequiredMemory();
        this.logger.debug(`Acquiring resources: memory=${(memoryRequired / 1024 / 1024).toFixed(2)}MB`);
        await this.resources.acquire(scriptSource, memoryRequired);
        const monitor = new HashTaskHealthMonitor_1.HashTaskHealthMonitor(this.state, this.progress, this.resources);
        monitor.start();
        try {
            // 注意：此时 State 的迁移需要符合你上传的 HashTaskState.ts 逻辑
            if (this.state.canStart()) {
                this.state.start();
            }
            return await this.executeHashing();
        }
        catch (err) {
            // 如果 state 有 fail 方法，在这里调用
            // this.state.fail(err);
            this.logger.error("Task failed:", err);
            throw err;
        }
        finally {
            this.logger.debug("Releasing resources and stopping monitor.");
            monitor.stop();
            await this.resources.release();
        }
    }
    /**
     * 暂停任务：通过状态机实现
     *
     * 检查当前状态是否允许暂停，如果允许则更新状态为暂停
     */
    pause() {
        if (this.state.canPause()) {
            this.state.pause();
        }
    }
    /**
     * 恢复任务：通过状态机实现
     *
     * 检查当前状态是否允许恢复，如果允许则更新状态为运行中
     */
    resume() {
        if (this.state.canResume()) {
            this.state.resume();
        }
    }
    /**
     * 取消任务：直接调用状态机的 cancel
     * 状态变更为 'cancelled' 后，executeHashing 循环中的 isCancelled() 会检测到并抛出异常
     *
     * 检查当前状态是否允许取消，如果允许则更新状态为已取消
     */
    cancel() {
        if (this.state.canCancel()) {
            this.state.cancel();
        }
    }
    /**
     * 等待任务恢复（如果处于暂停状态）
     *
     * 当任务处于暂停状态时，持续等待直到恢复运行或被取消
     *
     * @private
     */
    async waitIfPaused() {
        // ✅ 统一使用 state 判定，不再需要私有变量
        while (this.state.value === 'paused' && !this.state.isCancelled()) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
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
    async runChunk(worker, chunk) {
        return new Promise((resolve, reject) => {
            let unsubscribe;
            // 1. 定义处理器
            const handler = (msg) => {
                // 只响应当前 chunk 的确认消息
                if (msg.type === 'ack' && msg.chunkId === chunk.id) {
                    if (unsubscribe)
                        unsubscribe(); // ✨ 执行清理！
                    resolve();
                }
                else if (msg.type === 'error') {
                    if (unsubscribe)
                        unsubscribe(); // ✨ 出错也要清理！
                    reject(new Error(msg.message));
                }
            };
            // 2. 订阅消息
            unsubscribe = worker.onMessage(handler);
            // 3. 发送数据
            worker.post({ type: 'update', chunkId: chunk.id, data: chunk.data }, [chunk.data] // 零拷贝转移
            );
        });
    }
    /**
     * 完成哈希计算并获取最终结果
     *
     * 该方法向Worker发送完成信号并等待最终的哈希结果
     *
     * @param worker Worker句柄
     * @returns Promise<ArrayBuffer> 包含最终哈希结果的Promise
     * @private
     */
    async finalize(worker) {
        return new Promise((resolve, reject) => {
            let unsubscribe;
            const onMessage = (msg) => {
                if (msg.type === 'digest') {
                    if (unsubscribe)
                        unsubscribe(); // ✨ 清理
                    resolve(msg.result);
                }
            };
            unsubscribe = worker.onMessage(onMessage);
            worker.post({ type: 'final' });
        });
    }
    /**
     * 计算所需内存大小
     *
     * 根据数据块大小计算所需的内存，预留额外空间用于处理
     *
     * @returns 所需的内存大小（以字节为单位）
     * @private
     */
    calculateRequiredMemory() {
        // 所有的 Provider 现在都有这个方法了
        const chunkSize = this.chunkProvider.getChunkSize();
        // 预留 2 个分片 + 1MB 冗余
        return chunkSize * 2 + 1024 * 1024;
    }
    /**
     * 执行哈希计算的主要逻辑
     *
     * 主循环：获取数据块 -> 检查暂停/取消 -> 执行哈希 -> 更新进度 -> 继续下一块
     *
     * @returns Promise<ArrayBuffer> 包含最终哈希结果的Promise
     * @private
     */
    async executeHashing() {
        const worker = this.resources.getWorker();
        const provider = this.chunkProvider;
        while (provider.hasNext()) {
            // 1. 检查暂停
            await this.waitIfPaused();
            // 2. 检查取消
            if (this.state.isCancelled()) {
                throw new Error('Task cancelled');
            }
            const chunk = await provider.next();
            if (!chunk)
                break;
            // 3. 执行哈希
            await this.runChunk(worker, chunk);
            // 4. 更新进度
            this.progress.onChunk(chunk);
        }
        const result = await this.finalize(worker);
        // ✨ 完成后同步状态机
        if (this.state.canPause()) {
            // 此时状态通常是 running
            this.state.complete();
        }
        return result;
    }
}
exports.HashTaskRunner = HashTaskRunner;
//# sourceMappingURL=HashTaskRunner.js.map