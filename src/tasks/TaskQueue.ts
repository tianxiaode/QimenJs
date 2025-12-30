import { Task, TaskPriority } from './types';

class GlobalTaskQueue {
  private taskQueue: Task[] = [];
  private maxConcurrentTasks: number;
  private isRunning: boolean = false;
  private static instance: GlobalTaskQueue | null = null;

  private constructor(maxConcurrentTasks: number = 5) {
    this.maxConcurrentTasks = maxConcurrentTasks;
  }

  public static getInstance(maxConcurrentTasks?: number): GlobalTaskQueue {
    if (!GlobalTaskQueue.instance) {
      GlobalTaskQueue.instance = new GlobalTaskQueue(maxConcurrentTasks);
    }
    return GlobalTaskQueue.instance;
  }

  private getSortedQueue(): Task[] {
    return this.taskQueue.sort((a, b) => {
      const priorityMap: { [key in TaskPriority]: number } = {
        HIGH: 1,
        NORMAL: 2,
        LOW: 3,
      };

      return priorityMap[a.priority] - priorityMap[b.priority];
    });
  }

  public addTask(
    fn: () => Promise<void>,
    priority: TaskPriority = 'NORMAL',
    maxRetries: number = 3,
    delay: number = 1000,
    isPolling: boolean = false,
    interval: number = 5000
  ): void {
    const task: Task = {
      id: `task-${Date.now()}`,
      fn,
      retries: 0,
      maxRetries,
      delay,
      priority,
      isPolling,
      interval,
    };
    this.taskQueue.push(task);
    this.run();
  }

  private async runTask(task: Task): Promise<void> {
    try {
      await task.fn();
      if (task.isPolling) {
        // 如果是轮询任务，执行完后再延迟一段时间后重新添加到队列
        if (task.retries < task.maxRetries) {
          task.retries++;
          setTimeout(() => {
            this.addTask(task.fn, task.priority, task.maxRetries, task.delay, task.isPolling, task.interval);
          }, task.interval);
        } else {
          console.error(`Polling task ${task.id} exceeded max retries`);
        }
      }
    } catch (error) {
      console.error(`Task failed: ${task.id}`, error);

      // Handle retries
      if (task.retries < task.maxRetries) {
        task.retries++;
        setTimeout(() => {
          this.addTask(task.fn, task.priority, task.maxRetries, task.delay, task.isPolling, task.interval);
        }, task.delay);
      } else {
        console.error(`Task ${task.id} exceeded max retries`);
      }
    }
  }

  private async run(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    // Sort tasks by priority before executing
    const sortedQueue = this.getSortedQueue();
    
    while (this.taskQueue.length > 0) {
      const tasksToRun = sortedQueue.splice(0, this.maxConcurrentTasks);

      await Promise.all(tasksToRun.map(task => this.runTask(task)));
    }

    this.isRunning = false;
  }
}

// Export the global instance getter
export const globalTaskQueue = GlobalTaskQueue.getInstance();
