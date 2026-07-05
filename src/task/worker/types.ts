/**
 * 消息处理函数类型
 *
 * 定义处理MessageEvent事件的函数类型
 */
type MessageHandler = (event: MessageEvent) => void;

/**
 * 错误处理函数类型
 *
 * 定义处理ErrorEvent事件的函数类型
 */
type ErrorHandler = (error: ErrorEvent) => void;

/**
 * 消息错误处理函数类型
 *
 * 定义处理MessageEvent类型错误的函数类型
 */
type MessageErrorHandler = (error: MessageEvent) => void;

/**
 * Worker管理器选项接口
 *
 * 定义Worker管理器的可选回调函数
 */
export interface WorkerManagerOptions {
    /** 接收到消息时的回调函数 */
    onMessage?: MessageHandler;
    /** 发生错误时的回调函数 */
    onError?: ErrorHandler;
    /** 消息传递错误时的回调函数 */
    onMessageError?: MessageErrorHandler;
}
