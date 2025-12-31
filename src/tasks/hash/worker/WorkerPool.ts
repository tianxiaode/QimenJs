
import { WorkerHandle } from './WorkerHandle';

export interface WorkerPool {
  acquire(): Promise<WorkerHandle>;
  release(worker: WorkerHandle): void;
  destroy(): Promise<void>;
}
