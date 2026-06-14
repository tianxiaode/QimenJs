"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleWorkerManager = void 0;
const WorkerManagerBase_1 = require("./WorkerManagerBase");
/**
 * SimpleWorkerManager 是一个简化版的 Web Worker 管理器
 *
 * 它基于 WorkerManagerBase 实现，通过构造函数传入的回调函数来处理消息和错误
 * 遵循"配置优于继承"的设计原则，支持通过 WorkerManagerOptions 配置回调函数
 */
class SimpleWorkerManager extends WorkerManagerBase_1.WorkerManagerBase {
    /**
     * 构造函数
     *
     * @param url Worker 脚本的 URL
     * @param handlers 可选的回调函数集合，包括 onMessage、onError、onMessageError
     */
    constructor(url, handlers = {}) {
        super(url);
        this.handlers = handlers;
    }
    /**
     * 处理从 Worker 接收到的消息
     *
     * 如果提供了 onMessage 回调函数，则调用它
     *
     * @param event MessageEvent 事件对象
     */
    onMessage(event) {
        var _a, _b;
        (_b = (_a = this.handlers).onMessage) === null || _b === void 0 ? void 0 : _b.call(_a, event);
    }
    /**
     * 处理 Worker 的错误事件
     *
     * 如果提供了 onError 回调函数，则调用它
     * 同时调用父类的错误处理方法以保持默认行为
     *
     * @param error ErrorEvent 事件对象
     */
    onError(error) {
        var _a, _b;
        (_b = (_a = this.handlers).onError) === null || _b === void 0 ? void 0 : _b.call(_a, error);
        super.onError(error);
    }
    /**
     * 处理 Worker 消息传递过程中的错误
     *
     * 如果提供了 onMessageError 回调函数，则调用它
     * 同时调用父类的错误处理方法以保持默认行为
     *
     * @param error MessageEvent 事件对象
     */
    onMessageError(error) {
        var _a, _b;
        (_b = (_a = this.handlers).onMessageError) === null || _b === void 0 ? void 0 : _b.call(_a, error);
        super.onMessageError(error);
    }
}
exports.SimpleWorkerManager = SimpleWorkerManager;
//# sourceMappingURL=SimpleWorkerManager.js.map