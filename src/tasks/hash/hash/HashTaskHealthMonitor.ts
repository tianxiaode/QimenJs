
import { HashTaskState } from './HashTaskState';
import { HashTaskProgress } from './HashTaskProgress';
import { HashTaskResources } from './HashTaskResources';

export type HealthEvent =
  | { type: 'stalled'; durationMs: number }
  | { type: 'worker_unresponsive' }
  | { type: 'resource_leak' };

type HealthListener = (event: HealthEvent) => void;

export interface HealthMonitorOptions {
  /** 多久未推进进度视为卡死 */
  stallThresholdMs?: number;
  /** 轮询间隔 */
  intervalMs?: number;
}

/**
 * HashTaskHealthMonitor 只做监控与判断：
 * ⏱ 是否长时间无进展
 * 🧵 Worker 是否假活着
 * 🧠 内存是否未释放
 * ⚠ 是否触发 fail-fast
 * ❌ 不直接 cancel
 * ❌ 不直接 retry
 * ❌ 不做 UI
 * ❌ 不做日志聚合
 * 👉 它只 发出“健康事件”。
 */

export class HashTaskHealthMonitor {
  private listeners = new Set<HealthListener>();
  private timer?: NodeJS.Timeout;

  private lastProgressBytes = 0;
  private lastProgressTime = Date.now();

  private readonly stallThresholdMs: number;
  private readonly intervalMs: number;

  constructor(
    private readonly state: HashTaskState,
    private readonly progress: HashTaskProgress,
    private readonly resources: HashTaskResources,
    options: HealthMonitorOptions = {}
  ) {
    this.stallThresholdMs = options.stallThresholdMs ?? 10_000;
    this.intervalMs = options.intervalMs ?? 1_000;
  }

  start(): void {
    if (this.timer) return;

    this.timer = setInterval(() => this.check(), this.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  onEvent(listener: HealthListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: HealthEvent): void {
    this.listeners.forEach(fn => fn(event));
  }

  private check(): void {
    const now = Date.now();
    const stateValue = this.state.value;
    const progressSnap = this.progress.snapshot();
    const resourceSnap = this.resources.snapshot();

    // ===== 1. Progress stall detection =====
    if (stateValue === 'running') {
      if (progressSnap.processedBytes !== this.lastProgressBytes) {
        this.lastProgressBytes = progressSnap.processedBytes;
        this.lastProgressTime = now;
      } else {
        const stalledFor = now - this.lastProgressTime;
        if (stalledFor > this.stallThresholdMs) {
          this.emit({ type: 'stalled', durationMs: stalledFor });

          if (resourceSnap.hasWorker) {
            this.emit({ type: 'worker_unresponsive' });
          }

          // 防止重复刷事件
          this.lastProgressTime = now;
        }
      }
    }

    // ===== 2. Resource leak detection =====
    if (
      (stateValue === 'completed' ||
        stateValue === 'failed' ||
        stateValue === 'cancelled') &&
      resourceSnap.hasWorker
    ) {
      this.emit({ type: 'resource_leak' });
    }
  }
}
