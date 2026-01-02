import { TaskPriority } from "@orbitjs/tasks";
import { RequestOptions } from "./request";

/**
 * 轮询配置项
 */
export interface PollingOptions extends RequestOptions {
    interval?: number;       // 轮询间隔 (ms)
    priority?: TaskPriority; // 任务优先级
    maxRetries?: number;     // 单次请求失败后的重试次数
    retryDelay?: number;     // 重试延迟
}