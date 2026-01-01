import { WorkerHandle } from './WorkerHandle';

export class BrowserWorkerHandle implements WorkerHandle {
    private worker: Worker;
    public readonly id: string;

    constructor(workerScriptUrl: string) {
        this.id = `worker-${Math.random().toString(36).substr(2, 9)}`;
        this.worker = new Worker(workerScriptUrl);
    }

    // 这里的实现解决了你担心的 removeEventListener 问题
    post<T = any>(message: T, transfer?: Transferable[]): void {
        this.worker.postMessage(message, transfer || []);
    }

    onMessage(handler: (msg: any) => void): () => void {
        const wrapper = (e: MessageEvent) => handler(e.data);
        this.worker.addEventListener('message', wrapper);

        // 返回一个清理函数，这就是我们之前讨论的“自清理”模式
        return () => this.worker.removeEventListener('message', wrapper);
    }

    onError(handler: (err: Error) => void): () => void {
        const wrapper = (e: ErrorEvent) => handler(new Error(e.message));
        this.worker.addEventListener('error', wrapper);
        return () => this.worker.removeEventListener('error', wrapper);
    }

    async terminate(): Promise<void> {
        this.worker.terminate();
    }

    isAlive(): boolean {
        return !!this.worker;
    }
}
