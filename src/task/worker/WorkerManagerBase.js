"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerManagerBase = void 0;
const logger_1 = require("@orbitjs/logger");
/**
 * Worker管理器基类
 *
 * 提供了Web Worker管理的基础功能，包括启动、停止、消息处理等。
 * 使用抽象类设计，具体的onMessage处理需要子类实现。
 *
 * @example
 * ```ts
 * class MyWorkerManager extends WorkerManagerBase {
 *   constructor(url: string) {
 *     super(url);
 *   }
 *
 *   protected onMessage(event: MessageEvent) {
 *     console.log('Received message from worker:', event.data);
 *   }
 * }
 * ```
 */
class WorkerManagerBase {
    /**
     * 构造函数
     *
     * @param url Worker脚本的URL
     */
    constructor(url) {
        this.url = url;
        /** Worker实例，可能为空 */
        this.worker = null;
        this.logger = logger_1.Logger.for(this.constructor.name);
    }
    /**
     * 启动Worker
     *
     * 创建Worker实例并绑定消息和错误处理函数。
     * 如果Worker已经启动，则不执行任何操作。
     */
    start() {
        if (this.worker)
            return;
        this.worker = new Worker(this.url);
        this.worker.onmessage = this.onMessage.bind(this);
        this.worker.onerror = this.onError.bind(this);
        this.worker.onmessageerror = this.onMessageError.bind(this);
    }
    /**
     * 停止Worker
     *
     * 终止Worker实例并将其设置为null。
     */
    stop() {
        var _a;
        (_a = this.worker) === null || _a === void 0 ? void 0 : _a.terminate();
        this.worker = null;
    }
    /**
     * 向Worker发送消息
     *
     * @param data 要发送的数据
     */
    post(data) {
        var _a;
        (_a = this.worker) === null || _a === void 0 ? void 0 : _a.postMessage(data);
    }
    /**
     * 处理Worker错误
     *
     * 记录错误信息到日志。
     *
     * @param error ErrorEvent对象，包含错误信息
     */
    onError(error) {
        this.logger.error(error);
    }
    /**
     * 处理Worker消息传递错误
     *
     * 记录消息传递错误信息到日志。
     *
     * @param error MessageEvent对象，包含错误信息
     */
    onMessageError(error) {
        this.logger.error(error);
    }
}
exports.WorkerManagerBase = WorkerManagerBase;
//# sourceMappingURL=WorkerManagerBase.js.map