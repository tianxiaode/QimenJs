import { ILogger, Logger } from "@orbitjs/logger";

export abstract class WorkerManagerBase {
  protected worker: Worker | null = null;
  protected logger: ILogger;

  constructor(protected url: string) {
    this.logger = Logger.for(this.constructor.name);
  }

  start() {
    if (this.worker) return;
    this.worker = new Worker(this.url);
    this.worker.onmessage = this.onMessage.bind(this);
    this.worker.onerror = this.onError.bind(this);
    this.worker.onmessageerror = this.onMessageError.bind(this);
  }

  stop() {
    this.worker?.terminate();
    this.worker = null;
  }

  protected post(data: any) {
    this.worker?.postMessage(data);
  }

  protected abstract onMessage(event: MessageEvent): void;

  protected onError(error: ErrorEvent) {
    this.logger.error(error);
  }

  protected onMessageError(error: MessageEvent) {
    this.logger.error(error);
  }
}
