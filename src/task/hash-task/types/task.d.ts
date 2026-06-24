/**
 * 任务状态类型
 *
 * 定义了任务可能处于的各种状态
 */
export type TaskStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
/**
 * 任务快照接口
 *
 * 定义了任务当前状态的快照信息
 */
export interface TaskSnapshot {
    /** 任务当前状态 */
    status: TaskStatus;
    /** 任务进度，范围为0到1 */
    progress: number;
    /** 已使用的内存大小 */
    memoryUsed: number;
}
/**
 * 哈希任务接口
 *
 * 定义了哈希任务应实现的基本方法和属性
 */
export interface IHashTask {
    /** 启动任务 */
    start(): Promise<void>;
    /** 暂停任务 */
    pause(): void;
    /** 恢复任务 */
    resume(): void;
    /** 取消任务 */
    cancel(): void;
    /** 获取任务快照 */
    snapshot(): TaskSnapshot;
}
//# sourceMappingURL=task.d.ts.map