export type PollingData = {
  timestamp: number;
  message: string;
};

export type TaskPriority = 'HIGH' | 'NORMAL' | 'LOW';

export interface Task {
  id: string;
  fn: () => Promise<void>;
  retries: number;
  maxRetries: number;
  delay: number;
  priority: TaskPriority;
  isPolling?: boolean;  // 用于标记是否是轮询任务
  interval?: number;    // 轮询间隔
}