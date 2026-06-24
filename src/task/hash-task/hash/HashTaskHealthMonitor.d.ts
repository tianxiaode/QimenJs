import { HashTaskState } from './HashTaskState';
import { HashTaskProgress } from './HashTaskProgress';
import { HashTaskResources } from './HashTaskResources';
/**
 * 健康事件联合类型
 *
 * 定义了任务健康监控可能检测到的各种事件
 */
export type HealthEvent = {
    /** 任务卡死事件 */
    type: 'stalled';
    /** 卡死持续时间（毫秒） */
    durationMs: number;
} | {
    /** Worker无响应事件 */
    type: 'worker_unresponsive';
} | {
    /** 资源泄漏事件 */
    type: 'resource_leak';
};
/**
 * 健康事件监听器类型
 *
 * 定义了处理健康事件的回调函数类型
 */
type HealthListener = (event: HealthEvent) => void;
/**
 * 健康监控选项接口
 *
 * 定义了健康监控的配置选项
 */
export interface HealthMonitorOptions {
    /** 多久未推进进度视为卡死，默认为10秒 */
    stallThresholdMs?: number;
    /** 轮询间隔，默认为1秒 */
    intervalMs?: number;
}
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
export declare class HashTaskHealthMonitor {
    private readonly state;
    private readonly progress;
    private readonly resources;
    private listeners;
    private timer?;
    private lastProgressBytes;
    private lastProgressTime;
    private readonly stallThresholdMs;
    private readonly intervalMs;
    /**
     * 构造函数
     *
     * @param state 任务状态管理器
     * @param progress 任务进度管理器
     * @param resources 任务资源管理器
     * @param options 健康监控选项
     */
    constructor(state: HashTaskState, progress: HashTaskProgress, resources: HashTaskResources, options?: HealthMonitorOptions);
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
    start(): void;
    /**
     * 停止健康监控
     *
     * 清除定时器，停止健康检查
     */
    stop(): void;
    /**
     * 添加健康事件监听器
     *
     * @param listener 健康事件监听器
     * @returns 用于移除监听器的函数
     */
    onEvent(listener: HealthListener): () => void;
    /**
     * 触发健康事件
     *
     * @param event 健康事件
     * @private
     */
    private emit;
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
    private check;
}
export {};
//# sourceMappingURL=HashTaskHealthMonitor.d.ts.map