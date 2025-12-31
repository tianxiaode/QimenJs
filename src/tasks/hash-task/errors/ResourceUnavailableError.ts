import { ErrorBase } from "@orbitjs/error";

export class ResourceUnavailableError extends ErrorBase {
  constructor(
    resource: 'memory' | 'worker',
    context?: Record<string, any>
  ) {
    super(
      `${resource} unavailable`,
      'RESOURCE_UNAVAILABLE',
      { resource, ...context }
    );
  }
}
