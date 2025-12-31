export type TaskStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface TaskSnapshot {
  status: TaskStatus
  progress: number      // 0~1
  memoryUsed: number
}

export interface IHashTask {
  start(): Promise<void>
  pause(): void
  resume(): void
  cancel(): void

  snapshot(): TaskSnapshot
}
