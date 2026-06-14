import { TaskStatus } from '../types';
/**
 * HashTaskState 只做 3 件事：
 * - 维护任务状态机
 * - 校验状态迁移是否合法
 * - 提供只读快照
 *
 * 明确不负责：
 * - 不处理异步操作
 * - 不操作资源
 * - 不记录日志
 * - 不抛出原始Error（只抛出语义化Error）
 */
/**
 * 任务状态快照接口
 *
 * 定义了任务状态的快照信息
 */
export interface TaskStateSnapshot {
    /** 当前任务状态 */
    status: TaskStatus;
    /** 开始时间戳（可选） */
    startedAt?: number;
    /** 完成时间戳（可选） */
    finishedAt?: number;
    /** 暂停时间戳（可选） */
    pausedAt?: number;
}
/**
 * 哈希任务状态管理类
 *
 * 管理哈希任务的整个生命周期状态，包括状态迁移验证和状态查询
 */
export declare class HashTaskState {
    private status;
    private startedAt?;
    private finishedAt?;
    private pausedAt?;
    /**
     * 获取当前任务状态
     */
    get value(): TaskStatus;
    /**
     * 检查是否可以开始任务
     *
     * @returns 如果当前状态为 'idle' 则返回 true，否则返回 false
     */
    canStart(): boolean;
    /**
     * 检查是否可以暂停任务
     *
     * @returns 如果当前状态为 'running' 则返回 true，否则返回 false
     */
    canPause(): boolean;
    /**
     * 检查是否可以恢复任务
     *
     * @returns 如果当前状态为 'paused' 则返回 true，否则返回 false
     */
    canResume(): boolean;
    /**
     * 检查是否可以取消任务
     *
     * @returns 如果当前状态为 'running' 或 'paused' 则返回 true，否则返回 false
     */
    canCancel(): boolean;
    /**
     * 检查任务是否已完成
     *
     * @returns 如果当前状态为 'completed'、'failed' 或 'cancelled' 则返回 true，否则返回 false
     */
    isFinished(): boolean;
    /**
     * 适配 Runner 的检查逻辑
     * 判断任务是否因为用户操作而进入了取消状态
     *
     * @returns 如果当前状态为 'cancelled' 则返回 true，否则返回 false
     */
    isCancelled(): boolean;
    /**
     * 开始任务
     *
     * 将任务状态从 'idle' 迁移到 'running'，并记录开始时间
     *
     * @throws TaskStateError 如果当前状态不允许开始操作
     */
    start(): void;
    /**
     * 暂停任务
     *
     * 将任务状态从 'running' 迁移到 'paused'，并记录暂停时间
     *
     * @throws TaskStateError 如果当前状态不允许暂停操作
     */
    pause(): void;
    /**
     * 恢复任务
     *
     * 将任务状态从 'paused' 迁移到 'running'，并清除暂停时间
     *
     * @throws TaskStateError 如果当前状态不允许恢复操作
     */
    resume(): void;
    /**
     * 完成任务
     *
     * 将任务状态从 'running' 迁移到 'completed'，并记录完成时间
     *
     * @throws TaskStateError 如果当前状态不允许完成操作
     */
    complete(): void;
    /**
     * 标记任务失败
     *
     * 将任务状态迁移到 'failed'，并记录完成时间
     *
     * @param error 失败的错误对象
     * @throws TaskStateError 如果当前状态不允许失败操作
     */
    fail(error: Error): void;
    /**
     * 取消任务
     *
     * 将任务状态迁移到 'cancelled'，并记录完成时间
     *
     * @throws TaskStateError 如果当前状态不允许取消操作
     */
    cancel(): void;
    /**
     * 生成当前状态的快照
     *
     * @returns 任务状态快照
     */
    snapshot(): TaskStateSnapshot;
    /**
     * 适配 Runner 的状态更新逻辑
     * 将状态迁移封装一层，方便 Runner 调用
     *
     * @param newStatus 新的任务状态
     */
    updateStatus(newStatus: TaskStatus): void;
}
//# sourceMappingURL=HashTaskState.d.ts.map