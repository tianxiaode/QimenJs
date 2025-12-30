export class WorkerManager {
    private worker: Worker | null = null;
    private scriptUrl: string;
    private messageHandler: (data: any) => void;
    private errorHandler: (error: any) => void;

    constructor(scriptUrl: string) {
        this.scriptUrl = scriptUrl;
        this.messageHandler = () => {};
        this.errorHandler = () => {};
    }

    public onMessage(callback: (data: any) => void): void {
        this.messageHandler = callback;
    }

    public onError(callback: (error: any) => void): void {
        this.errorHandler = callback;
    }

    public start(): void {
        if (this.worker) return;

        this.worker = new Worker(this.scriptUrl);

        this.worker.onmessage = e => this.messageHandler(e.data);
        this.worker.onerror = e => {
            this.errorHandler(e);
            this.stop();
        };
    }

    public postMessage(message: any): void {
        if (this.worker) {
            this.worker.postMessage(message);
        }
    }

    public stop(): void {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}
