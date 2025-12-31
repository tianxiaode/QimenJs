import { ErrorBase } from "@orbitjs/error";

export class TaskAbortedError extends ErrorBase {
  constructor(context?: Record<string, any>) {
    super('Task aborted', 'TASK_ABORTED', context);
  }
}
