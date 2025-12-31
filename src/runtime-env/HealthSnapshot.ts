import { MemoryManager } from './memory'
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

export class HealthMonitor {
  constructor(private deps: { memory: MemoryManager }) {}

  snapshot() {
    const mem = this.deps.memory.snapshot()

    const pressure = mem.used > mem.highWatermark

    let status: HealthStatus = 'healthy'
    if (pressure) status = 'degraded'
    if (mem.used > mem.max * 0.95) status = 'unhealthy'

    return {
      status,
      memory: {
        used: mem.used,
        max: mem.max,
        pressure,
      },
      timestamp: Date.now(),
    }
  }
}
