import { TaskStateError } from '../errors';
import { TaskStatus } from '../types';

/**
 * HashTaskState 只做 3 件事：
 * 维护任务状态机
 * 校验状态迁移是否合法
 * 提供只读快照
 * ❌ 它 不：
 * 不 async
 * 不操作资源
 * 不 log
 * 不 throw 原始 Error（只 throw 语义化 Error）
 */
export interface TaskStateSnapshot {
    status: TaskStatus;
    startedAt?: number;
    finishedAt?: number;
    pausedAt?: number;
}

export class HashTaskState {
    private status: TaskStatus = 'idle';

    private startedAt?: number;
    private finishedAt?: number;
    private pausedAt?: number;

    get value(): TaskStatus {
        return this.status;
    }

    /* ---------------- 状态查询 ---------------- */

    canStart(): boolean {
        return this.status === 'idle';
    }

    canPause(): boolean {
        return this.status === 'running';
    }

    canResume(): boolean {
        return this.status === 'paused';
    }

    canCancel(): boolean {
        return this.status === 'running' || this.status === 'paused';
    }

    isFinished(): boolean {
        return (
            this.status === 'completed' || this.status === 'failed' || this.status === 'cancelled'
        );
    }

    /**
     * 适配 Runner 的检查逻辑
     * 判断任务是否因为用户操作而进入了取消状态
     */
    isCancelled(): boolean {
        return this.status === 'cancelled';
    }

    /* ---------------- 状态迁移 ---------------- */

    start(): void {
        if (!this.canStart()) {
            throw new TaskStateError(`Cannot start task from state "${this.status}"`, {
                current: this.status,
            });
        }

        this.status = 'running';
        this.startedAt = Date.now();
    }

    pause(): void {
        if (!this.canPause()) {
            throw new TaskStateError(`Cannot pause task from state "${this.status}"`, {
                current: this.status,
            });
        }

        this.status = 'paused';
        this.pausedAt = Date.now();
    }

    resume(): void {
        if (!this.canResume()) {
            throw new TaskStateError(`Cannot resume task from state "${this.status}"`, {
                current: this.status,
            });
        }

        this.status = 'running';
        this.pausedAt = undefined;
    }

    complete(): void {
        if (!this.canPause()) {
            throw new TaskStateError(`Cannot complete task from state "${this.status}"`, {
                current: this.status,
            });
        }

        this.status = 'completed';
        this.finishedAt = Date.now();
    }

    fail(error: Error): void {
        if (this.isFinished()) {
            throw new TaskStateError(`Cannot fail task from state "${this.status}"`, {
                current: this.status,
                error,
            });
        }

        this.status = 'failed';
        this.finishedAt = Date.now();
    }

    cancel(): void {
        if (this.canCancel()) {
            throw new TaskStateError(`Cannot cancel task from state "${this.status}"`, {
                current: this.status,
            });
        }

        this.status = 'cancelled';
        this.finishedAt = Date.now();
    }

    /* ---------------- 快照 ---------------- */

    snapshot(): TaskStateSnapshot {
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
     */
    updateStatus(newStatus: TaskStatus): void {
        // 简单的状态映射或直接赋值（如果外部已经校验过逻辑）
        switch (newStatus) {
            case 'running':
                if (this.canStart()) this.start();
                break;
            case 'cancelled':
                if (this.canCancel()) this.cancel();
                break;
            // ... 其他状态映射
        }
    }
}
