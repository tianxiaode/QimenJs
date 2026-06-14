"use strict";
/**
 * Worker模块的公共API导出
 *
 * 该模块提供了一个用于处理哈希计算任务的Worker管理解决方案，
 * 包括Worker句柄、Worker池、通信协议和脚本构建等功能。
 *
 * 核心组件：
 * - WorkerHandle: Worker句柄接口及实现
 * - WorkerPool: Worker池接口及实现
 * - HashWorkerProtocol: Worker通信协议定义
 * - WorkerScriptBuilder: Worker脚本构建器
 * - HashWorker: Node.js环境下的哈希计算Worker
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./HashWorkerProtocol"), exports);
__exportStar(require("./HashWorker"), exports);
__exportStar(require("./WorkerPool"), exports);
__exportStar(require("./WorkerHandle"), exports);
__exportStar(require("./WorkerScriptBuilder"), exports);
__exportStar(require("./DefaultWorkerHandle"), exports);
__exportStar(require("./BrowserWorkerHandle"), exports);
__exportStar(require("./DefaultWorkerPool"), exports);
__exportStar(require("./BrowserWorkerPool"), exports);
//# sourceMappingURL=index.js.map