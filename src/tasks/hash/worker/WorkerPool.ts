
import { WorkerHandle } from './WorkerHandle';

export interface WorkerPool {
  acquire(scriptSource: string): Promise<WorkerHandle>;
  release(worker: WorkerHandle): void;
  destroy(): Promise<void>;
}
