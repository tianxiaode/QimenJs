import { ErrorBase } from "@orbitjs/error";

export class TaskStateError extends ErrorBase {
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    super(message, 'TASK_STATE_ERROR', context);
  }
}
