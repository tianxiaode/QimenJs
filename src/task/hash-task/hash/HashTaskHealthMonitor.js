"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashTaskHealthMonitor = void 0;
/**
 * HashTaskHealthMonitor类
 *
 * 该类只负责监控与判断：
 * - 是否长时间无进展
 * - Worker 是否假活着
 * - 内存是否未释放
 * - 是否触发 fail-fast
 *
 * 明确不负责：
 * - 不直接取消任务
 * - 不直接重试
 * - 不处理UI
 * - 不做日志聚合
 *
 * 它只发出"健康事件"。
 *
 * 设计原则：
 * - 只负责监控和判断
 * - 不直接干预任务执行
 * - 通过事件机制通知外部
 */
class HashTaskHealthMonitor {
    /**
     * 构造函数
     *
     * @param state 任务状态管理器
     * @param progress 任务进度管理器
     * @param resources 任务资源管理器
     * @param options 健康监控选项
     */
    constructor(state, progress, resources, options = {}) {
        var _a, _b;
        this.state = state;
        this.progress = progress;
        this.resources = resources;
        this.listeners = new Set();
        this.lastProgressBytes = 0;
        this.lastProgressTime = Date.now();
        this.stallThresholdMs = (_a = options.stallThresholdMs) !== null && _a !== void 0 ? _a : 10000;
        this.intervalMs = (_b = options.intervalMs) !== null && _b !== void 0 ? _b : 1000;
    }
    /**
     * 开始健康监控
     *
     * 启动定时器，定期检查任务健康状态
     *
     * 检查包括：
     * - 任务进度是否卡死
     * - Worker是否无响应
     * - 资源是否泄漏
     */
    start() {
        if (this.timer)
            return;
        this.timer = setInterval(() => this.check(), this.intervalMs);
    }
    /**
     * 停止健康监控
     *
     * 清除定时器，停止健康检查
     */
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }
    /**
     * 添加健康事件监听器
     *
     * @param listener 健康事件监听器
     * @returns 用于移除监听器的函数
     */
    onEvent(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    /**
     * 触发健康事件
     *
     * @param event 健康事件
     * @private
     */
    emit(event) {
        this.listeners.forEach(fn => fn(event));
    }
    /**
     * 执行健康检查
     *
     * 检查任务进度是否卡死、资源是否泄漏等情况
     *
     * 检查内容包括：
     * 1. 进度卡死检测：检查任务是否在stallThresholdMs时间内无进展
     * 2. 资源泄漏检测：检查任务结束后资源是否被正确释放
     *
     * @private
     */
    check() {
        const now = Date.now();
        const stateValue = this.state.value;
        const progressSnap = this.progress.snapshot();
        const resourceSnap = this.resources.snapshot();
        // ===== 1. 检测进度卡死 =====
        if (stateValue === 'running') {
            if (progressSnap.processedBytes !== this.lastProgressBytes) {
                this.lastProgressBytes = progressSnap.processedBytes;
                this.lastProgressTime = now;
            }
            else {
                const stalledFor = now - this.lastProgressTime;
                if (stalledFor > this.stallThresholdMs) {
                    this.emit({ type: 'stalled', durationMs: stalledFor });
                    if (resourceSnap.hasWorker) {
                        this.emit({ type: 'worker_unresponsive' });
                    }
                    // 防止重复刷事件
                    this.lastProgressTime = now;
                }
            }
        }
        // ===== 2. 检测资源泄漏 =====
        if ((stateValue === 'completed' || stateValue === 'failed' || stateValue === 'cancelled') &&
            resourceSnap.hasWorker) {
            this.emit({ type: 'resource_leak' });
        }
    }
}
exports.HashTaskHealthMonitor = HashTaskHealthMonitor;
//# sourceMappingURL=HashTaskHealthMonitor.js.map