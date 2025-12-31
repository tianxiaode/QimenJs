
type MessageHandler = (event: MessageEvent) => void;
type ErrorHandler = (error: ErrorEvent) => void;
type MessageErrorHandler = (error: MessageEvent) => void;

export interface WorkerManagerOptions {
    onMessage?: MessageHandler;
    onError?: ErrorHandler;
    onMessageError?: MessageErrorHandler;
}

