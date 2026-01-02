import { TaskPriority } from "@orbitjs/tasks";
import { RequestOptions } from "./request";

/**
 * 轮询配置项接口
 * 扩展了 RequestOptions 接口，增加了轮询相关的配置选项
 */
export interface PollingOptions extends RequestOptions {
    /**
     * 轮询间隔时间，单位毫秒
     */
    interval?: number;       
    /**
     * 任务优先级，用于控制轮询任务的执行优先级
     */
    priority?: TaskPriority; 
    /**
     * 单次请求失败后的最大重试次数
     */
    maxRetries?: number;     
    /**
     * 重试延迟时间，单位毫秒
     */
    retryDelay?: number;     
}