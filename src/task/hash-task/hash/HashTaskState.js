"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashTaskState = void 0;
const errors_1 = require("../errors");
/**
 * 哈希任务状态管理类
 *
 * 管理哈希任务的整个生命周期状态，包括状态迁移验证和状态查询
 */
class HashTaskState {
    constructor() {
        this.status = 'idle';
    }
    /**
     * 获取当前任务状态
     */
    get value() {
        return this.status;
    }
    /* ---------------- 状态查询 ---------------- */
    /**
     * 检查是否可以开始任务
     *
     * @returns 如果当前状态为 'idle' 则返回 true，否则返回 false
     */
    canStart() {
        return this.status === 'idle';
    }
    /**
     * 检查是否可以暂停任务
     *
     * @returns 如果当前状态为 'running' 则返回 true，否则返回 false
     */
    canPause() {
        return this.status === 'running';
    }
    /**
     * 检查是否可以恢复任务
     *
     * @returns 如果当前状态为 'paused' 则返回 true，否则返回 false
     */
    canResume() {
        return this.status === 'paused';
    }
    /**
     * 检查是否可以取消任务
     *
     * @returns 如果当前状态为 'running' 或 'paused' 则返回 true，否则返回 false
     */
    canCancel() {
        return this.status === 'running' || this.status === 'paused';
    }
    /**
     * 检查任务是否已完成
     *
     * @returns 如果当前状态为 'completed'、'failed' 或 'cancelled' 则返回 true，否则返回 false
     */
    isFinished() {
        return (this.status === 'completed' || this.status === 'failed' || this.status === 'cancelled');
    }
    /**
     * 适配 Runner 的检查逻辑
     * 判断任务是否因为用户操作而进入了取消状态
     *
     * @returns 如果当前状态为 'cancelled' 则返回 true，否则返回 false
     */
    isCancelled() {
        return this.status === 'cancelled';
    }
    /* ---------------- 状态迁移 ---------------- */
    /**
     * 开始任务
     *
     * 将任务状态从 'idle' 迁移到 'running'，并记录开始时间
     *
     * @throws TaskStateError 如果当前状态不允许开始操作
     */
    start() {
        if (!this.canStart()) {
            throw new errors_1.TaskStateError(`Cannot start task from state "${this.status}"`, {
                current: this.status,
            });
        }
        this.status = 'running';
        this.startedAt = Date.now();
    }
    /**
     * 暂停任务
     *
     * 将任务状态从 'running' 迁移到 'paused'，并记录暂停时间
     *
     * @throws TaskStateError 如果当前状态不允许暂停操作
     */
    pause() {
        if (!this.canPause()) {
            throw new errors_1.TaskStateError(`Cannot pause task from state "${this.status}"`, {
                current: this.status,
            });
        }
        this.status = 'paused';
        this.pausedAt = Date.now();
    }
    /**
     * 恢复任务
     *
     * 将任务状态从 'paused' 迁移到 'running'，并清除暂停时间
     *
     * @throws TaskStateError 如果当前状态不允许恢复操作
     */
    resume() {
        if (!this.canResume()) {
            throw new errors_1.TaskStateError(`Cannot resume task from state "${this.status}"`, {
                current: this.status,
            });
        }
        this.status = 'running';
        this.pausedAt = undefined;
    }
    /**
     * 完成任务
     *
     * 将任务状态从 'running' 迁移到 'completed'，并记录完成时间
     *
     * @throws TaskStateError 如果当前状态不允许完成操作
     */
    complete() {
        // 修复：应该检查当前状态是否允许完成任务
        if (this.status !== 'running') {
            throw new errors_1.TaskStateError(`Cannot complete task from state "${this.status}"`, {
                current: this.status,
            });
        }
        this.status = 'completed';
        this.finishedAt = Date.now();
    }
    /**
     * 标记任务失败
     *
     * 将任务状态迁移到 'failed'，并记录完成时间
     *
     * @param error 失败的错误对象
     * @throws TaskStateError 如果当前状态不允许失败操作
     */
    fail(error) {
        if (this.isFinished()) {
            throw new errors_1.TaskStateError(`Cannot fail task from state "${this.status}"`, {
                current: this.status,
                error,
            });
        }
        this.status = 'failed';
        this.finishedAt = Date.now();
    }
    /**
     * 取消任务
     *
     * 将任务状态迁移到 'cancelled'，并记录完成时间
     *
     * @throws TaskStateError 如果当前状态不允许取消操作
     */
    cancel() {
        // 修复：应该检查当前状态是否允许取消任务
        if (!this.canCancel()) {
            throw new errors_1.TaskStateError(`Cannot cancel task from state "${this.status}"`, {
                current: this.status,
            });
        }
        this.status = 'cancelled';
        this.finishedAt = Date.now();
    }
    /* ---------------- 快照 ---------------- */
    /**
     * 生成当前状态的快照
     *
     * @returns 任务状态快照
     */
    snapshot() {
        return {
            status: this.status,
            startedAt: this.startedAt,
            finishedAt: this.finishedAt,
            pausedAt: this.pausedAt,
        };
    }
    /**
     * 适配 Runner 的状态更新逻辑
     * 将状态迁移封装一层，方便 Runner 调用
     *
     * @param newStatus 新的任务状态
     */
    updateStatus(newStatus) {
        // 简单的状态映射或直接赋值（如果外部已经校验过逻辑）
        switch (newStatus) {
            case 'running':
                if (this.canStart())
                    this.start();
                break;
            case 'cancelled':
                if (this.canCancel())
                    this.cancel();
                break;
            // ... 其他状态映射
        }
    }
}
exports.HashTaskState = HashTaskState;
//# sourceMappingURL=HashTaskState.js.map