/**
 * 轮询任务数据接口
 * 
 * 定义了轮询任务的数据结构，包含时间戳和消息内容
 */
export type PollingData = {
  /** 轮询发生的时间戳 */
  timestamp: number;
  /** 轮询任务的消息内容 */
  message: string;
};

/**
 * 任务优先级类型
 * 
 * 定义了任务的三种优先级：高、普通、低
 */
export type TaskPriority = 'HIGH' | 'NORMAL' | 'LOW';

/**
 * 任务接口
 * 
 * 定义了任务的基本结构，包括任务ID、执行函数、重试信息、优先级等
 */
export interface Task {
  /** 任务唯一标识符 */
  id: string;
  /** 任务执行函数，返回Promise */
  fn: () => Promise<unknown>;
  /** 当前重试次数 */
  retries: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试延迟时间（毫秒） */
  delay: number;
  /** 任务优先级 */
  priority: TaskPriority;
  /** 用于标记是否是轮询任务 */
  isPolling?: boolean;
  /** 轮询间隔时间（毫秒） */
  interval?: number;
}